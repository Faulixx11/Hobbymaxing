import { lessons } from './lessons.mjs';

// One entry per hobby: appeal, safe setup, an inexpensive material option and a small first try.
const starters = `
fussball|Ein sauberer Pass lässt dich Tempo und Richtung unmittelbar steuern.|Übe auf einer freien Fläche. Richte Pässe weg von Menschen, Verkehr und Glas.|Zwei weiche Kleidungsstücke markieren das Tor. Leih dir einen Ball für draußen.|Rolle einen weichen Ball aus einem Meter durch zwei Markierungen. Verändere danach nur den Abstand.
tennis|Du spürst sofort, wie Schlägerwinkel und Treffpunkt den Ballflug verändern.|Lass Platz um den Schläger. Sammle lose Bälle ein, bevor die nächste Serie beginnt.|Frag beim Schnuppertraining nach einem Leihschläger und einem weichen Trainingsball.|Lass einen Ball neben dir einmal aufspringen und fang ihn auf Hüfthöhe.
laufen|Ein ruhiger Wechsel aus Gehen und Traben macht Fortschritt auf derselben Runde spürbar.|Wähle eine übersichtliche, ebene Strecke. Beende die Einheit bei Beschwerden.|Starte mit bequemen Schuhen, die du bereits hast. Eine normale Uhr reicht zum Zeitnehmen.|Geh fünf Minuten auf einer ebenen Strecke und suche einen kurzen, freien Abschnitt für die erste Einheit.
basketball|Du kannst sofort hören und fühlen, ob dein Dribbling gleichmäßig ist.|Übe auf einem trockenen Platz mit Abstand zu anderen und fege lose Hindernisse weg.|Ein geliehener Ball reicht für die ersten zwei Etappen. Nutze später einen erlaubten öffentlichen Korb.|Probiere fünf ruhige Dribblings pro Hand auf derselben Stelle.
tischtennis|Schon eine kleine Winkeländerung verwandelt einen hohen Ball in ein kontrolliertes Zuspiel.|Lass seitlich Platz und sammle Bälle ein, bevor jemand auf sie tritt.|Frag bei einem offenen Treff nach Leihschlägern und einer Platte.|Balanciere den Ball auf dem Blatt und neige es langsam. Beobachte, wann er rollt.
tanzen|Aus wenigen Schritten entsteht ein eigener Rhythmus, den du variieren kannst.|Räume den Boden frei und wähle rutschfesten Untergrund. Beweg dich im angenehmen Bereich.|Zähle laut oder klatsche selbst. Für den Einstieg brauchst du keine Musik-App.|Klatsche acht gleichmäßige Schläge und setze beim zweiten Durchgang einen leichten Schritt pro Schlag.
yoga|An einer kurzen Pause kannst du ausprobieren, welche Bewegungen dir im Alltag angenehm sind.|Nutze sicheren Halt, bleib im angenehmen Bewegungsbereich und stoppe bei Beschwerden.|Ein stabiler Stuhl und ein freier Boden reichen. Lass wackelige Hocker stehen.|Setz dich mit beiden Füßen auf den Boden und beobachte, wie sich eine langsame Schulterbewegung anfühlt.
radfahren|Ruhiges Anfahren und Bremsen eröffnen dir mehr entspannte Strecken.|Übe zuerst außerhalb des Verkehrs. Prüfe das geliehene oder eigene Rad vor dem Start.|Ein passendes, verkehrssicheres Leihfahrrad genügt für die Einstiegsübung.|Such eine erlaubte freie Fläche und prüfe am stehenden Rad, wo Bremsen und Stellmöglichkeiten sind.
badminton|Ein langsam fliegender Federball macht kleine Änderungen der Zuspielhöhe gut sichtbar.|Haltet Schlagabstand. Stoppt die Übung, wenn jemand das Feld quert.|Leiht Schläger und Federball bei einem offenen Termin aus.|Werft den Federball mit der Hand nacheinander flach und hoch und vergleicht die Flugzeiten.
wandern|Auf einer bekannten Runde eröffnet schon eine bewusste Abzweigung einen neuen Blick.|Prüfe Wetter und Wegzustand. Plane eine Umkehrzeit und bleib auf erlaubten Wegen.|Eine öffentliche Wanderkarte und vorhandene passende Schuhe reichen für eine kurze, leichte Runde.|Markiere auf einer Karte einen bekannten Wegpunkt und einen einfachen Rückweg.
fotografie|Dasselbe Motiv erzählt mit einem neuen Ausschnitt oder anderem Licht eine andere Geschichte.|Fotografiere vom sicheren Stand aus. Bitte erkennbare Personen um Erlaubnis, bevor du sie aufnimmst oder zeigst.|Verwende die vorhandene Handykamera. Ein Fenster und ein Blatt Papier genügen als Lichtquelle und Hintergrund.|Rahme dieselbe Tasse einmal weit und einmal eng ein. Beschreibe, was der zweite Bildrand hinzugefügt oder entfernt hat.
vogelbeobachtung|Mit wenigen Merkmalen wird aus einem unbekannten Vogel eine Beobachtung, die du später wiedererkennst.|Beobachte aus Abstand. Halte dich von Nestern fern und störe keine Tiere.|Ein Fenster, Papier und ein Stift reichen. Ein Fernglas ist optional.|Beobachte einen Vogel zwei Minuten und notiere eine Farbe, seine ungefähre Größe und eine Bewegung.
garten|Ein Topfkraut zeigt dir, wie Licht, Standort und Gießen zusammenwirken.|Verwende für die Küche nur eindeutig gekennzeichnete essbare Kräuter. Stell Töpfe kippsicher auf.|Nutze einen sauberen, geeigneten Topf mit Abfluss und einen vorhandenen Untersetzer.|Vergleiche morgens und abends zwei Fensterplätze und notiere, wo direktes Licht ankommt.
astronomie|Aus ein paar Skizzen machst du eine eigene Beobachtungsreihe zum Mond.|Beobachte von einer sicheren Stelle. Richte optische Hilfsmittel nie auf die Sonne.|Eine freie Sicht, Papier und Stift reichen für die ersten Mondskizzen.|Zeichne die helle Form des sichtbaren Mondes in einen Kreis. Ergänze Uhrzeit und Blickrichtung.
geocaching|Ein Hinweis kann in einer bekannten Straße plötzlich einen neuen Ort sichtbar machen.|Meide gesperrte Wege, Privatgelände und Orte mit Absturzgefahr. Hinterlasse den Fundort unverändert.|Prüfe einen öffentlichen Eintrag auf einer vorhandenen Karte. Ein eigener besonderer Empfänger ist für die Planung entbehrlich.|Lies Geländeangabe und Hinweis eines Eintrags. Entwirf den erlaubten Zugang auf Papier.
naturjournal|Über kleine Skizzen siehst du, was sich an demselben Ort verändert.|Lass Pflanzen und Tiere am Fundort. Schreib Beobachtungen von einer sicheren Stelle aus auf.|Einseitig bedrucktes Papier und ein Bleistift reichen.|Skizziere den Rand eines sichtbaren Blatts und nenne zwei Merkmale, die du tatsächlich beobachtet hast.
zeichnen|Wenn du ein Objekt in Grundformen zerlegst, lässt sich seine Wirkung gezielt verändern.|Lege das Material auf eine stabile Arbeitsfläche und mach bei Bedarf Handpausen.|Ein weicher Bleistift, Rückseiten von Papier und ein Haushaltsgegenstand genügen.|Zeichne die Gesamtform einer Tasse als Rechteck mit Ellipse. Vergleiche Breite und Höhe mit der Tasse.
aquarell|Mit der Wassermenge legst du fest, ob eine Farbe weich verläuft oder scharf begrenzt bleibt.|Arbeite mit dafür vorgesehenem Malmaterial und halte das Malwasser getrennt von Getränken.|Teste eine einzige Farbe auf einem kleinen Stück geeignetem Papier.|Male je einen kurzen Strich auf trockenes und leicht feuchtes Papier. Vergleiche die Ränder nach dem Trocknen.
schreiben|Mit wenigen gezielten Details lässt sich dieselbe Szene ruhig, komisch oder angespannt erzählen.|Bleib bei öffentlichen Fassungen bei erfundenen Personen oder frage vor persönlichen Details um Zustimmung.|Ein Notizzettel oder der vorhandene Texteditor genügt.|Beschreibe eine Person, die zu spät kommt, in drei Sätzen. Gib ihren Grund über eine Handlung zu erkennen.
handlettering|Buchstaben verwandeln sich in Formen, deren Breite, Höhe und Abstand du bewusst gestaltest.|Halte die Hand locker und lege zwischen Wiederholungen Pausen ein.|Zeichne Hilfslinien mit einem Haushaltlineal. Ein Bleistift genügt für schmale und ausgemalte breite Striche.|Zieh drei gleich lange Linien und verbreitere nur die Abstriche.
film|Ein Perspektivwechsel kann aus derselben Bewegung eine verständliche kleine Geschichte machen.|Filme vom sicheren Stand aus. Hol Erlaubnis für Aufnahmen von Personen und nutze erlaubtes Material.|Mit dem Handy und seinem vorhandenen Schnittwerkzeug geht ein erster Drei-Einstellungen-Clip.|Filme, wie eine Hand einen Stift aufnimmt, einmal als Übersicht und einmal als Detail.
collage|Du kannst Bildaufbau unmittelbar testen, indem du dieselben Teile einfach anders legst.|Schneide auf einer stabilen Fläche und folge den Hinweisen auf dem Kleber.|Verpackungspapier, alte Zeitschriften und ein Blatt als Unterlage reichen.|Lege drei Schnipsel zuerst dicht zusammen und dann weit auseinander. Wähle die Anordnung mit dem klareren Schwerpunkt.
pixelart|Jeder einzelne Bildpunkt verändert die erkennbare Silhouette.|Mach bei längerer Bildschirmarbeit Pausen. Prüfe kleine Motive mit angenehmer Vergrößerung.|Kariertes Papier und ein Stift ersetzen für die erste Silhouette einen Editor.|Zeichne einen Schlüssel in acht mal acht Kästchen und prüfe, ob er mit nur einer Farbe erkennbar bleibt.
gitarre|Zwei saubere Akkorde genügen, um Rhythmus und erste Songteile zu begleiten.|Spiel in bequemer Haltung. Unterbrich, wenn Finger oder Handgelenk schmerzen.|Frag bei einer Musikschule oder im Bekanntenkreis nach einem passenden Leihinstrument.|Greif einen Akkord und zupfe jede Saite einzeln. Merke dir, welche sauber klingt.
klavier|Eine einfache Tastenfolge klingt mit einem neuen Rhythmus gleich anders.|Wähle eine bequeme Sitzhöhe. Spiel mit lockerem Handgelenk und mach Pausen.|Ein Leihkeyboard reicht. Zum Kennenlernen der Tastenordnung genügt zunächst eine Zeichnung.|Suche links von jeder Zweiergruppe schwarzer Tasten ein C und vergleiche die verschiedenen Höhen.
gesang|Dieselbe Melodie bekommt durch eine andere Betonung eine neue Absicht.|Bleib bei angenehmer Lage und Lautstärke. Beende die Übung bei Beschwerden.|Ein ruhiger Ort genügt. Eine Aufnahme ist optional.|Summe drei angenehme Töne und prüfe, bei welcher Lautstärke der Klang locker bleibt.
beats|Du veränderst mit einem Klick, ob ein gleichmäßiger Beat ruhig, dicht oder überraschend wirkt.|Halte Kopfhörer leise. Verwende eigene oder zur Nutzung freigegebene Klänge.|Das Übungsstudio in Hobbymaxing genügt für den ersten Beat. Auf Papier kannst du die Schläge vorplanen.|Klopfe vier gleichmäßige Schläge. Klatsche nur auf zwei und vier.
theater|Eine Szene kann sich mit einem einzigen angenommenen Vorschlag in eine neue Richtung entwickeln.|Klärt erlaubte Themen und persönlichen Abstand. Berührungen und Aufnahmen brauchen Zustimmung.|Startet im eigenen freien Raum ohne Requisiten.|Sprich „Ich bin gleich da“ mit zwei unterschiedlichen Absichten. Eine zweite Person beschreibt, welche sie erkennt.
podcast|Mit einer guten Frage und einem konkreten Detail wird aus einer Minute eine hörbare Geschichte.|Hol Zustimmung zur Aufnahme und zum Teilen ein. Lass private Angaben im Rohmaterial weg.|Die vorhandene Aufnahme-App und ein ruhiger Raum genügen.|Erzähl 30 Sekunden lang von einem Gegenstand. Hör nach, an welcher Stelle das Thema klar wird.
kochen|Du kannst schmecken, wie eine einzelne Änderung ein einfaches Gericht beeinflusst.|Wähle eine stabile Arbeitsfläche, halte Griffe und heiße Gefäße sicher und prüfe Zutaten auf Unverträglichkeiten.|Vorhandene Nudeln und eine einfache Tomatenbasis genügen. Leih einen geeigneten Topf, wenn du keinen hast.|Lege Zutaten, Topf und Schüssel bereit. Schreib die zwei Schritte auf, die zeitlich zusammenpassen müssen.
backen|Mit einer einzelnen Änderung kannst du im fertigen Gebäck vergleichen, was wirklich einen Unterschied macht.|Verwende trockene Ofenhandschuhe und leg heißes Backgeschirr auf einen hitzefesten Platz.|Backe zunächst eine kleine Probe nach vorhandenem Rezept und nutze vorhandene Formen.|Lies ein Grundrezept und lege Zutaten nach der Reihenfolge bereit, in der sie zusammenkommen.
brot|Teig verändert sich sichtbar. Mit eigenen Zeitmarken kannst du seinen Verlauf besser nachvollziehen.|Arbeite sauber und lass den Ofenbereich frei. Nutze hitzefeste Unterlagen und trockene Ofenhandschuhe.|Ein einzelnes kleines Brot spart Zutaten beim ersten Test.|Lies das Hefeteigrezept und markiere Mischen, Ruhezeit und Backbeginn auf einer Zeitleiste.
tee|Ein zweiter Aufguss macht feine Unterschiede in Geruch und Geschmack erkennbar.|Stell hitzefeste Tassen stabil ab und lass die Proben vor dem Trinken abkühlen.|Zwei vorhandene hitzefeste Tassen, ein Teebeutel und eine Uhr reichen.|Riech am trockenen Tee und notiere ein bestimmtes Aroma, das du im Aufguss wiederfinden möchtest.
mealprep|Mit einem geplanten Einkauf machst du mehr aus denselben Zutaten.|Verwende saubere geeignete Behälter. Halte Vorgaben zur Kühlung und Aufbewahrung der Zutaten ein.|Nutze vorhandene, intakte Lebensmittelbehälter und plane zuerst nur eine zusätzliche Portion.|Nenne eine Zutat aus deinem Vorrat, die du in zwei Gerichten verwenden kannst.
mocktails|Ein kleiner Spritzer Säure oder ein anderer Anteil Sprudel macht sich direkt bemerkbar.|Prüfe Zutaten auf Unverträglichkeiten und verwende für jede Probe ein sauberes Glas.|Verkleinere das Rezept auf zwei Probierportionen. Ein Löffel dient als Maß.|Probiere dieselbe Basis einmal pur und einmal mit einem Löffel Sprudel. Notiere den Unterschied.
origami|Aus einem einzigen Blatt entsteht durch wenige präzise Falten eine erkennbare Form.|Falte auf einem stabilen, freien Tisch. Lege eine Schere nach dem Zuschneiden weg.|Schneide ein Quadrat aus gebrauchten Büro- oder Geschenkpapieren zu.|Falte das Quadrat einmal mittig und prüfe vor dem Andrücken, ob die Ecken übereinanderliegen.
haekeln|Durch gleichmäßige Schlaufen entsteht aus einem losen Faden eine eigene Fläche.|Halte Nadel und Faden locker. Leg zwischendurch die Arbeit ab.|Frag nach einem dickeren, glatten Garnrest und einer passenden Leihnadel.|Häkle fünf Luftmaschen und schau, in welche du die Nadel leicht wieder einführen kannst.
naehen|Ein paar Stiche können einen losen Knopf retten oder aus einem Stoffrest etwas Neues machen.|Lege Nadel und Schere an einen festen Platz und zähle Nadeln nach der Übung.|Ein sauberes altes Baumwollstück eignet sich als Probe. Leih ein Nähset aus.|Zeichne eine kurze Linie auf dem Stoff und nähe drei gleichmäßig verteilte Vorstiche.
sticken|Mit der Richtung und Länge deiner Stiche kannst du eine Linie kantig oder weich zeichnen.|Arbeite mit gutem Licht und bewahre die Nadel zwischen den Durchgängen sicher auf.|Nutze einen vorhandenen Stoffrest und einen kurzen Garnrest. Für die erste Linie ist ein Rahmen optional.|Markiere drei Punkte auf dem Stoff und verbinde sie mit kurzen Rückstichen.
ton|Die Oberfläche verändert sich spürbar, wenn du Druck und Richtung deiner Finger variierst.|Nutze geeignete Modelliermasse nach Anleitung. Verwende Übungsstücke als Deko.|Für erste Techniken eignet sich ein kleines Stück vorhandene Modelliermasse. Für eine reine Formprobe geht Knete.|Drück eine kleine Vertiefung in eine Kugel und vergleiche den Rand an drei Stellen.
upcycling|Eine weggeworfene Verpackung kann genau die Form haben, die du für eine Aufbewahrung brauchst.|Verwende sauberes, trockenes Material ohne scharfe Kanten und schneide auf einer stabilen Unterlage.|Ein vorhandener Karton und Papierstreifen reichen für einen ersten Einsatz.|Miss einen Gegenstand, der regelmäßig herumliegt, und suche eine Box, in die er bequem passt.
papier|Mit einer Falte oder Klebelasche wird ein dünnes Blatt zu einer belastbaren kleinen Form.|Schneide langsam auf einer stabilen Unterlage und lege scharfe Werkzeuge nach Gebrauch weg.|Bedruckte Rückseiten reichen für den ersten Würfel. Schneide den Entwurf probeweise klein aus.|Falte ein Papierstück zu einem Winkel und vergleiche, wie gut es flach und geknickt steht.
scratch|Eine kleine Änderung im Blockstapel ist sofort auf der Bühne sichtbar.|Arbeite im Blocklabor oder im offiziellen Editor. Lass persönliche Daten aus Figuren und Projekttexten.|Das kostenlose Blocklabor und der Scratch-Editor reichen. Skizziere Ereignisse bei Bedarf zuerst auf Papier.|Sag voraus, was nach dem Startsignal passiert. Prüfe deine Vorhersage mit einem Bewegungsblock.
elektronik|Im Simulator zeigt der Zustand einer LED sofort, ob deine Schaltung wie geplant reagiert.|Baue die Übung ausschließlich im Simulator auf.|Ein kostenlos zugänglicher Simulator ist genug. Zeichne die Verbindung der Bauteile vorab auf Papier.|Zeichne den geschlossenen Weg von der Quelle über Widerstand und LED zurück zur Quelle.
3d|Aus wenigen Grundkörpern wird ein Modell, das sich aus mehreren Blickwinkeln beurteilen lässt.|Sichere Zwischenschritte lokal und mach bei längerer Bildschirmarbeit Pausen.|Nutze einen vorhandenen einfachen 3D-Editor. Für die Planung reichen Papier und Stift.|Skizziere Vorderansicht und Seitenansicht einer Schachtel mit einem zylindrischen Aufsatz.
kartografie|Eine leicht lesbare Karte zeigt genau die Merkmale, die jemand zum Orientieren braucht.|Vermiss nur zugängliche Orte. Lass private Adressen und Wege in geteilten Karten weg.|Kariertes Papier, ein vorhandenes Lineal und ein Stift genügen.|Miss zwei Kanten eines Tisches und übertrage das Verhältnis auf ein Stück kariertes Papier.
sprachen|Ein kurzer Satz kann sofort eine Frage lösen oder eine echte Begegnung eröffnen.|Wähle neutrale Beispielsätze. Halte fremde Stimmen und persönliche Angaben aus Aufnahmen heraus.|Verwende die Satzkarten in Hobbymaxing oder ein frei zugängliches Wörterbuch mit Hörbeispielen.|Hör eine Begrüßung an und sag sie danach aus dem Gedächtnis. Achte auf die Stelle, die am stärksten betont klingt.
gedaechtnis|Du kannst ausprobieren, welche Verknüpfung dir beim späteren Abruf tatsächlich hilft.|Nimm neutrale Übungswörter und verwende keine persönlichen Daten.|Fünf Wörter auf Papier und eine vorhandene Uhr reichen.|Präge dir drei Begriffe als zusammenhängende Szene ein. Decke sie ab und schreibe sie auf.
schach|Schon mit wenigen Figuren kannst du eigene Pläne entwickeln und die Antwort des Gegenübers vorausdenken.|Wenn du online spielst, verwende einen neutralen Anzeigenamen und prüfe die Privatsphäre-Einstellungen.|Das Studienbrett in der App oder ein selbst gezeichnetes Raster mit Papierfiguren reicht für den Einstieg.|Zeig von einem Mittelfeld aus auf alle erreichbaren Springerfelder. Erkläre den gemeinsamen Bewegungsablauf.
jonglieren|Aus einer sauberen Wurfkurve entsteht ein Ablauf, der sich auf beide Hände übertragen lässt.|Nutze weiche Gegenstände und räum Gläser sowie Hindernisse aus dem Übungsbereich.|Gerollte Socken ersetzen Jonglierbälle.|Wirf eine Socke in einem ruhigen Bogen zwischen den Händen hin und her. Vergleiche die Höhe beider Richtungen.
brettspiel|Wenn du eine Regel veränderst, kannst du beobachten, wie sich Entscheidungen am Tisch verschieben.|Einigt euch vor der Runde über Regeln und Spielzeit. Halte persönliche Ergebnisse privat.|Verwende ein vorhandenes Spiel oder leihe eines in einer Bibliothek aus.|Erkläre Ziel, einen Beispielzug und das Spielende in drei Sätzen.
zauberwuerfel|Weil die Mittelfarben gleich bleiben, kannst du beim Drehen kleine überprüfbare Ziele setzen.|Drehe locker und ohne Kraft. Leg den Würfel weg, wenn er klemmt.|Leih einen frei beweglichen Würfel. Für die Vorbereitung reicht eine Skizze der Seitenmitten.|Such eine Kante mit zwei Farben und zeig die zwei Mittelfelder, neben die sie gehört.
ehrenamt|Ein Schnuppertermin kann zeigen, welche Aufgabe und welcher Rhythmus zu dir passen.|Prüfe Angebote über offizielle Stellen und teile nur erforderliche Angaben. Klär Altersvoraussetzungen.|Nutze öffentliche Programme von Bibliotheken oder Vereinen für die erste Recherche.|Schreib eine Aufgabe auf, die du gerne übernimmst, und ein realistisches freies Zeitfenster.
lesen|Eine präzise Frage macht selbst einen kurzen Text zum Ausgangspunkt einer eigenen Entdeckung.|Frag vor dem Weitergeben persönlicher Gesprächsnotizen um Zustimmung.|Ein vorhandenes Buch oder eine Bibliotheksausleihe reicht. Ein Notizzettel markiert die Stelle.|Lies einen Absatz mit einer Frage zur Hauptfigur. Markiere den Satz, der eine erste Antwort liefert.
`;

