import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,byHobby} from './catalog.mjs?v=06';
import {initial,record,totalXp,load,key,unlocks} from './state.mjs?v=08';
import {checkpoints,mapProgress,gameMapPage,resetMapSession,missionDone,stationState,plannedExpedition,masterpieceDone,summitTarget,mapContext} from './game-map.mjs';

const day='2026-11-25';
const memory=()=>{const data={};return {data,getItem:name=>data[name]??null,setItem:(name,value)=>{data[name]=value;}};};
const store=state=>{const storage=memory();storage.setItem(key,JSON.stringify(state));return storage;};
const addXp=(state,xp)=>{state.practice['bonus-'+Object.keys(state.practice).length]={day,xp};};
const finish=(state,id,values={result:'Geschafft'})=>record(state,quests[id],values,new Date(day+'T10:00:00'));
function completeHobby(state,hobbyId,{skipMasterpiece=false}={}) {
  for(const quest of byHobby[hobbyId].quests) {
    if(skipMasterpiece&&quest.stage===4) continue;
    if(unlocks(state,quest)&&!state.entries.some(entry=>entry.quest===quest.id)) {
      finish(state,quest.id,{result:'Geschafft',score:quest.max?1:undefined,condition:'test',verified:true});
    }
  }
}

test('XP-Schwellen setzen die Figur auf die richtige Station',()=>{
  assert.deepEqual(checkpoints.map(point=>point.xp),[0,30,100,225,450]);
  const expected=[[0,0],[29,0],[30,1],[99,1],[100,2],[224,2],[225,3],[449,3],[450,4],[5000,4]];
  for(const [xp,index] of expected) assert.equal(mapProgress(xp).current,index,xp+' XP');
});

test('Jede Quest-Mission nutzt eine vorhandene, sofort startbare Quest',()=>{
  for(const point of checkpoints.filter(item=>item.mission.type==='quest')) {
    for(const option of point.mission.options) {
      assert.ok(quests[option.quest],option.quest+' fehlt im Katalog');
      assert.equal(unlocks(initial(),quests[option.quest]),true,option.quest+' ist nicht sofort startbar');
    }
  }
});

test('Ein vorhandener Spielstand mit XP landet an der passenden Station',()=>{
  const state=initial();
  addXp(state,130);
  assert.equal(mapProgress(totalXp(state)).current,2);
  const html=gameMapPage(totalXp(state),undefined,state,null);
  assert.match(html,/aria-label="3\. Taktbrücke[^"]*hier steht deine Figur/);
});

test('Gesperrte Stationen bieten keine Startaktion',()=>{
  const state=initial();
  for(const id of ['2','3','4','5']) {
    const html=gameMapPage(0,id,state,null);
    assert.doesNotMatch(html,/href="#quest\//,'Station '+id);
    assert.doesNotMatch(html,/href="#woche"/,'Station '+id);
    assert.match(html,/Ausblick/);
    assert.match(html,/noch \d+ XP/);
  }
});

test('Freischaltung durch XP ist nicht dasselbe wie erledigte Mission',()=>{
  const state=initial();
  addXp(state,30);
  assert.deepEqual(stationState(state,1,30),{unlocked:true,done:false});
  assert.match(gameMapPage(30,'2',state,null),/Mission offen/);
});

test('Erste Mission: Abschluss bringt XP, schaltet frei und markiert die Station',()=>{
  const state=initial();
  assert.ok(finish(state,'naturjournal-1'));
  const xp=totalXp(state);
  assert.equal(xp,30);
  assert.equal(missionDone(state,checkpoints[0]),true);
  assert.equal(stationState(state,1,xp).unlocked,true);
  assert.equal(stationState(state,1,xp).done,false);
  const html=gameMapPage(xp,'1',state,null);
  assert.match(html,/Mission erledigt/);
  assert.match(html,/class="map-check"/);
});

test('Neuladen und erneutes Anzeigen verdoppeln weder XP noch Fortschritt',()=>{
  const state=initial();
  finish(state,'naturjournal-1');
  assert.equal(finish(state,'naturjournal-1'),null,'zweiter Abschluss am selben Tag zählt nicht');
  const storage=store(state);
  resetMapSession();
  const first=gameMapPage(totalXp(load(storage)),undefined,load(storage),storage);
  assert.match(first,/Neu freigeschaltet/);
  assert.equal(load(storage).mapSeen,1);
  resetMapSession();
  const reloaded=gameMapPage(totalXp(load(storage)),undefined,load(storage),storage);
  assert.doesNotMatch(reloaded,/Neu freigeschaltet/);
  const after=load(storage);
  assert.equal(totalXp(after),30);
  assert.equal(after.entries.length,1);
});

test('Waldlichtung: eine der beiden Missionen reicht',()=>{
  for(const id of ['fotografie-1','vogelbeobachtung-1']) {
    const state=initial();
    finish(state,id);
    assert.equal(missionDone(state,checkpoints[1]),true,id);
  }
  assert.equal(missionDone(initial(),checkpoints[1]),false);
  const html=gameMapPage(30,'2',initial(),null);
  assert.match(html,/Foto-Mission starten/);
  assert.match(html,/Naturbeobachtung starten/);
});

test('Sternwarte zählt erst bei drei gespeicherten Etappen',()=>{
  const state=initial();
  state.expedition.weeks['2026-11-23']=['fotografie-1','zeichnen-1'];
  assert.equal(plannedExpedition(state),false);
  state.expedition.weeks['2026-11-23'].push('kochen-1');
  assert.equal(plannedExpedition(state),true);
  assert.equal(missionDone(state,checkpoints[3]),true);
});

test('Gipfel: Meisterstück erledigt, Abzeichen erst bei freigeschalteter Station und dauerhaft',()=>{
  const state=initial();
  completeHobby(state,'fotografie',{skipMasterpiece:true});
  assert.equal(masterpieceDone(state),false);
  assert.equal(summitTarget(state)?.id,'fotografie-meisterwerk');
  completeHobby(state,'fotografie');
  assert.equal(masterpieceDone(state),true);
  assert.equal(stationState(state,4,totalXp(state)).done,false,'unter 450 XP bleibt der Gipfel gesperrt');
  addXp(state,450);
  const storage=store(state);
  const html=gameMapPage(totalXp(state),'5',load(storage),storage);
  assert.match(html,/Gipfelabzeichen: gesammelt/);
  assert.ok(load(storage).mapBadge);
  const later=load(storage);
  later.entries=[];
  assert.match(gameMapPage(totalXp(later),'5',later,null),/Gipfelabzeichen: gesammelt/,'Abzeichen bleibt erhalten');
});

test('Rückweg zur Karte gilt nur für freigeschaltete Missionsseiten',()=>{
  const state=initial();
  addXp(state,500);
  assert.equal(mapContext('#quest/naturjournal-1',state).index,0);
  assert.equal(mapContext('#fokus/beats-1',state).index,2);
  assert.equal(mapContext('#woche',state).index,3);
  assert.equal(mapContext('#quest/fotografie-meisterwerk',state).index,4);
  assert.equal(mapContext('#quest/kochen-1',state),null);
  assert.equal(mapContext('#woche',initial()),null);
});

test('Karte ist per Tastatur und als Text lesbar',()=>{
  const html=gameMapPage(0,undefined,initial(),null);
  assert.equal((html.match(/<a class="map-node/g)||[]).length,5);
  assert.equal((html.match(/aria-label="\d\. [^"]*XP/g)||[]).length,5);
  assert.match(html,/<ol class="map-list">/);
  assert.match(html,/Noch 30 XP bis Waldlichtung/);
});
