import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,nextQuest,unlocks} from './state.mjs?v=06';
import {languages,selectSpeechVoice,moods,moodQuests} from './play.mjs';
import {videoSearchUrl,resourcesForStage} from './resources.mjs';
import {hobbies,quests} from './catalog.mjs?v=06';

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