const startingNotes = Object.fromEntries(starters.trim().split('\n').map(row => {
  const [id, appeal, safety, alternative, smallStart] = row.split('|');
  return [id, { appeal, safety, alternative, smallStart }];
}));

const featured = {
  tennis: {
    diagnosis: ['Lass einen Ball seitlich aufkommen, fang ihn auf Hüfthöhe und wiederhole den Versuch fünfmal an derselben Stelle.', 'Du kannst bei drei Versuchen ruhig stehen bleiben und vor deinem Körper fangen.'],
    routes: [['Allein üben', 'Nimm eine freigegebene Wand oder wiederhole den Aufsprungtest. Kontrolliere Abstand und Schlägerwinkel.'], ['Im Duo üben', 'Beginnt mit einem kurzen, kooperativen Zuspiel und wechselt euch mit der Zielzone ab.']],
    rubric: ['Beide Personen starten aus einem vorher festgelegten Abstand und wechseln nach jedem Versuch die Rolle.', 'Drei Durchgänge lassen sich anhand derselben Zielzone vergleichen.', 'Die Notiz verbindet das beobachtete Ergebnis mit einer konkreten Änderung am Treffpunkt.'],
    stages: [
      ['Der Ball bleibt mit lockerer Hand und fast waagerechtem Schläger ruhig.', 'Das Schlägerblatt kippt bei jedem Wackler abrupt.', 'Halte den Ball im Stand, bevor du einen Schritt dazunimmst.', 'Mit einem ruhigen Blatt erkennst du im Training leichter, wann sich dein Schlägerwinkel verändert.'],
      ['Zwei kurze Zuspiele landen mit ähnlicher Höhe in demselben großen Ziel.', 'Du korrigierst mit einem schnellen großen Schwung und der Ball wird zu lang.', 'Kürze die Bewegung und lass den Ball vor dem Körper aufsteigen.', 'Vergleichbare Zuspiele machen einen gemeinsamen Ballwechsel planbar.'],
      ['Beide erreichen den Ball ohne Sprint. Die Serie endet und ihr startet vom gleichen Platz.', 'Ihr spielt sofort auf Punkte und verliert den gemeinsamen Rhythmus.', 'Verkürzt das Feld und zählt in der nächsten Serie zusammenhängende Kontakte.', 'Mit einer stabilen Serie kannst du eine Zielzone erproben und trotzdem spielbar zurückgeben.'],
      ['Drei Durchgänge zeigen, bei welchem Abstand der Treffer am ehesten wiederholbar ist.', 'Ihr verändert Zielzone, Ball und Abstand gleichzeitig.', 'Behalte Ziel und Ball bei und verändere nur die Position beim Treffpunkt.', 'Du hältst eine Bedingung fest, unter der eine gezielte Vorhand funktioniert.']
    ]
  },
  vogelbeobachtung: {
    diagnosis: ['Bleib fünf Minuten an einem Fenster oder an einem erlaubten ruhigen Platz. Zähle die größte gleichzeitig sichtbare Gruppe. Beschreibe eine auffällige Farbe oder Bewegung.', 'Du kannst die geprüfte Höchstzahl erklären und eine Vermutung als solche kennzeichnen.'],
    routes: [['Formen erkennen','Skizziere Schnabelform, Silhouette und Größe. Vergleiche danach auf einer Bestimmungshilfe.'],['Verhalten vergleichen','Achte auf Bewegung, Abstand und den Ort der Nahrungssuche. Beobachte weiter aus derselben Distanz.']],
    rubric: ['Beide Beobachtungen nutzen am selben Ort vergleichbare Zeitfenster und halten Länge und Wetter fest.', 'Pro Art steht die größte gleichzeitig sichtbare Zahl. Unsichere Beobachtungen sind als unbestimmt markiert.', 'Dein Vergleich enthält eine Beobachtung und eine mögliche Erklärung, die du bei einer nächsten Runde prüfen kannst.'],
    stages: [
      ['Du beschreibst einen kleinen Vogel mit kurzem Schnabel, ohne eine unklare Art zu behaupten.', 'Du schließt allein aus grauem Gefieder auf eine Art.', 'Notiere Größe, Schnabelform und Verhalten getrennt und lass die Art bei Unsicherheit offen.', 'Konkrete Merkmale helfen dir, im nächsten Zeitfenster vergleichbare Beobachtungen zu machen.'],
      ['Drei Vögel sind gleichzeitig sichtbar. Ein späterer Einzelvogel ändert die Höchstzahl nicht.', 'Du addierst jeden vorbeifliegenden Vogel und zählst dieselbe Gruppe mehrfach.', 'Behalte pro Art die höchste gleichzeitige Zahl im festen Beobachtungsbereich.', 'Die feste Zählregel macht zwei Beobachtungsrunden vergleichbar.'],
      ['Du hältst einen beobachteten Unterschied fest und kennzeichnest den möglichen Einfluss von Wetter oder Uhrzeit.', 'Nach nur einem kurzen Blick behandelst du Abwesenheit als Beweis, dass eine Art am Ort nie vorkommt.', 'Formuliere, was du innerhalb deines Zeitfensters gesehen hast, und vergleiche unter ähnlichen Bedingungen.', 'Im Meisterstück dokumentierst du die Zählbedingungen so, dass du beide Runden nachvollziehen kannst.'],
      ['Beide Zählkarten zeigen denselben Bereich, dieselbe Dauer, eindeutige Höchstzahlen und offene Bestimmungen.', 'Im Rückblick fehlen Wetter oder Dauer und du kannst den Unterschied kaum einordnen.', 'Schreibe die Bedingungen vor dem Beobachten auf und ergänze nur beobachtete Merkmale.', 'Aus deinen Zählkarten entsteht eine wiederholbare Methode für weitere Runden.']
    ]
  },
  fotografie: {
    diagnosis: ['Mach zwei Aufnahmen eines kleinen Gegenstands. Ändere nur deine Position und benenne danach den auffälligsten Unterschied.', 'Du kannst auf beiden Fotos ein sichtbares Detail benennen, das sich durch die Position verändert hat.'],
    routes: [['Formen sammeln', 'Suche dasselbe Merkmal in verschiedenen Gegenständen und halte die Ausschnitte ähnlich.'], ['Licht studieren', 'Bleib bei einem Motiv und drehe es schrittweise zum Fenster. Vergleiche die Schatten.']],
    rubric: ['Die drei Bilder zeigen ein auf Anhieb erkennbares gemeinsames Motiv oder Merkmal.', 'Jedes Bild hat eine eigene Rolle in der Abfolge und ergänzt ein neues Detail.', 'Jede Bildnotiz erklärt einen sichtbaren Effekt von Licht oder Ausschnitt.'],
    stages: [
      ['Drei Fensterdetails teilen die gleiche runde Form, obwohl jedes Motiv anders ist.', 'Die Serie trägt einen weiten Titel wie „Unterwegs“, ohne sichtbares gemeinsames Merkmal.', 'Suche ein Merkmal, das in jedem Bild klar hervortritt, und richte den Bildrand danach aus.', 'Ein erkennbares Thema macht es leichter, im Training gezielt mit der Perspektive zu spielen.'],
      ['Ein niedriger Blickwinkel trennt das Motiv von einer unruhigen Tischkante.', 'Alle drei Fotos wurden aus derselben Höhe aufgenommen und unterscheiden sich nur im Zoom.', 'Bewege dich seitlich oder gehe in die Hocke. Vergleiche zuerst die Linien hinter dem Motiv.', 'Wenn du störende Linien bewusst ausblendest, kannst du in einer Serie mit wechselnden Perspektiven erzählen.'],
      ['Ein Übersichtsbild zeigt den Ort, zwei Details ergänzen die Handlung und das Schlussbild schließt sie ab.', 'Die stärkste Aufnahme taucht in vier fast gleichen Varianten auf.', 'Lege die Bilder nebeneinander. Tausche ein doppeltes Detail gegen ein Bild mit neuer Information.', 'Mit einer bewussten Reihenfolge kannst du deine stärksten Entscheidungen fürs Portfolio erklären.'],
      ['Auf dem ersten Bild ist der Ort klar. Das zweite zeigt eine Textur, das dritte beendet das Thema über einen leeren Ausschnitt.', 'Die Notiz beschreibt nur, was das Foto ohnehin zeigt.', 'Nenne pro Bild eine konkrete Entscheidung und ihre sichtbare Wirkung.', 'Die Notizen zeigen, welche Entscheidungen du in deiner nächsten Serie bewusst wiederholen kannst.']
    ]
  },
  zeichnen: {
    diagnosis: ['Skizziere eine Tasse in zwei Minuten. Leg den Stift hin und vergleiche ihre eingezeichnete Breite und Höhe mit dem Motiv.', 'Du benennst eine passende Proportion oder korrigierst eine Abweichung, bevor du Details hinzufügst.'],
    routes: [['Gegenstände bauen', 'Wähle ein Motiv aus zwei klaren Grundformen und übe zuerst die Proportionen.'], ['Mit Licht zeichnen', 'Drehe ein Motiv zum Fenster und reduziere seine Schatten auf drei unterscheidbare Helligkeiten.']],
    rubric: ['Die beiden Skizzen zeigen dieselben Gegenstände erkennbar aus verschiedenen Höhen.', 'Mindestens eine nachvollziehbare Überlappung und drei unterscheidbare Tonwerte sind sichtbar.', 'Die Auswahl benennt eine Stelle, an der Überlappung oder Tonwert den Raum besonders gut erklärt.'],
    stages: [
      ['Der Tassenkörper passt in ein Rechteck, der obere Rand in eine flache Ellipse.', 'Der Henkel ist detailliert ausgearbeitet, bevor die Größe des Tassenkörpers feststeht.', 'Zeichne erst die größte Grundform und teste die Proportion, dann ergänze den Henkel.', 'Mit geklärten Proportionen kannst du Helligkeiten setzen, ohne später umzeichnen zu müssen.'],
      ['Die helle Seite bleibt frei, der Halbschatten lässt sich vom dunkelsten Bereich unterscheiden.', 'Jeder Schatten hat denselben Grauton.', 'Fertige drei kleine Testflächen neben dem Motiv an und verwende sie als Bezug.', 'Drei unterscheidbare Werte machen die Überlappungen im Stillleben lesbar.'],
      ['Die vordere Kante endet am hinteren Gegenstand, dessen Position trotzdem klar bleibt.', 'Die Umrisslinien laufen durch beide Gegenstände hindurch.', 'Zeichne das vordere Objekt vollständig und lass dahinterliegende Linien am Rand enden.', 'Eine klare Überlappung hilft, die Raumwirkung aus zwei Höhen zu vergleichen.'],
      ['Aus Augenhöhe überlappt der Becher die Box stärker. Von oben ist mehr von der Stellfläche sichtbar.', 'Die Gegenstände verändern Größe und Position zugleich, obwohl nur die Augenhöhe wechseln sollte.', 'Markiere die Stellplätze der Gegenstände und ändere nur deine eigene Sitzhöhe.', 'Durch den direkten Vergleich findest du einen Blickwinkel, der Form und Abstand gut zeigt.']
    ]
  },
  beats: {
    diagnosis: ['Klopfe vier gleichmäßige Schläge und klatsche vier Takte lang zusätzlich bei zwei und vier.', 'Du hältst den Grundpuls, wenn die Klatscher hinzukommen, und triffst zweimal hintereinander dieselben Zählzeiten.'],
    routes: [['Ruhiger Backbeat', 'Lass Kick und Snare stehen und probiere zuerst bewusst gesetzte Pausen.'], ['Mehr Bewegung', 'Teste eine zusätzliche Hi-Hat oder einen Rhythmuswechsel am Ende des vierten Takts.']],
    rubric: ['Der Grundpuls bleibt im ganzen Beat erkennbar.', 'Eine bewusst gesetzte Variation ist an derselben Stelle wieder hörbar.', 'Du kannst den Übergang und das Ende mit Taktzahlen anzeigen und die Wirkung beschreiben.'],
    stages: [
      ['Die Kick liegt zum Beispiel auf eins und drei, die Snare auf zwei und vier.', 'Alle Klänge liegen auf jedem Schlag und überdecken ihre Rollen.', 'Schalte eine Spur stumm und setze pro Klang zunächst nur wenige Punkte.', 'Mit einem klaren Grundpuls hörst du im Training, welche Wirkung eine Variation hat.'],
      ['Die Hi-Hat ändert im letzten Takt ihr Muster, während Kick und Snare den Puls halten.', 'Alle Spuren ändern sich gleichzeitig und das Muster wirkt plötzlich beliebig.', 'Kopiere zuerst den Grundtakt und ändere zwei Schritte auf nur einer Spur.', 'Eine hörbare Variation lässt sich als Übergang in einem längeren Ablauf wieder einsetzen.'],
      ['Die ersten vier Takte bauen das Muster auf. Vor dem Ende ist ein kleiner Wechsel hörbar.', 'Jeder Übergang klingt exakt gleich, obwohl du Anfang und Ende markieren wolltest.', 'Spare dir eine Pause oder einen Zusatzschlag für genau eine Grenze auf.', 'Ein wiedererkennbarer Übergang macht Anfang, Hauptteil und Schluss im eigenen Beat hörbar.'],
      ['Eine Spur beginnt allein, der volle Beat setzt auf dem nächsten Abschnitt ein und der Schluss ist gesetzt.', 'Die Schleife läuft einfach weiter und hat keinen hörbaren Abschluss.', 'Setze einen Schlussakzent oder eine bewusste gemeinsame Pause.', 'Mit markierten Taktgrenzen kannst du den Aufbau später abspielen und gezielt ändern.']
    ]
  },
  kochen: {
    diagnosis: ['Plane die Tomatennudeln auf Papier. Ordne Wasser erhitzen, Sauce ansetzen, Garprobe und Servieren zu einer Reihenfolge.', 'Garprobe und Sauce sind eingeplant und du kannst sagen, welche Vorbereitung vor dem Herdstart sinnvoll ist.'],
    routes: [['Geschmack vergleichen', 'Teile den Saucenansatz in zwei kleine Proben und ändere nur eine geschmackliche Zutat.'], ['Zeitablauf üben', 'Plane vom Servierzeitpunkt aus rückwärts und notiere die tatsächlichen Startzeiten.']],
    rubric: ['Die Notiz nennt die Ausgangsversion, genau eine bewusste Änderung und die verwendete Menge.', 'Du beschreibst einen konkreten Geschmackseindruck und führst ihn auf die getestete Änderung zurück.', 'Die nächste Version hat einen nachvollziehbaren Stellhebel, etwa weniger Schärfe oder einen früheren Beginn der Sauce.'],
    stages: [
      ['Die einzelne Probenudel ist angenehm bissfest und die Sauce ist zum Abgießen bereit.', 'Du stellst den Timer erst, nachdem die Nudeln schon eine Weile im Wasser waren.', 'Lege den Timer bereit und notiere den Beginn, dann nimm rechtzeitig eine Garprobe.', 'Ein nachvollziehbarer Basisablauf macht spätere Änderungen am Geschmack vergleichbar.'],
      ['Zwei kleine Saucenproben unterscheiden sich nur durch die dokumentierte Menge einer Zutat.', 'Du änderst gleichzeitig Salz, Säure und Kräuter.', 'Teile die Basis und ändere nur eine Variable. Notiere die Menge vor dem Probieren.', 'Eine dokumentierte Anpassung lässt sich später für zwei Portionen wiederholen.'],
      ['Beide Portionen stehen gleichzeitig bereit und die Startzeiten lassen sich aus deinem Plan ablesen.', 'Du verdoppelst jede Garzeit gemeinsam mit der Zutatenmenge.', 'Plane eine Garprobe für dieselbe Nudelsorte ein und prüfe die Sauce separat.', 'Mit einem wiederholbaren Ablauf kannst du im Projekt zeigen, welche Änderung dem Gericht hilft.'],
      ['Ausgangsversion und Änderung stehen nebeneinander, damit ein konkreter Geschmackseindruck überprüfbar bleibt.', 'Der Projektzettel sagt nur „besser“.', 'Beschreibe die Stelle genauer, etwa „Tomate bleibt schmeckbar, Säure fällt am Schluss auf“.', 'Deine Notiz gibt dir eine gezielte Entscheidung für den nächsten Kochtermin.']
    ]
  },
  origami: {
    diagnosis: ['Falte ein Papierquadrat einmal in der Mitte. Kontrolliere beide Ecken, bevor du die Falzkante andrückst.', 'Die Außenkanten liegen übereinander und der Knick bleibt beim Öffnen gerade.'],
    routes: [['Präzision', 'Falte das gleiche Modell aus drei gleich großen Quadraten und vergleiche die Dachkanten.'], ['Anleitung gestalten', 'Skizziere Vorderseite und Faltrichtung für jeden Übergang. Lass eine zweite Person mitfalten.']],
    rubric: ['Die Anleitung zeigt bei jedem Schritt die Ausgangsform und die Faltrichtung.', 'Das Modell lässt sich ein zweites Mal mit der eigenen Anleitung falten.', 'Eine unklare Stelle aus dem Test wurde präzisiert und der erfolgreiche Schritt ist erkennbar.'],
    stages: [
      ['Beide Ecken liegen übereinander, bevor die Kante von der Mitte aus angedrückt wird.', 'Du drückst die Falte fest und merkst erst danach, dass die Ecken versetzt sind.', 'Richte die Ecken aus und halte sie mit einem Finger fest, bevor du die Kante glättest.', 'Die Kante des ersten Hauses wird im Training zum Bezug für ein zweites, genaueres Modell.'],
      ['Zwei Dächer treffen sich an der Mitte und haben dieselbe Höhe.', 'Ein kleiner Versatz an der ersten Faltung wird an der Dachkante größer.', 'Öffne bis zur ersten Bezugskante und richte dort beide Seiten neu aus.', 'Wiederholbare Kanten machen eine Häuserreihe mit bewusst gewählten Varianten möglich.'],
      ['Drei Häuser stehen in einer Reihe. Ein einziges Merkmal wie die Dachhöhe ändert sich sichtbar.', 'Papiergröße und Material wechseln zugleich mit dem Modell und erschweren den Vergleich.', 'Schneide drei gleiche Quadrate zu und verändere nur eine Falte.', 'Wenn ein Modell reproduzierbar ist, kannst du daraus eine Anleitung für andere ableiten.'],
      ['Ein Pfeil zeigt, welche Ecke wohin geht. Das nächste Bild zeigt die gefaltete Form.', 'Beim Drehen des Papiers fehlt eine Markierung und derselbe Pfeil zeigt plötzlich anders.', 'Markiere die obere Ecke in jedem Bild und zeichne bei einer Drehung einen zusätzlichen Pfeil.', 'Ein zweiter erfolgreicher Durchlauf zeigt dir, welche Schritte ausreichend erklärt sind.']
    ]
  },
  scratch: {
    diagnosis: ['Plane zwei Blöcke, die eine Figur beim Start sichtbar bewegen. Sag voraus, was beim zweimaligen Starten passiert, und teste es im Blocklabor.', 'Du kannst die Wirkung des Startblocks erklären und die zweite Bewegung vorhersagen.'],
    routes: [['Spielsteuerung', 'Teste links und rechts getrennt. Achte darauf, dass die Figur stets an einer brauchbaren Position bleibt.'], ['Animation und Zustand', 'Baue einen wiederholbaren Start für Figur, Kostüm und Punktestand und beobachte ihn zweimal.']],
    rubric: ['Ein Neustart setzt Spielfigur und Punktestand zweimal hintereinander auf die Ausgangswerte.', 'Links und rechts funktionieren getrennt. Bei genau einem Sammelkontakt ändert sich der Punktestand einmal.', 'Du hältst für einen Test Auslöser, erwartetes Verhalten und beobachtetes Ergebnis fest.'],
    stages: [
      ['Beim Klick auf die grüne Flagge führt die Figur genau den eingerasteten Bewegungsblock aus.', 'Ein Bewegungsblock liegt einzeln neben dem Ereignisstapel.', 'Lass den Bewegungsblock direkt unter dem Startsignal einrasten und klicke auf die Flagge.', 'Ein funktionierender Start verbindet später auch Tasten mit gezielter Bewegung.'],
      ['Nach rechts und wieder links steht die Figur unter gleichen Bedingungen auf ihrer ursprünglichen x-Position.', 'Beide Tasten verändern x um denselben positiven Wert.', 'Teste die Tasten einzeln und überprüfe das Vorzeichen am Linksschritt.', 'Mit zuverlässiger Steuerung kannst du einen Sammelkontakt und den Punktestand testen.'],
      ['Nach einem Kontakt zählt der Stern einmal und taucht an einer anderen erreichbaren Position auf.', 'Der Punktestand wächst weiter, solange Stern und Spieler sich berühren.', 'Verschiebe den Stern nach dem Zählen und wiederhole denselben Kontakttest.', 'Ein einzelner sauberer Kontakt macht die Punkte beim Neustart einzeln überprüfbar.'],
      ['Beim zweiten Start sind Position und Punktestand gleich wie beim ersten Start.', 'Der zweite Start übernimmt noch den Punktestand aus dem vorherigen Lauf.', 'Prüfe unmittelbar nach dem Startsignal die Blöcke für Position, Kostüm und Punkte.', 'Der geprüfte Neustart erleichtert dir spätere Änderungen am Spielfeld und an den Regeln.']
    ]
  },
  schach: {
    diagnosis: ['Setze einen Springer auf d4. Markiere alle Zielfelder auf einem leeren Brett und prüfe sie dort einzeln.', 'Du findest die acht Felder in der Brettmitte und erklärst die Bewegung als zwei Felder längs plus eines quer.'],
    routes: [['Figuren und Motive', 'Erkläre zuerst Springer, Turm und Läufer an je einem freien Brett mit einem Hindernis.'], ['Endspiele', 'Stelle wenige Figuren auf. Prüfe nach jedem Zug gegnerische Felder und die Königssicherheit.']],
    rubric: ['Eine beschriftete Stellung zeigt Matt und eine zweite zeigt Patt.', 'Bei jeder Endstellung prüfst du Königssicherheit, Ausweichfelder und ob Schach vorliegt.', 'Deine Erklärung benennt den entscheidenden Unterschied zwischen den beiden Stellungen.'],
    stages: [
      ['Der Springer erreicht auf dem freien Brett von d4 sowohl f5 als auch e6.', 'Du bewegst einen Läufer auf ein Feld mit der anderen Farbe.', 'Markiere die Diagonale mit Papierstücken und beobachte die Feldfarbe.', 'Korrekte Bewegungen helfen, in Endspielen alle Ausgangsfelder systematisch zu prüfen.'],
      ['Die Dame begrenzt gegnerische Züge und der eigene König schützt das Mattfeld.', 'Du nimmst dem gegnerischen König alle Zugfelder, ohne Schach zu geben.', 'Prüfe vor dem letzten Zug, ob der gegnerische König angegriffen ist und wohin er ziehen könnte.', 'Wenn du Matt und Patt auseinanderhältst, kannst du kritische Momente einer Partie genauer auswerten.'],
      ['Die Notiz markiert einen konkreten Zug und erklärt, welche Antwort du übersehen hattest.', 'Die Analyse sagt nur, die Eröffnung sei schlecht gewesen.', 'Stell eine Position vor dem Wendepunkt nach und vergleiche zwei mögliche Züge.', 'Mit dieser Methode kannst du im Meisterstück zwei Endspiele Zeile für Zeile begründen.'],
      ['Jede Zugfolge endet mit überprüften Ausweichfeldern und erklärt, ob ein Schachgebot vorliegt.', 'Die Lösung beruht darauf, dass die Gegenseite den einzigen starken Zug auslässt.', 'Prüfe vor jedem geplanten Zug mindestens die naheliegende gegnerische Antwort.', 'Deine Analysen zeigen, welche Motive du im nächsten Spiel wiedererkennen kannst.']
    ]
  },
  sprachen: {
    diagnosis: ['Hör dir zwei bekannte Begrüßungen an. Warte eine halbe Minute und sprich sie frei zu passenden Situationen.', 'Du ordnest beide Sätze plausibel zu und sprichst sie verständlich ohne abzulesen.'],
    routes: [['Hören und Antworten', 'Decke die deutsche Zeile ab, höre die Satzkarte und entscheide, welche Antwort passt.'], ['Freies Rollenspiel', 'Nutze nur Stichworte und lass die Gesprächspartnerin eine Rückfrage aus dem Alltag ergänzen.']],
    rubric: ['Das Rollenspiel beginnt und endet mit passenden Formulierungen in beiden Rollen.', 'Eine passende Rückfrage erhält in beiden Varianten eine verständliche Antwort.', 'Du notierst eine Formulierung, die noch schwer abrufbar war, und probierst sie in einer neuen Situation aus.'],
    stages: [
      ['Du kannst einen Satz einer Situation zuordnen und ihn nach einer kurzen Pause aussprechen.', 'Du wiederholst nur den Klang, ohne die Situation benennen zu können.', 'Schreib neben den Satz einen Anlass und decke die Übersetzung beim nächsten Versuch ab.', 'Sätze mit erkennbarem Anlass lassen sich im nächsten Café-Dialog passend abrufen.'],
      ['Auf eine Bestellung folgt eine verständliche Rückfrage und eine kurze Antwort.', 'Der Dialog besteht aus getrennt aufgesagten Listen von Vokabeln.', 'Stell nach jedem Satz eine Rückfrage, die beim Gegenüber eine Reaktion auslöst.', 'Durch Rückfragen findest du Übergänge für Sätze, die du in einer Vorstellung verbinden kannst.'],
      ['Du stellst dich mit wenigen Stichwörtern vor und kannst einen vergessenen Satz umformulieren.', 'Ein vergessenes Wort stoppt den ganzen Vortrag.', 'Bereite für eine schwierige Stelle eine kürzere Ausweichformulierung vor.', 'Das Umformulieren ist im Rollenspiel hilfreich, wenn eine Rückfrage vom Skript abweicht.'],
      ['Beide Rollen verstehen das Anliegen und können durch eine Rückfrage ein Detail klären.', 'Eine Person liest durchgängig vom fertigen Text ab.', 'Tauscht die Rollen und streicht bis auf zwei Stichwörter alle schriftlichen Hilfen.', 'Der Rückblick zeigt dir, welche Formulierungen du bei einer nächsten Begegnung direkt einsetzen kannst.']
    ]
  }
};

