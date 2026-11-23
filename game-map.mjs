export const checkpoints = [
  {name:'Basislager', xp:0, x:15, y:81, icon:'⛺', reward:'Scouting', mission:'Entdecke ein Hobby und markiere eine Quest für später.', link:'entdecken', label:'Hobby auswählen'},
  {name:'Waldlichtung', xp:30, x:42, y:69, icon:'🌲', reward:'Foto-Spur', mission:'Fotografiere dreimal dasselbe Motiv aus unterschiedlichen Höhen. Wähle das Bild, auf dem dein Motiv am klarsten wirkt.', link:'praxis/fotografie', label:'Fotostudio öffnen'},
  {name:'Taktbrücke', xp:100, x:64, y:53, icon:'🌉', reward:'Taktprobe', mission:'Klopfe acht gleichmäßige Schläge. Wiederhole sie langsamer und vergleiche, welches Tempo sich leichter halten lässt.', link:'praxis/beats', label:'Rhythmusstudio öffnen'},
  {name:'Sternwarte', xp:225, x:35, y:34, icon:'🔭', reward:'Woche in drei Etappen', mission:'Plane drei kurze Übungen. Lege die anspruchsvollste auf einen Tag, an dem du Zeit für einen zweiten Versuch hast.', link:'woche', label:'Etappen wählen'},
  {name:'Gipfel', xp:450, x:77, y:19, icon:'🚩', reward:'Gipfelabzeichen', mission:'Wähle ein abgeschlossenes Projekt und notiere, was du heute ohne Anleitung wiederholen könntest.', link:'galerie', label:'Projektgalerie öffnen'}
];

export function mapProgress(xp) {
  const current=checkpoints.findLastIndex(checkpoint=>checkpoint.xp<=xp);
  return {current,next:checkpoints[current+1]||null};
}

export function gameMapPage(xp, id) {
  const {current,next}=mapProgress(xp);
  const index=checkpoints.findIndex((_,i)=>String(i+1)===id);
  const selected=index<0?current:index;
  const station=checkpoints[selected];
  const locked=selected>current;
  const rank=checkpoints[current].xp;
  return `<div class="page-heading"><h1>Spielkarte</h1><p>Deine Figur zieht mit jedem XP-Meilenstein weiter.</p></div>
  <div class="game-map-layout">
    <div class="game-map" role="group" aria-label="Spielpfad mit fünf Stationen">
      <span class="map-landmark lake" aria-hidden="true">≈ ≈</span>
      <span class="map-landmark trees" aria-hidden="true">▲▲▲</span>
      <span class="map-landmark ridge" aria-hidden="true">▲ ▲</span>
      <span class="map-landmark hills" aria-hidden="true">▲▲</span>
      ${checkpoints.slice(1).map((point,i)=>{
        const start=checkpoints[i];
        const dx=point.x-start.x,dy=point.y-start.y;
        return `<span class="map-track ${i<current?'walked':''}" style="--x:${start.x};--y:${start.y};--dx:${dx};--dy:${dy}" aria-hidden="true"></span>`;
      }).join('')}
      ${checkpoints.map(({name,x,y,icon,xp},i)=>`<a class="map-node ${i>current?'locked':''} ${i===current?'here':''}" href="#karte/${i+1}" style="--x:${x};--y:${y}" ${i===selected?'aria-current="true"':''} aria-label="Level ${i+1}, ${name}, ${xp} XP${i>current?', gesperrt':i===current?', Standort deiner Figur':', freigeschaltet'}">
        ${i===current?'<span class="map-player" aria-hidden="true">🧍</span>':''}<span class="map-pin" aria-hidden="true">${i>current?'🔒':icon}</span><span class="map-label" aria-hidden="true">${name}</span></a>`).join('')}
    </div>
    <section class="surface utility map-dossier" aria-labelledby="map-station">
      <p class="eyebrow">Level ${selected+1} · ${station.xp} XP</p><h2 id="map-station">${station.name}</h2>
      ${locked?`<p>Noch ${station.xp-xp} XP bis zur Freischaltung.</p>`:
        `<h3>${station.reward}</h3><p>${station.mission}</p><a class="button primary" href="#${station.link}">${station.label}</a>`}
      <div class="map-summary"><strong>${xp} XP · Level ${current+1} von ${checkpoints.length}</strong>
      ${next?`<progress aria-label="Fortschritt zur nächsten Station" value="${xp-rank}" max="${next.xp-rank}"></progress><p>Noch ${next.xp-xp} XP bis ${next.name}.</p><a class="text-button" href="#heute">XP durch Quests und Übungen sammeln</a>`:'<p>Du hast alle Stationen freigeschaltet.</p>'}</div>
    </section>
  </div>`;
}
