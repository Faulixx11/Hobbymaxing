import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,nextQuest,unlocks} from './state.mjs?v=06';
import {languages,selectSpeechVoice,moods,moodQuests,weeklyRecap,profileBackup,parseBackup} from './play.mjs';
import {videoSearchUrl,resourcesForStage} from './resources.mjs';
import {hobbies,quests} from './catalog.mjs?v=06';

test('weekly recap summarizes only the selected week and avoids duplicate hobby or skill labels',()=>{
  const state=initial(),quest=Object.values(quests).find(item=>item.type!=='Challenge'&&item.stage===1);
  state.entries=[
    {week:'2026-11-23',day:'2026-11-23',quest:quest.id,xp:25,time:'2026-11-23T10:00:00Z',result:'Erster Versuch'},
    {week:'2026-11-23',day:'2026-11-24',quest:quest.id,xp:0,time:'2026-11-24T10:00:00Z',result:'Wiederholung'},
    {week:'2026-11-16',day:'2026-11-17',quest:quest.id,xp:25,time:'2026-11-17T10:00:00Z',result:'Vorwoche'}
  ];
  const recap=weeklyRecap(state,'2026-11-23');
  assert.equal(recap.days,2);
  assert.equal(recap.quests,2);
  assert.equal(recap.xp,25);
  assert.equal(recap.hobbies.length,1);
  assert.equal(recap.entries[0].result,'Erster Versuch');
});

test('profile backup identifies its contents and remains importable',()=>{
  const state=initial();
  state.name='Jonas';
  state.active=['scratch'];
  const file=JSON.parse(profileBackup(state));
  assert.equal(file.format,'hobbymaxing-profile');
  assert.equal(file.summary.hobbies,1);
  assert.equal(file.summary.photosIncluded,false);
  assert.ok(Number.isFinite(Date.parse(file.exportedAt)));
  assert.equal(parseBackup(JSON.stringify(file)).name,'Jonas');
});

test('language cards have complete locale tags and five translated practice phrases',()=>{
  assert.equal(initial().language,'en');
  assert.equal(Object.keys(languages).length,14);
  for(const [id,item] of Object.entries(languages)) {
    assert.equal(item.locale.split('-')[0].toLowerCase(),id);
    assert.equal(item.pairs.length,5);
    assert.ok(item.pairs.every(([phrase,meaning])=>phrase&&meaning));
  }
  assert.match(quests['sprachen-1'].steps[0],/Übungssprache/);
  assert.doesNotMatch(quests['sprachen-1'].steps[0],/Spanisch|Französisch|Englisch/);
  assert.match(quests['sprachen-1'].steps[1],/Beispielnamen/);
});

test('speech voice selection prefers the requested locale and never picks another language',()=>{
  const voices=[
    {name:'English US',lang:'en-US',localService:true},
    {name:'English UK remote',lang:'en-GB',localService:false},
    {name:'German',lang:'de-DE',localService:true}
  ];
  assert.equal(selectSpeechVoice(voices,languages.en).name,'English UK remote');
  assert.equal(selectSpeechVoice(voices,{locale:'en-AU'}).name,'English US');
  assert.equal(selectSpeechVoice(voices,languages.es),null);
});

test('mood picks contain only short, unlocked quests in the matching groups',()=>{
  const state=initial();
  for(const id of Object.keys(moods)) {
    const options=moodQuests(state,id);
    assert.ok(options.length>0,id+' should have starter choices');
    for(const {hobby,quest} of options) {
      assert.ok(moods[id].groups.includes(hobby.group));
      assert.ok(quest.minutes<=25);
      assert.equal(quest,nextQuest(state,hobby));
      assert.ok(unlocks(state,quest));
      assert.notEqual(quest.gear||hobby.gear,'Mit Ausrüstung');
    }
  }
});

test('video search fallback includes the exact hobby and quest without claiming curation',()=>{
  const url=new URL(videoSearchUrl('Kreatives Schreiben','Eine kleine Geschichte'));
  assert.equal(url.hostname,'www.youtube.com');
  assert.equal(url.pathname,'/results');
  assert.match(url.searchParams.get('search_query'),/Kreatives Schreiben.*Eine kleine Geschichte.*Tutorial Schritt für Schritt/);
});

test('every hobby stage has a quest and either a selected video or a stage-matched search',()=>{
  for(const hobby of hobbies) for(let stage=1;stage<=4;stage++) {
    const resource=resourcesForStage(hobby,stage);
    assert.ok(resource.quest,`${hobby.name} stage ${stage} has a quest`);
    assert.ok(resource.items.length||resource.videoUrl,`${hobby.name} stage ${stage} has a learning link`);
    if(resource.videoUrl) {
      const query=new URL(resource.videoUrl).searchParams.get('search_query');
      assert.match(query,new RegExp(hobby.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
      assert.match(query,new RegExp(resource.quest.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    }
  }
});