export const featuredExpeditions = Object.freeze(Object.keys(featured));

const projectChecks = {
  fussball: 'Die Tabelle unterscheidet Zielbreite und Zuspielart und nennt pro Durchgang sowohl Treffer als auch Anzahl der Versuche.',
  laufen: 'Der Plan enthält drei Termine mit Pausen dazwischen. Jede Notiz erklärt, welcher Abschnitt im selben Rhythmus leicht wiederholbar war.',
  basketball: 'Die fünf Wiederholungen pro Seite zeigen, auf welcher Seite du am Ziel ohne weiteren Schritt kontrolliert stoppen konntest.',
  tischtennis: 'Ihr habt eure Ergebnisse bei gleichem Abstand und gleicher Rollenverteilung verglichen und könnt die gewählte Zielzone wieder einrichten.',
  tanzen: 'Beide Phrasen haben die gleiche Zahl an Schlägen. Die zweite beginnt ohne zusätzlichen Warteschlag.',
  yoga: 'Zu jeder stehenden Bewegung ist eine unterstützte Variante beschrieben. Die beiden Termine zeigen, wann welche Variante gut gelang.',
  radfahren: 'Die Karte zeigt Start, Rückkehr und eine konkrete sichere Alternative für eine schwierige Kreuzung.',
  badminton: 'Ihr könnt die beiden Zuspielhöhen mit denselben Signalen wiederholen und beschreibt, bei welcher Folge der Federball erreichbar bleibt.',
  wandern: 'Eine andere Person kann Start, zwei markante Wegpunkte und den Umkehrpunkt in der richtigen Reihenfolge auf der Karte finden.',
  vogelbeobachtung: 'Beide Listen nennen Dauer und Wetter. Bei jeder Art steht die höchste gleichzeitig sichtbare Zahl und Unbekannte sind markiert.',
  garten: 'Jede Pflegekarte nennt eine eigene Beobachtung zum Standort und einen klaren Prüfschritt vor dem Gießen.',
  astronomie: 'Alle drei Skizzen sind datiert und die jeweils sichtbare Grenze zwischen hell und dunkel ist klar eingezeichnet.',
  geocaching: 'Die Runde enthält einen erlaubten Alternativweg oder Umkehrpunkt und einen Vergleich der Hinweise ohne Versteckdetails.',
  naturjournal: 'Auf beiden Seiten sind dieselben drei Merkmale erfasst. Vermutungen stehen deutlich getrennt von den Beobachtungen.',
  aquarell: 'Der Hintergrund hat wenigstens einen sichtbar weichen Rand und der Vordergrund eine klar begrenzte Kante.',
  schreiben: 'Beide Fassungen enthalten denselben Handlungsablauf, und je ein Detail verrät, welche Figur gerade wahrnimmt.',
  handlettering: 'Die fünf Zeichen folgen derselben Grundlinie und haben optisch ausgeglichene Zwischenräume.',
  film: 'Die beiden Fassungen verwenden dieselbe Handlung. Sichtbar unterschiedlich ist der Zeitpunkt des Schnitts.',
  collage: 'Eine Form ist auf allen drei Karten wiederzufinden. Pro Karte ist eine bewusste Änderung der Anordnung sichtbar.',
  pixelart: 'Beide Figuren bleiben bei Originalgröße als dieselbe Figur erkennbar und stehen auf derselben Grundlinie.',
  gitarre: 'Alle vier Takte bleiben im selben Puls. In zwei Durchgängen lässt sich die schwierigste Wechselstelle wiederfinden.',
  klavier: 'Die beiden Motive sind getrennt erkennbar. Das zweite endet auf C und beide halten einen gemeinsamen Puls.',
  gesang: 'Beide Varianten verwenden dieselbe Strophe. Die Notiz nennt zwei hörbare Betonungen und ihre Wirkung auf die Verständlichkeit.',
  theater: 'Die Wendung greift eine Information aus dem Anfang auf und führt zu einer gemeinsamen Entscheidung der Rollen.',
  podcast: 'Die Mini-Folge ergibt ohne Vorwissen Sinn. Einstieg, ein konkretes Antwortdetail und ein hörbarer Abschluss sind vorhanden.',
  backen: 'Mengen, Form und Backzeit des zweiten Versuchs sind dokumentiert. Du kannst Form und Krume beider Proben nebeneinander vergleichen.',
  brot: 'Deine Vorlage verbindet Zeit oder sichtbare Veränderung im Teig mit einer konkreten Beobachtung am Anschnitt.',
  tee: 'Beide Proben wurden bei ähnlicher Temperatur probiert. Die Auswahl und ihre sensorische Begründung stehen vor der Auflösung fest.',
  mealprep: 'Der Plan nutzt eine Zutat in beiden Gerichten und enthält einen praktikablen Ersatztermin sowie eine begründete Korrektur nach der Woche.',
  mocktails: 'Das Rezept enthält Mengen, Reihenfolge und Probiermenge. Die bevorzugte Variation unterscheidet sich gezielt in einer Zutat.',
  haekeln: 'Die Maschenzahl am Anfang und Ende mehrerer Reihen stimmt überein. Anfang, Mitte und Ende des Stücks sind ähnlich breit.',
  naehen: 'Bei einer vorsichtigen Probe bleiben die gesicherten Fadenenden fest und das reparierte Stück erfüllt wieder seinen Zweck.',
  sticken: 'Aus einer Armlänge ist der Buchstabe erkennbar. Kurven sind durch kürzere Stiche nachvollziehbar, und die Fäden sind gesichert.',
  ton: 'Die drei getrockneten Teile haben eine gemeinsame Formidee und jeweils eine gezielt gestaltete Oberfläche.',
  upcycling: 'Alle drei Gegenstände lassen sich entnehmen. Nach dem Alltagstest wurde ein konkretes schwer erreichbares Fach verbessert.',
  papier: 'Die Klappe öffnet und schließt mehrmals, ohne dass sich ihre Befestigung löst oder den Papierkörper verformt.',
  elektronik: 'Im Simulator stimmt das vorhergesagte Verhalten der LED für den offenen und für den geschlossenen Schalter mit der Beobachtung überein.',
  '3d': 'Vorder- und Draufsicht zeigen die beabsichtigten Abstände. In mindestens einer Ansicht ist die korrigierte Stelle erkennbar.',
  kartografie: 'Mit Legende und Maßstab lassen sich beide Routen nachverfolgen und ihre Längen aus der Karte ableiten.',
  gedaechtnis: 'Beide Methoden hatten gleiche Lern- und Wartezeit. Richtige Wörter und vertauschte Positionen sind getrennt ausgewertet.',
  jonglieren: 'Die Folge ist mit beiden Starthänden einmal vollständig gelungen. Die Notiz vergleicht die Höhe oder Richtung des ersten Wurfs.',
  brettspiel: 'Eine andere Runde kann die geänderte Regel anhand der Beschreibung anwenden. Die Notiz nennt einen beobachteten Unterschied im Spiel.',
  zauberwuerfel: 'Nach beiden Lösungen stimmt die obere Fläche und jede der vier Seiten zeigt in der ersten Ebene ihre passende Mittelfarbe.',
  ehrenamt: 'Beide Angebote sind über offizielle Stellen belegt. Der gewählte Einstieg passt zum Zeitfenster und nennt einen konkreten Kontaktweg.',
  lesen: 'Zwei nachvollziehbare Deutungen beziehen sich auf dieselbe markierte Textstelle. Die Anschlussfrage lässt sich mit weiterer Lektüre prüfen.'
};

