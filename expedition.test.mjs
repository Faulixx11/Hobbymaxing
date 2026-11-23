import test from 'node:test';
import assert from 'node:assert/strict';
import {byHobby, hobbies, quests} from './catalog.mjs?v=06';
import {initial, localDate, monday, record, shift} from './state.mjs?v=08';
import {mergeBackup, parseBackup, profileBackup, questMatches, recommend} from './play.mjs';
import {expeditionContent, featuredExpeditions} from './expedition-content.mjs';
import {budgetLabel, expeditionNext, milestoneMinutes, reviewQuest, routeSummary, shortQuest, skillHistory} from './expedition.mjs';

test('all hobby routes have four stages, material and project criteria',()=>{
  assert.equal(hobbies.length,54);
  assert.ok(featuredExpeditions.length>=8);
  assert.ok(new Set(featuredExpeditions.map(id=>byHobby[id].group)).size>=7);
  for(const hobby of hobbies) {
    assert.deepEqual(routeSummary(initial(),hobby).map(item=>item.stage),[1,2,3,4]);
    for(const quest of hobby.quests) {
      const {materials,safety,diagnosis,example,rationale,next,rubric}=expeditionContent(hobby,quest);
      assert.ok(materials.length&&safety&&diagnosis.task&&example.repair&&rationale&&next&&rubric.length,quest.id);
    }
  }
});

test('training branch and gear respect prerequisites and milestone completion',()=>{
  const state=initial();
  const hobby=byHobby.kochen;
  state.expedition.plans.kochen={minutes:25,route:1};
  assert.equal(expeditionNext(state,hobby).id,'kochen-1');
  assert.ok(milestoneMinutes(state,hobby)>quests['kochen-1'].minutes);
  record(state,quests['kochen-1'],{result:'Bissfeste Nudeln'});
  assert.equal(expeditionNext(state,hobby).id,'kochen-timing');
  record(state,quests['kochen-timing'],{result:'Beide Teile wurden gleichzeitig fertig'});
  assert.equal(expeditionNext(state,hobby).id,'kochen-3');
  assert.equal(milestoneMinutes(state,hobby),quests['kochen-3'].minutes);
  record(state,quests['kochen-3'],{result:'Zwei Portionen'});
  assert.equal(expeditionNext(state,hobby).stage,4);
  record(state,quests['kochen-meisterwerk'],{result:'Rezepttest',verified:true});
  assert.equal(expeditionNext(state,hobby),null);
  assert.equal(state.entries[0].verified,true);
});

test('repeat practice is due after two weeks and skill history reflects practice',()=>{
  const state=initial();
  const yesterday=shift(localDate(),-1);
  const twoWeeks=shift(localDate(),-14);
  const hobby=byHobby.fotografie;
  const entry=record(state,hobby.quests[0],{result:'Drei Fotos mit freiem Hintergrund'},new Date(twoWeeks+'T12:00'));
  assert.ok(entry);
  assert.equal(reviewQuest(state,hobby).id,entry.quest);
  assert.equal(skillHistory(state,monday(twoWeeks))[0].quest.id,entry.quest);
  record(state,hobby.quests[0],{result:'Neue Aufnahme als Vergleich'},new Date(yesterday+'T12:00'));
  assert.equal(reviewQuest(state,hobby),undefined);
  assert.equal(skillHistory(state)[0].day,yesterday);
});

test('short quests obey the time cap, pause and budget filter',()=>{
  const state=initial();
  const first=shortQuest(state);
  assert.ok(first.minutes<=10);
  state.expedition.paused.push(first.hobby);
  assert.notEqual(shortQuest(state)?.hobby,first.hobby);
  assert.notEqual(recommend(state)?.hobby.id,first.hobby);
  assert.equal(questMatches(byHobby[first.hobby],first,{cost:budgetLabel(first)},state),true);
  assert.equal(questMatches(byHobby[first.hobby],first,{cost:'not-a-budget-label'},state),false);
});

test('expedition preferences, journal, completed projects and studio drafts survive backup',()=>{
  const state=initial(), day=localDate(), week=monday(day);
  const quest=quests['fotografie-1'];
  state.expedition.favorites=[quest.id,'invented'];
  state.expedition.paused=[quest.hobby];
  state.expedition.materials[quest.hobby]=[0,1,100];
  state.expedition.journal[quest.id]={day,before:'Fensterlicht probieren',after:'Motiv zum Fenster drehen'};
  state.expedition.journal.invented={day,before:'Muss entfallen'};
  state.expedition.weeks[week]=[quest.id];
  state.expedition.reading='large';
  state.expedition.reducedMotion=true;
  state.expedition.reminder={days:7,last:day};
  state.practiceDrafts.kochen={portions:3,pasta:12};
  for(const task of byHobby.fotografie.quests) record(state,task,{result:'Projektfortschritt',verified:task.stage===4});
  const restored=parseBackup(profileBackup(state));
  const target=initial();
  mergeBackup(target,restored);
  assert.deepEqual(target.expedition.favorites,[quest.id]);
  assert.deepEqual(target.expedition.paused,[quest.hobby]);
  assert.deepEqual(target.expedition.materials[quest.hobby],[0,1]);
  assert.deepEqual(target.expedition.journal[quest.id],state.expedition.journal[quest.id]);
  assert.equal(target.expedition.journal.invented,undefined);
  assert.deepEqual(target.expedition.weeks[week],[quest.id]);
  assert.equal(target.expedition.reading,'large');
  assert.equal(target.expedition.reducedMotion,true);
  assert.deepEqual(target.expedition.reminder,{days:7,last:day});
  assert.deepEqual(target.practiceDrafts.kochen,{portions:3,pasta:12});
  assert.ok(target.entries.find(entry=>entry.quest==='fotografie-meisterwerk').verified);
});
