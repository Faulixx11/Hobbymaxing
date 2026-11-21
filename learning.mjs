import {byHobby,quests} from './catalog.mjs?v=04';
import {lessons} from './lessons.mjs';
import {resources} from './resources.mjs';
import {nextQuest} from './state.mjs?v=04';

export const stages = ['Einstieg','Training','Meilenstein','Meisterstück'];

export function questionOptions(id) {
  const lesson=lessons[id];
  const options=[...lesson.alternatives];
  const position=Array.from(id).reduce((sum,char)=>sum+char.codePointAt(0),0)%3;
  options.splice(position,0,lesson.correct);
  return options;
}

export const helpTopics = [
  ['Wie schalte ich neue Level frei?','Im Lernpfad schließt du zuerst den Einstieg ab. Wähle danach eine freigeschaltete Trainingsquest und erreiche den Meilenstein. Danach kannst du dein Meisterstück angehen. Wissenschecks und Blocklabor geben eigene Lern-XP.'],
  ['Wie zählt die Streak?','Eine abgeschlossene Quest oder eine neue App-Übung zählt für den Tag. Mehrere Abschlüsse am gleichen Tag zählen als ein Tag. Für das Wochenziel zählen weiterhin Tage mit abgeschlossenen Quests.'],
  ['Wie funktionieren Rankings?','Jede Sport-Challenge hat eigene Wertungsregeln. Öffne eine Challenge, trage ein Ergebnis ein und teile den Ergebnislink. Freunde können den Link in ihre Rangliste importieren. Die Ansicht zeigt den besten Wert pro Person und Zeitraum.'],
  ['Wo wird mein Fortschritt gespeichert?','Fortschritt, Übungshäkchen und private Ergebnisse liegen im aktuellen Browser. Ein geteiltes Ergebnis enthält deinen Anzeigenamen und Ergebniswert. Beim Löschen der Browserdaten geht der lokale Fortschritt verloren.'],
  ['Wie kann ich eine persönliche Frage stellen?','Du kannst den Lerncoach fragen oder im GitHub-Projekt eine Frage beziehungsweise einen Fehler melden. GitHub-Issues sind öffentlich. Verwende bei deiner Frage daher keine privaten Daten.']
];

const topicPatterns=[
  /level|freischalt|gesperrt|meilenstein|xp|punktestand.*hobby/,
  /streak|serie|wochenziel/,
  /rank|rangliste|challenge.*wert|wertung/,
  /browser|gespeichert|daten\b|sync|konto|anmeld/,
  /support|kontakt|github|fehler meld/
];
const scratchHints=[
  [/variabl|punkte|zähler|zaehler/,'Eine Variable merkt sich einen Wert. Erstelle in Scratch unter „Variablen“ eine Variable namens „Punkte“. Setze sie beim Start auf null und ändere sie beim Einsammeln um eins. Im Blocklabor übst du das in „Punkte sammeln“.'],
  [/taste|koordinat|position|links|rechts|beweg/,'Die x-Position steuert links und rechts. Ein positives x bewegt nach rechts, ein negatives nach links. Lege für jede Pfeiltaste ein eigenes Ereignis mit genau einer passenden Bewegung an.'],
  [/flagge|ereignis|block|sprite|figur|bühne/,'Eine Figur ist ein Objekt auf der Bühne. Ein Ereignisblock wie die grüne Flagge startet die darunter eingerasteten Blöcke. Wähle in der ersten Blocklabor-Übung zuerst die Flagge und dann eine Bewegung.']
];

export function coachReply(state,id,question) {
  const lower=question.trim().toLocaleLowerCase('de');
  const topic=topicPatterns.findIndex(pattern=>pattern.test(lower));
  if(topic>=0) return {text:helpTopics[topic][1],route:topic===2?'ranglisten':undefined};
  const hobby=byHobby[id], lesson=lessons[id];
  if(!hobby||!lesson) return {text:'Wähle ein Hobby für Tipps zur Technik, Ausrüstung oder zur nächsten Quest. Fragen zu XP, Streaks und Ranglisten kannst du auch ohne Hobby stellen.'};
  const next=nextQuest(state,hobby);
  if(id==='scratch') {
    const hint=scratchHints.find(([pattern])=>pattern.test(lower));
    if(hint) return {text:hint[1],route:'labor'};
  }
  if(/video|youtube|ressourc|nachlesen/.test(lower)) return {
    text:resources[id]?.length?'Die verlinkten Tutorials findest du im Lernpfad. Dort steht auch, zu welchem Level und in welcher Sprache sie angeboten werden.':'Für dieses Hobby gibt es eine Einführung und einen Wissenscheck im Lernpfad.',
    route:'pfad/'+id
  };
  if(/material|ausrüstung|ausruestung|werkzeug|brauche|kosten|gerät/.test(lower)) return {text:'Für deinen Lernpfad brauchst du '+hobby.materials+'. Prüfe die Hinweise auf der jeweiligen Quest für zusätzliche Anforderungen.',route:'pfad/'+id};
  if(/zeit|dauer|minuten|nächst|naechst|weiter|start|anfang|einstieg|schritt|zuerst|beginn/.test(lower)) {
    if(!next) return {text:'Du hast den Pfad abgeschlossen. Du kannst eine Übung wiederholen und ein neues Ergebnis mit deinem vorherigen Versuch vergleichen.',route:'pfad/'+id};
    return {text:next.title+' dauert ungefähr '+next.minutes+' Minuten. Dein erster Schritt: '+next.steps[0].replace(/[.!?]$/,'')+'.',route:'quest/'+next.id};
  }
  if(/fehler|klappt|häng|haeng|problem|schief|tipp|hilfe|stock/.test(lower)) return {text:lesson.trouble,route:'pfad/'+id};
  if(/technik|wie|erklär|erklaer|lernen|funktioniert|was ist/.test(lower)) return {text:lesson.technique,route:'pfad/'+id};
  return {text:'Dazu habe ich keine konkrete Antwort. Für '+hobby.name+' kann ich dir den Einstieg, Übungen, Materialien und typische Schwierigkeiten erklären.',route:'pfad/'+id};
}