const spaceVariants = {
  'Draußen': 'Wenn der Ort gerade nicht geeignet ist, zeichne die Übungsfläche oder das Motiv drinnen auf und markiere Start, Ziel und den Punkt für die Auswertung.',
  'Drinnen': 'Prüfe zuerst eine kleinere, freie Fläche. Ist der Bewegungsraum zu knapp, plane den Ablauf auf Papier und verschiebe die praktische Runde.',
  'Zu Hause': 'Richte einen kleinen Platz mit den benötigten Dingen ein. Für unterwegs kannst du die Reihenfolge und die Beobachtungsfrage auf einen Zettel schreiben.'
};

const stageReasons = [
  'Die erste Probe gibt dir ein beobachtbares Ergebnis, mit dem du deine nächste Übung vergleichen kannst.',
  'Im Training veränderst du eine Sache und kannst prüfen, was diese Änderung bewirkt.',
  'Am Meilenstein wendest du das Geübte in einem zusammenhängenden Ablauf an.',
  'Im Meisterstück hältst du fest, was gelungen ist und welche Entscheidung du erneut verwenden möchtest.'
];

const reflectionQuestions = [
  'Woran hast du gemerkt, dass dein erster Versuch funktioniert hat?',
  'Welche einzelne Änderung hatte die deutlichste Wirkung und woran hast du das bemerkt?',
  'Welche zwei Dinge konntest du verbinden? An welcher Stelle würdest du beim nächsten Versuch pausieren?',
  'Was könnte jemand anhand deiner Projektnotiz wiederholen? Welche Stelle würdest du zuerst verbessern?'
];

