import test from 'node:test';
import assert from 'node:assert/strict';
import { legalPuzzleMove, parseWorkoutCsv, practiceStudioPage, practiceStudios, recipePlan, sanitizePracticeDraft, tapFeedback } from './expedition-studios.mjs';

test('each practice studio has a matching page',()=>{
  for(const [id,studio] of Object.entries(practiceStudios)) {
    assert.ok(practiceStudioPage(id).includes(studio.title));
    assert.ok(practiceStudioPage(id).includes('#pfad/'+id));
  }
  assert.equal(practiceStudioPage('gym'),practiceStudioPage('laufen'));
  assert.ok(practiceStudioPage('constructor').includes('Übungsstudio finden'));
});

test('recipe scales quantities and aligns both finish times',()=>{
  const plan=recipePlan(3,20);
  assert.deepEqual(plan.map(step=>step.minute),[0,0,4,19,20]);
  assert.match(plan[0].text,/255 g Nudeln, 450 g passierte Tomaten, 15 ml/);
  assert.deepEqual(recipePlan(1,8).map(step=>step.minute),[0,0,8,15,16]);
});

test('rhythm evaluates intervals and requires four taps',()=>{
  assert.match(tapFeedback([0,500,1000],120),/mindestens vier/);
  assert.match(tapFeedback([0,500,1000,1500],120),/gleichmäßig.*0 ms/i);
  assert.match(tapFeedback([0,1000,2000,3000],120),/500 ms/);
});

test('chess rejects illegal geometry, blocked rays and exposing the king',()=>{
  const pieces={e1:'WK',e2:'WR',e8:'BR',g8:'BK'};
  assert.equal(legalPuzzleMove(pieces,'e2','e8'),true);
  assert.equal(legalPuzzleMove(pieces,'e2','f2'),false);
  assert.equal(legalPuzzleMove(pieces,'e2','f3'),false);
  assert.equal(legalPuzzleMove({...pieces,e4:'BP'},'e2','e8'),false);
  assert.equal(legalPuzzleMove({f6:'WK',g6:'WQ',h8:'BK'},'g6','g7'),true);
});

test('practice backups discard invalid layers and sessions and cap notes',()=>{
  assert.deepEqual(sanitizePracticeDraft('zeichnen',{layers:[
    {shape:'triangle',color:'amber',x:1,y:2,size:3},
    {shape:'rect',color:'toString',x:0,y:0,size:3},
    {shape:'rect',color:'amber',x:8,y:8,size:3}
  ]}),{layers:[{shape:'triangle',color:'amber',x:1,y:2,size:3}]});
  const row={day:'2026-11-23',type:'lauf',minutes:15,effort:2,note:'a'.repeat(200)};
  const draft=sanitizePracticeDraft('laufen',{sessions:[row,{...row,day:'invalid'}]});
  assert.equal(draft.sessions.length,1);
  assert.equal(draft.sessions[0].effort,'2');
  assert.equal(draft.sessions[0].note.length,180);
});

test('workout CSV imports only supported columns and valid records',()=>{
  const rows=parseWorkoutCsv('datum;typ;minuten;belastung;notiz\r\n2026-11-23;kraft;30;2;Zwei Sätze');
  assert.deepEqual(rows,[{day:'2026-11-23',type:'kraft',minutes:30,effort:'2',note:'Zwei Sätze'}]);
  assert.equal(parseWorkoutCsv('datum;typ;minuten\n2026-02-30;lauf;30'),null);
  assert.equal(parseWorkoutCsv('datum;typ;minuten;herzfrequenz\n2026-11-23;kraft;30;100'),null);
});
