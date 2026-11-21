import test from 'node:test';
import assert from 'node:assert/strict';
import {hobbies,quests,byHobby,challenges} from './catalog.mjs';
import {initial,record,totalXp,unlocks,level,streaks,weekGoal,validShare,encode,decode,leaderboard,rankId} from './state.mjs';

const day = iso => new Date(iso+'T12:00:00');
const score = (value,condition='3 m') => ({score:value,condition});

test('all 169 quests have unique IDs, complete fields and valid prerequisites',()=>{
  assert.equal(hobbies.length,54);
  assert.equal(Object.keys(quests).length,169);
  assert.equal(hobbies.flatMap(hobby=>hobby.quests).length+challenges.length,169);
  for (const hobby of hobbies) {
    assert.ok(hobby.name && hobby.materials && hobby.skill);
    for (const [index,quest] of hobby.quests.entries()) {
      assert.ok(quest.title && quest.steps.length>=3 && quest.minutes>0 && quest.result && quest.adapt);
      assert.ok(quest.requires.every(id=>hobby.quests.slice(0,index).some(previous=>previous.id===id)),quest.id);
    }
  }
});

test('a fork unlocks the milestone, and repeat attempts never duplicate quest XP',()=>{
  const state=initial(), first=quests['fussball-1'], alt=quests['fussball-ziel'], final=quests['fussball-3'];
  assert.equal(unlocks(state,alt),false);
  assert.equal(record(state,first,score(4),day('2026-11-16')).xp,30);
  assert.equal(level(state,byHobby.fussball),2);
  assert.equal(record(state,first,score(8),day('2026-11-16')),null);
  assert.equal(record(state,first,score(6),day('2026-11-17')).previous,4);
  assert.equal(record(state,first,score(8,'4 m'),day('2026-11-18')).previous,null);
  assert.equal(record(state,alt,score(5),day('2026-11-18')).xp,45);
  assert.equal(unlocks(state,final),true);
  assert.equal(record(state,final,score(7),day('2026-11-19')).xp,75);
  assert.equal(level(state,byHobby.fussball),3);
  assert.equal(totalXp(state),150);
});

test('weekly goals are effective from their selected week and preserve past streaks',()=>{
  const state=initial(), quest=quests['challenge-pass'];
  state.goals['2026-11-23']=3;
  record(state,quest,score(4),day('2026-11-16'));
  assert.equal(record(state,quest,score(5),day('2026-11-17')).xp,0);
  assert.deepEqual(streaks(state,'2026-11-23'),{running:1,best:1});
  assert.equal(weekGoal(state,'2026-11-16'),2);
  assert.equal(weekGoal(state,'2026-11-23'),3);
  assert.equal(record(state,quest,score(6),day('2026-11-23')).xp,40);
  assert.deepEqual(streaks(state,'2026-11-30'),{running:0,best:1});
});

test('share links support Unicode and the leaderboard keeps each weekly best',()=>{
  const state=initial(), quest=quests['challenge-pass'];
  record(state,quest,score(4),day('2026-11-16'));
  record(state,quest,score(6),day('2026-11-17'));
  record(state,quest,score(3),day('2026-11-18'));
  const shared={mode:'result',quest:quest.id,version:1,week:'2026-11-16',name:'Jörg 🏆',result:'Treffer',score:9};
  assert.deepEqual(decode(encode(shared)),shared);
  assert.equal(validShare(shared),true);
  assert.equal(validShare({...shared,score:11}),false);
  assert.equal(validShare({...shared,week:'2026-11-31'}),false);
  assert.equal(validShare({...shared,week:'2026-11-17'}),false);
  assert.equal(validShare({...shared,quest:'constructor'}),false);
  assert.equal(validShare({...shared,player:'invalid'}),false);
  const named={...shared,player:crypto.randomUUID()};
  assert.equal(rankId(named),rankId({...named,name:'Neuer Name'}));
  state.scores.push(shared);
  assert.deepEqual(leaderboard(state,quest,'2026-11-16').map(row=>row.score),[9,6]);
  assert.equal(leaderboard(state,quest,'2026-11-23').length,0);
});