const optionalExamples = {
  'tennis-wand': ['Nach dem Aufsprung kommt der Ball auf bequemer Höhe zu dir zurück.', 'Du schlägst aus mehr Kraft und hast immer weniger Zeit für den Rückprall.', 'Verkürze den Schwung. Starte jede Serie aus derselben Distanz.', 'Wiederholbare Rückpralle bereiten den gemeinsamen Ballwechsel vor.'],
  'tennis-vorhand': ['Du triffst ein ruhiges Zuspiel mit Abstand und leicht vor der Hüfte.', 'Der Ball ist beim Kontakt bereits neben oder hinter dem Körper.', 'Positioniere dich früh und lass den Ball vor dir aufspringen.', 'Ein bewusst gewählter Treffpunkt hilft, die Ballhöhe im gemeinsamen Spiel zu halten.'],
  'tennis-ausrichtung': ['Du beschreibst zwei verschiedene Treffpunkte und ihr prüft dieselbe breite Zielzone.', 'Ihr zählt Treffer aus immer neuen Ausgangspositionen zusammen.', 'Haltet Zuspiel und Startposition gleich. Vergleicht dann die Treffpunkte getrennt.', 'Der dokumentierte Vergleich zeigt, welche Position ihr für den nächsten Ballwechsel beibehalten könnt.'],
  'kochen-timing': ['Auf dem Zettel steht für jede Komponente, wann sie beginnt und wann du nach ihr schaust.', 'Du startest beide Töpfe gleichzeitig, ohne die Zeiten zu vergleichen.', 'Rechne vom Zeitpunkt des Anrichtens zurück und markiere die Garprobe.', 'Eine klare Zeitfolge erleichtert das gleichzeitige Servieren mehrerer Portionen.'],
  'kochen-abschmecken': ['Zwei Proben derselben Sauce unterscheiden sich nur in der Menge einer Zutat.', 'Du probierst mit benutztem Löffel direkt aus dem Topf.', 'Fülle kleine Portionen ab und verwende einen sauberen Probierlöffel.', 'Mit einer sauberen Vergleichsprobe kannst du später dieselbe Zutat gezielt dosieren.'],
  'kochen-service': ['Beide Portionen sind fertig, und du erkennst im Zeitplan, welche Garprobe den Start der letzten Schritte auslöste.', 'Du richtest die erste Portion bereits an, während die zweite noch fertig garen muss.', 'Bereite beide Teller vor und arbeite vom geplanten Servierzeitpunkt aus rückwärts.', 'Der Zeitplan lässt sich beim nächsten Kochtermin anhand eines konkreten Messpunkts anpassen.'],
  'scratch-animation': ['Die Figur beginnt bei jedem Lauf auf x = 0 und führt genau vier Bewegungen aus.', 'Beim zweiten Start beginnt die Wiederholung am Ende des ersten Laufs.', 'Setze die Startposition vor die Schleife und teste die Flagge zweimal.', 'Ein wiederholbarer Start ist später auch für Punkte und Steuerung hilfreich.'],
  'scratch-zustand': ['Die Anzeige wechselt an den vorgesehenen Stellen zwischen bereit, laufend und Ende.', 'Die Anzeige ändert sich spontan in einer Schleife.', 'Zeig den Zustand nach jedem auslösenden Ereignis an und prüfe ihn schrittweise.', 'Ein sichtbarer Zustand hilft, Fehler beim Sammeln und beim Neustart einzugrenzen.'],
  'scratch-debug': ['Für Start, Kontakt und Neustart gibt es je einen Test mit erwartetem und tatsächlichem Ergebnis.', 'Du probierst alle drei Schritte gleichzeitig und kannst den Fehler keinem Schritt zuordnen.', 'Starte jeden Test im selben Anfangszustand und prüfe jeweils genau ein Verhalten.', 'Die getrennten Testfälle zeigen, welche Änderungen später erneut geprüft werden müssen.'],
  'sprachen-hoeren': ['Du ordnest eine gehörte Begrüßung einer Alltagssituation zu und kannst eine Antwort begründen.', 'Du erkennst die Antwort nur, weil die deutsche Zeile schon sichtbar ist.', 'Decke die Übersetzung ab und entscheide vor dem Aufdecken.', 'Bedeutungen ohne Übersetzung abzurufen hilft bei spontanen Antworten.'],
  'sprachen-transfer': ['Du beantwortest eine ungeplante Rückfrage mit einer verständlichen Umschreibung.', 'Du gehst nach einer unerwarteten Frage zum ersten Satz des Skripts zurück.', 'Wiederhole das Anliegen in kürzeren Worten oder bitte um Wiederholung.', 'Die gelungene Umschreibung gibt dir eine Strategie für weitere Gespräche.']
};