const commands = {
  flag:{label:'Wenn Start gedrückt',kind:'event'}, rightKey:{label:'Wenn Rechts gedrückt',kind:'event'},leftKey:{label:'Wenn Links gedrückt',kind:'event'},
  right:{label:'Gehe 1 Feld nach rechts',kind:'move',delta:1},left:{label:'Gehe 1 Feld nach links',kind:'move',delta:-1},
  reset:{label:'Setze Punktestand auf 0',kind:'state'},collect:{label:'Wenn am Stern: Sammle ihn',kind:'state'}
};
export const blocks = commands;
export const experiments = [
  {id:'start',title:'Die Figur startet',idea:'Ein Ereignis entscheidet, wann die folgenden Befehle laufen. Die Plusrichtung auf der Bühne zeigt nach rechts.',goal:'Lass die Figur beim Start genau ein Feld nach rechts laufen.',hint:'Beginne mit „Wenn Start gedrückt“. Unter dieses Ereignis gehört eine Bewegung nach rechts.',palette:['flag','left','right'],events:['flag']},
  {id:'steuern',title:'Pfeiltasten steuern',idea:'Eine Taste kann ein eigenes Skript starten. Ein Bewegungsblock hängt immer am letzten Ereignisblock darüber.',goal:'Programmiere je ein Skript für Rechts und Links. Die Figur soll einen Schritt hin und anschließend zurück machen.',hint:'Setze „Wenn Rechts gedrückt“ vor die Rechtsbewegung und „Wenn Links gedrückt“ vor die Linksbewegung.',palette:['rightKey','leftKey','right','left'],events:['rightKey','leftKey']},
  {id:'sammeln',title:'Punkte sammeln',idea:'Ein Punktestand ist eine Variable. Eine bedingte Aktion läuft nur, wenn die passende Situation eintritt.',goal:'Setze beim Start die Punkte auf null, gehe zum Stern und sammle ihn. Bei einem zweiten Start soll der Punktestand wieder eins sein.',hint:'Verbinde mit Start zuerst das Zurücksetzen, dann die Bewegung nach rechts und danach das Einsammeln am Stern.',palette:['flag','right','left','reset','collect'],events:['flag','flag']}
];

export function runBlocks(list,exercise) {
  if(list.length>12||list.some(key=>!exercise.palette.includes(key))) return null;
  const scripts={};
  let active='';
  for(const key of list) {
    const block=blocks[key];
    if(block.kind==='event') {
      active=key;
      (scripts[active] ??= []).push([]);
    } else {
      if(!active) return {frames:[],pass:false,message:'Ein Bewegungs- oder Aktionsblock braucht ein Ereignis davor.'};
      scripts[active].at(-1).push(key);
    }
  }
  let pos=2,points=0,star=true;
  const frames=[];
  for(const event of exercise.events) {
    if(event==='flag') {pos=2;star=true;}
    for(const script of scripts[event]||[]) for(const key of script) {
      if(blocks[key].kind==='move') pos=Math.max(0,Math.min(4,pos+blocks[key].delta));
      if(key==='reset') points=0;
      if(key==='collect'&&star&&pos===3) {points++;star=false;}
    }
    frames.push({event,pos,points,star});
  }
  const pass=exercise.id==='start'?frames[0].pos===3:
    exercise.id==='steuern'?frames[0].pos===3&&frames[1].pos===2:
    frames.every(frame=>frame.pos===3&&frame.points===1&&!frame.star);
  return {frames,pass,message:pass?'Test bestanden. Dein Programm erfüllt das Ziel.':'Das Ergebnis passt noch nicht. Schau dir die Position oder den Punktestand nach jedem Ereignis an.'};
}
