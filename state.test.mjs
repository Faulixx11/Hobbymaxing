import test from 'node:test';
import assert from 'node:assert/strict';
import {hobbies,quests,byHobby,challenges} from './catalog.mjs';
import {initial,load,record,totalXp,unlocks,level,streaks,weekGoal,validShare,encode,decode,leaderboard,rankId,earnPractice,dailyStreak} from './state.mjs';
import {lessons} from './lessons.mjs';
import {resources} from './resources.mjs';
import {questionOptions,coachReply,experiments,runBlocks} from './learning.mjs';
import {studios,studioCell,checkStudio} from './studios.mjs';

const day = iso => new Date(iso+'T12:00:00');
const score = (value,condition='3 m') => ({score:value,condition});

test('every hobby has an explanation, four complete stages and a valid quiz',()=>{
  assert.equal(hobbies.length,54);
  assert.equal(Object.keys(quests).length,hobbies.flatMap(hobby=>hobby.quests).length+challenges.length);
  assert.deepEqual(Object.keys(lessons).sort(),hobbies.map(hobby=>hobby.id).sort());
  for (const hobby of hobbies) {
    assert.ok(hobby.name && hobby.materials && hobby.skill);
    const lesson=lessons[hobby.id];
    assert.ok(lesson.intro && lesson.technique && lesson.trouble && lesson.question && lesson.feedback,hobby.id);
    const options=questionOptions(hobby.id);
    assert.equal(new Set(options).size,3,hobby.id);
    assert.ok(options.includes(lesson.correct),hobby.id);
    assert.deepEqual([...new Set(hobby.quests.map(quest=>quest.stage))],[1,2,3,4],hobby.id);
    for (const [index,quest] of hobby.quests.entries()) {
      assert.ok(quest.title && quest.steps.length>=3 && quest.minutes>0 && quest.result && quest.adapt);
      assert.ok(quest.requires.every(id=>hobby.quests.slice(0,index).some(previous=>previous.id===id)),quest.id);
    }
  }
  for (const [id,items] of Object.entries(resources)) {
    assert.ok(byHobby[id]);
    assert.ok(items.every(([stage,label,source,url])=>stage>=1&&stage<=4&&label&&source&&url.startsWith('https://')));
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
  assert.equal(record(state,quests['fussball-meisterwerk'],{result:'Passstation'},day('2026-11-20')).xp,100);
  assert.equal(level(state,byHobby.fussball),4);
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
  state.scores.push({...named,week:'2026-11-23',score:8},{...named,week:'2026-11-30',score:10});
  assert.deepEqual(leaderboard(state,quest,null).map(row=>row.score),[10,9,6]);
});

test('old browser progress still loads, and practice counts toward daily but not weekly goals',()=>{
  const state=load({getItem:()=>JSON.stringify({name:'Aus der alten Beta',active:['scratch']})});
  assert.equal(state.name,'Aus der alten Beta');
  assert.equal(level(state,byHobby.scratch),1);
  assert.equal(earnPractice(state,'quiz-scratch',20,'2026-11-16'),true);
  assert.equal(earnPractice(state,'quiz-scratch',20,'2026-11-17'),false);
  assert.equal(earnPractice(state,'lab-start',25,'2026-11-17'),true);
  assert.equal(totalXp(state),45);
  assert.deepEqual(dailyStreak(state,'2026-11-17'),{running:2,best:2,doneToday:true});
  assert.deepEqual(dailyStreak(state,'2026-11-19'),{running:0,best:2,doneToday:false});
  assert.deepEqual(streaks(state,'2026-11-17'),{running:0,best:0});
});

test('the block lab reports failed sequences and verifies all three goals',()=>{
  assert.equal(runBlocks(['right','flag'],experiments[0]).pass,false);
  assert.equal(runBlocks(['flag','right'],experiments[0]).pass,true);
  assert.equal(runBlocks(['rightKey','right','leftKey','left'],experiments[1]).pass,true);
  assert.equal(runBlocks(['flag','right','collect'],experiments[2]).pass,false);
  const game=runBlocks(['flag','reset','right','collect'],experiments[2]);
  assert.equal(game.pass,true);
  assert.deepEqual(game.frames.map(frame=>frame.points),[1,1]);
});

test('the coach gives hobby-aware advice and studios validate selected cells',()=>{
  const state=initial();
  assert.equal(coachReply(state,'scratch','Wie erstelle ich eine Variable?').route,'labor');
  assert.equal(coachReply(state,'schach','Was soll ich zuerst machen?').route,'quest/schach-1');
  assert.equal(coachReply(state,'fussball','Wie starte ich?').route,'quest/fussball-1');
  assert.equal(coachReply(state,'','Wo sind die Rankings?').route,'ranglisten');
  assert.equal(studioCell('schach',studios.schach.origin),'d4');
  assert.deepEqual(checkStudio('beats',[0,4,10]),{missing:1,extra:0,pass:false});
  assert.equal(checkStudio('beats',[0,4,10,14]).pass,true);
  assert.equal(checkStudio('pixelart',studios.pixelart.solution).pass,true);
});