export function expeditionContent(hobby, quest = hobby.quests[0]) {
  const note = startingNotes[hobby.id];
  const feature = Object.hasOwn(featured, hobby.id) ? featured[hobby.id] : undefined;
  const lesson = lessons[hobby.id];
  const stage = quest.stage - 1;
  const project = hobby.quests.find(task => task.id === `${hobby.id}-meisterwerk`);
  const alternateProject = quest.stage === 4 && quest !== project;
  const stageExample = optionalExamples[quest.id] ?? feature?.stages[stage];
  const [good, mistake, repair, rationale] = stageExample ?? [quest.result, lesson.trouble, lesson.technique, stageReasons[stage]];
  const [practice, criteria] = feature?.diagnosis ?? [note.smallStart, 'Du hast mindestens einmal ausprobiert, was sich beobachten lässt, und kannst ein Ergebnis beschreiben.'];
  const nextTask = hobby.quests.find(task => task.stage === quest.stage + 1);
  return {
    appeal: note.appeal,
    safety: note.safety,
    materials: (quest.materials || hobby.materials).split(/,\s+|\s+und\s+/).map((item, index) => ({
      item,
      alternative: index === 0 ? note.alternative : ''
    })),
    diagnosis: {
      task: practice,
      criteria,
      novice: 'Starte mit der Einstiegsquest. Wiederhole den beobachteten Schritt langsam und mit einer einfachen Variante.',
      ready: 'Starte mit der Einstiegsquest. Halte fest, was du schon kontrollierst, und vergleiche im Training eine gezielte Änderung.'
    },
    example: { good, mistake, repair },
    variants: {
      noGear: `Gehe den ersten Schritt gedanklich oder auf Papier durch. Markiere, welches Detail du später praktisch prüfen kannst. Ausgangspunkt: ${quest.steps[0]}`,
      budget: note.alternative,
      short: stage === 0 ? note.smallStart : `Probiere nur den ersten Schritt und halte dein Zwischenergebnis fest. ${quest.steps[0]}`,
      place: spaceVariants[quest.place] ?? quest.adapt
    },
    rationale,
    next: nextTask ? `Als Nächstes übst du „${nextTask.title}“. Das Ergebnis der nächsten Etappe ist „${nextTask.result}“.` : 'Wiederhole dein Projekt mit einer gezielten Änderung und vergleiche beide Ergebnisse.',
    reflection: reflectionQuestions[stage],
    rubric: feature && !alternateProject ? feature.rubric : [
      alternateProject ? `Dein Ergebnis entspricht dem Ziel „${quest.result}“.` : projectChecks[hobby.id],
      'Deine Notiz beschreibt die Ausgangslage und hält das Ergebnis nachvollziehbar fest.',
      'Deine Projektnotiz nennt eine beobachtete Schwierigkeit und einen konkreten nächsten Versuch.'
    ],
    routes: (feature?.routes ?? []).map(([label, description]) => ({ label, description }))
  };
}
