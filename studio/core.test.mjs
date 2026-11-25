import assert from 'node:assert/strict';
import {test} from 'node:test';
import {categories,hobbies} from './content.js';
import {freshState,sanitize,attempt,mastery,recordLesson} from './state.js';
import {verifyStep,orderSeed} from './learning.js';
import {filteredHobbies,studioFor} from './pages.js';
import {calendarShift,eventsOn,finishQuest,quests,completeProject} from './planner.js';
import {studios} from './studios.js';

test('every catalog hobby has an individual, valid starter path',()=>{
  assert.equal(hobbies.length,80);
  assert.equal(new Set(hobbies.map(h=>h.id)).size,80);
  assert.equal(categories.length,9);
  for (const hobby of hobbies) {
    assert.ok(categories.some(cat=>cat.id===hobby.category),hobby.id);
    assert.ok(hobby.name && hobby.subcategory && hobby.intro && hobby.description && hobby.project && hobby.skills.length,hobby.id);
    assert.ok(Number.isFinite(hobby.cost) && hobby.minutes>0 && Array.isArray(hobby.materials),hobby.id);
    assert.ok(hobby.lessons.length >= 1,hobby.id);
    for (const lesson of hobby.lessons) {
      assert.ok(lesson.title && lesson.goal && lesson.intro,hobby.id+'/'+lesson.title);
      assert.ok(lesson.steps.length>=3,hobby.id+'/'+lesson.title);
      for (const step of lesson.steps) {
        assert.ok(step.prompt && step.feedback && step.hint,step.prompt);
        if (step.type === 'choice') assert.ok(step.answer >= 0 && step.answer < step.options.length);
        if (['multi','order'].includes(step.type)) assert.ok(step.answer.every(i=>i >= 0 && i < step.options.length));
        if (step.type === 'order') assert.equal(step.answer.length,step.options.length);
        const response = step.type==='text' ? step.answer[0] : step.type==='reflect' ? {checks:step.criteria.length,note:'Eine eigene Beobachtung.'} : step.answer;
        assert.equal(verifyStep(step,response),true,step.prompt);
      }
    }
  }
  for (const [hobby,id] of Object.entries(studioFor)) {
    assert.ok(hobbies.some(item=>item.id===hobby),hobby);
    assert.ok(studios[id],id);
  }
});

test('attempts adapt after an error and after a correct answer',()=>{
  const state=freshState();
  const today=new Date('2026-11-25T12:00:00Z');
  const key='schach:0:0';
  attempt(state,key,false,'e1',today);
  assert.equal(mastery(state.skills[key],today),'Wiederholung empfohlen');
  assert.deepEqual(state.skills[key].errors,['e1']);
  attempt(state,key,true,'e4',today);
  assert.equal(state.skills[key].next,'2026-11-26T12:00:00.000Z');
  attempt(state,key,true,'e4',new Date('2026-11-26T12:00:00Z'));
  assert.equal(state.skills[key].next,'2026-11-29T12:00:00.000Z');
  attempt(state,key,false,'d4',today);
  assert.equal(state.skills[key].streak,0);
});

test('lesson, project and quest XP are once per completion',()=>{
  const state=freshState();
  const hobby=hobbies[0];
  const lesson=hobby.lessons[0];
  assert.equal(recordLesson(state,hobby,0,lesson,90),true);
  assert.equal(recordLesson(state,hobby,0,lesson,60),false);
  const quest=quests[0];
  state.quest[quest.id]={checks:quest.steps.map(()=>true),done:false};
  assert.equal(finishQuest(state,quest.id),true);
  assert.equal(finishQuest(state,quest.id),false);
  const project={id:'paper',title:'Papiermodell',hobby:'origami',status:'active',tasks:[{title:'Testen',done:true}]};
  assert.equal(completeProject(state,project),true);
  assert.equal(completeProject(state,project),false);
  assert.equal(state.xp,25+quest.xp+40);
});

test('filtering and ordering use the actual stored values',()=>{
  const state=freshState();
  state.favorites=['fotografie'];
  assert.deepEqual(filteredHobbies(state,{favorites:true,q:'Foto'}).map(h=>h.id),['fotografie']);
  assert.ok(filteredHobbies(state,{cost:'0'}).every(item=>item.cost===0));
  assert.notDeepEqual(orderSeed(3,[0,1,2]),[0,1,2]);
});

test('calendar monthly navigation and weekly recurrence handle dates',()=>{
  assert.equal(calendarShift('2026-01-31','month',1),'2026-02-01');
  assert.equal(calendarShift('2026-12-31','week',1),'2027-01-07');
  const events=[{day:'2026-03-24',time:'10:00',repeat:true}];
  assert.equal(eventsOn(events,'2026-03-31').length,1);
  assert.equal(eventsOn(events,'2026-03-25').length,0);
});

test('backup validation strips dangerous keys and invalid data',()=>{
  const state=freshState();
  state.active=JSON.parse('{"schach":"active","__proto__":"active","constructor":"active"}');
  state.journal=[{id:'note',title:'Test',body:'Privat',image:'data:image/svg+xml;base64,AAA='}];
  state.events=[{id:'event',title:'Übung',day:'a fake date'}];
  const restored=sanitize(state);
  assert.deepEqual(restored.active,{schach:'active'});
  assert.equal(restored.journal[0].image,'');
  assert.equal(restored.events.length,0);
  assert.throws(()=>sanitize({...state,version:9}),/Sicherung/);
});
