export const studios = {
  pixelart:{
    title:'Eine Silhouette aus Pixeln',size:5,rows:5,
    task:'Zeichne einen Pfeil nach oben. Setze die freie Spitze in die Mitte der oberen Reihe und nutze das Muster als Vorlage.',
    instruction:'Prüfe zuerst die Form ohne Farbe. Eine gut lesbare Silhouette erkennt man auch aus wenigen Pixeln.',
    solution:[2,6,7,8,10,11,12,13,14,17,22],preview:true
  },
  schach:{
    title:'Springertraining',size:8,rows:8,origin:35,
    task:'Markiere alle Felder, die der weiße Springer von d4 aus in einem Zug erreichen darf.',
    instruction:'Ein Springer zieht zwei Felder in einer Richtung und dann ein Feld im rechten Winkel. Auf diesem Brett stehen keine anderen Figuren.',
    solution:[18,20,25,29,41,45,50,52]
  },
  beats:{
    title:'Dein erster Drumbeat',size:8,rows:2,
    task:'Setze die Kick auf 1 und 3 sowie die Snare auf 2 und 4. Jede Spalte entspricht einem halben Schlag.',
    instruction:'Die erste Reihe spielt die Kick, die zweite die Snare. Die Spalten zeigen 1 und 2 und 3 und 4 und.',
    solution:[0,4,10,14]
  }
};

export function studioCell(id,index) {
  const studio=studios[id];
  const x=index%studio.size, y=Math.floor(index/studio.size);
  if(id==='schach') return String.fromCharCode(97+x)+(8-y);
  if(id==='beats') return (y===0?'Kick':'Snare')+', Schlag '+(Math.floor(x/2)+1)+(x%2?' und':'');
  return 'Zeile '+(y+1)+', Spalte '+(x+1);
}

export function checkStudio(id,selected) {
  const expected=new Set(studios[id].solution);
  const missing=studios[id].solution.filter(index=>!selected.includes(index)).length;
  const extra=selected.filter(index=>!expected.has(index)).length;
  return {missing,extra,pass:missing===0&&extra===0};
}

export async function playBeat(selected) {
  const audio=new AudioContext();
  try {
    await audio.resume();
    const start=audio.currentTime+.05;
    for(const index of selected) {
      const kick=index<8;
      const pulse=audio.createOscillator();
      const volume=audio.createGain();
      const time=start+(index%8)*.25;
      pulse.type=kick?'sine':'triangle';
      pulse.frequency.setValueAtTime(kick?115:340,time);
      pulse.frequency.exponentialRampToValueAtTime(kick?40:155,time+.12);
      volume.gain.setValueAtTime(kick ? .23 : .13,time);
      volume.gain.exponentialRampToValueAtTime(.001,time+.14);
      pulse.connect(volume).connect(audio.destination);
      pulse.start(time);
      pulse.stop(time+.15);
    }
    await new Promise(resolve=>setTimeout(resolve,2200));
  } finally {
    await audio.close();
  }
}
