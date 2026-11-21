import test from 'node:test';
import assert from 'node:assert/strict';
import {hobbies,quests,byHobby,challenges} from './catalog.mjs';
import {initial,load,record,totalXp,unlocks,level,streaks,weekGoal,validShare,encode,decode,leaderboard,rankId,earnPractice,dailyStreak,changeEntry,inviteJoin,friendFinished,firstPrerequisite,updatePlan} from './state.mjs';
import {lessons} from './lessons.mjs';
import {resources} from './resources.mjs';
import {questionOptions,coachReply,experiments,runBlocks} from './learning.mjs';
import {studios,studioCell,checkStudio} from './studios.mjs';
import {questMatches,recommend,featuredChallenge,profileBackup,parseBackup,mergeBackup,languages,searchKey} from './play.mjs';

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

test('quest filters exclude locked stages while recommendations prioritize active hobbies',()=>{
  const state=initial(), garden=byHobby.garten, first=garden.quests[0], second=garden.quests[1];
  assert.equal(questMatches(garden,first,{time:'10'},state),false);
  assert.equal(questMatches(garden,second,{time:'10'},state),false);
  record(state,first,{result:'Basilikum'},day('2026-11-16'));
  assert.equal(questMatches(garden,second,{time:'10'},state),true);
  assert.equal(recommend(state,{time:'10'}).quest.id,second.id);
  assert.notEqual(featuredChallenge('2026-11-16').id,featuredChallenge('2026-11-23').id);
  assert.equal(Object.values(languages).every(item=>item.pairs.length===5),true);
});

test('repeated practice keeps the streak and backups merge without duplicate rewards',()=>{
  const state=initial(), fresh=initial();
  earnPractice(state,'quiz-scratch',20,'2026-11-16');
  assert.equal(earnPractice(state,'quiz-scratch',20,'2026-11-17'),false);
  assert.equal(dailyStreak(state,'2026-11-17').running,2);
  record(state,quests['scratch-1'],{result:'Figur bewegt sich',confidence:'retry'},day('2026-11-17'));
  const backup=parseBackup(profileBackup(state));
  assert.ok(backup);
  mergeBackup(fresh,backup);
  mergeBackup(fresh,backup);
  assert.equal(totalXp(fresh),50);
  assert.equal(fresh.entries[0].confidence,'retry');
  assert.equal(fresh.entries.length,1);
  assert.equal(parseBackup('{"version":1}'),null);
});

test('whitespace cannot unlock a quest and editing or undoing restores XP and best values',()=>{
  const state=initial();
  assert.equal(record(state,quests['sprachen-1'],{result:'  '},day('2026-11-20')),null);
  assert.equal(unlocks(state,quests['sprachen-2']),false);
  const first=record(state,quests['challenge-pass'],score(9),day('2026-11-20'));
  const second=record(state,quests['challenge-pass'],score(6),day('2026-11-21'));
  assert.equal(changeEntry(state,first.id,score(4)),true);
  assert.equal(state.entries[0].previous,4);
  assert.equal(leaderboard(state,quests['challenge-pass'],'2026-11-16')[0].score,6);
  assert.equal(changeEntry(state,first.id),true);
  assert.equal(state.entries[0].id,second.id);
  assert.equal(state.entries[0].previous,null);
  assert.equal(totalXp(state),40);
});

test('a guest sees the missing prerequisite and reimporting a self invitation cannot create a second player',()=>{
  const host=initial(), guest=initial();
  host.playerId=crypto.randomUUID();
  const data={mode:'invite',quest:'sprachen-2',day:'2026-11-21',code:crypto.randomUUID(),sender:host.playerId,name:'Test',done:true};
  host.invites.push({code:data.code,quest:data.quest,day:data.day,done:true,friendDone:false});
  assert.equal(inviteJoin(host,data),true);
  assert.equal(friendFinished(host,host.invites[0]),false);
  assert.equal(inviteJoin(guest,data),true);
  assert.equal(firstPrerequisite(guest,quests[data.quest]).id,'sprachen-1');
  assert.equal(friendFinished(guest,guest.invites[0]),true);
  record(guest,quests['sprachen-1'],{result:'Hola'},day(data.day));
  assert.equal(firstPrerequisite(guest,quests[data.quest]),null);
});

test('moving duplicate plans requires a merge and the full backup transfers private beta state',()=>{
  const state=initial(), fresh=initial();
  const a=crypto.randomUUID(), b=crypto.randomUUID(), friend=crypto.randomUUID();
  state.plans=[{id:a,quest:'zeichnen-1',day:'2026-11-21',done:false},{id:b,quest:'zeichnen-1',day:'2026-11-22',done:false}];
  assert.equal(updatePlan(state,a,'2026-11-22'),'collision');
  assert.equal(state.plans.length,2);
  assert.equal(updatePlan(state,a,'2026-11-22',true),'done');
  state.journeys=['kreativ'];
  state.language='fr';
  state.labDrafts.start=['flag','right'];
  state.invites=[{code:a,quest:'zeichnen-1',day:'2026-11-21',done:false,friendId:friend,friendDone:true}];
  state.scores=[{mode:'result',quest:'challenge-pass',version:1,week:'2026-11-16',name:'Freund',player:friend,score:5,result:'Treffer'}];
  const data=parseBackup(profileBackup(state));
  assert.deepEqual(mergeBackup(fresh,data),{added:3,skipped:0});
  assert.deepEqual(mergeBackup(fresh,data),{added:0,skipped:3});
  assert.equal(fresh.plans[0].id,b);
  assert.deepEqual(fresh.journeys,['kreativ']);
  assert.equal(fresh.language,'fr');
  assert.deepEqual(fresh.labDrafts.start,['flag','right']);
  assert.equal(friendFinished(fresh,fresh.invites[0]),true);
});

test('German search, equipment and multiday metadata work on the concrete quest',()=>{
  assert.equal(searchKey('Fußball'),searchKey('fussball'));
  assert.equal(searchKey('Häkeln'),searchKey('haekeln'));
  const state=initial();
  state.preferences.tennis={gear:'basic'};
  assert.equal(questMatches(byHobby.tennis,quests['tennis-1'],{time:'10'},state),false);
  assert.equal(quests['garten-2'].elapsedDays,3);
  assert.match(quests['kochen-1'].guided[1].tip,/Sauce/);
});
