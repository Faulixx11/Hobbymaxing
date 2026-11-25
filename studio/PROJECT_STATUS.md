# Entwicklungsstand

## Veröffentlichter Funktionsumfang

- Öffentliche Landingpage mit Mini-Lektion, Lernpfadvorschau, FAQ und Einstieg. Mehrstufiges, überspringbares Onboarding und lokales Kompetenzprofil.
- Explorer mit 80 Hobbys, neun Kategorien, Material-, Zeit-, Kosten- und weiteren Filtern, globaler Suche, Vergleich, Favoriten und eigenen Hobbys.
- 92 individuell ausgearbeitete Lektionen mit 276 Lernschritten. Fünf Lektionen gibt es bei Fotografie, Schach und HTML/CSS. 77 weitere Hobbys haben je eine Einstiegslektion.
- Übungsengine für Auswahl, Mehrfachauswahl, Texteingabe, Reihenfolge und nachvollziehbare Praxisreflexion. Individuelle Hinweise, Einstufung, Nachweise, gestaffelte Wiederholung und einmalige XP.
- 14 Studios für Schach, Webcode, Musik, Zeichnen, Fotografie, Sudoku, Design, Videoschnitt, Astronomie, Geografie, Sprachen, Kochen, Pixel Art und Argumentation.
- HobbyWorld mit Karte, Figur, Touch- und Tastatursteuerung, Dekorationen, Werkstätten, eigenem Gedächtnisspiel und fünf Stationen der Lernexpedition.
- Quests, Challenges, Wochenziele, Kalender mit Monats-, Wochen- und Tagesansicht, wiederkehrende Termine, Projekte, Journal mit lokalem Bildanhang und Auswertung.
- Browser-Speicherung über IndexedDB mit LocalStorage-Ersatz, Sicherungsimport und -export, Hell- und Dunkelmodus, Akzentfarben und Einstellungen für Audio, Schrift und Bewegung.

## Offene Anforderungen

- Das langfristige Inhaltsziel liegt bei 400 Modulen, 2.000 Lektionen und 6.000 Lernschritten. Es fehlen insbesondere aufbauende Module, Modulabschlusstests, alternative Lernwege und ausführlich geführte Abschlussprojekte. Der genaue Stand je Hobby ist in [CONTENT_STATUS.md](CONTENT_STATUS.md) erfasst.
- Die vorhandenen Studios sind eigenständige Einstiege. Vertiefte Instrumententechnik, Instrumentensatz, echte Tonhöhen- und Ausspracheerkennung, Video-/Audioschnitt mit Dateien, vollständiges Kartenmaterial, historische Quellenarbeit, Speedcubing-, Origami- und 3D-Studios, Python-Laufzeit und Schachcomputer sind offen. Kamera, Umlaufbahnen und Karte nutzen beschriftete vereinfachte Lernmodelle.
- Offen bleiben individuelle Quest-Erstellung, automatische Kalendererinnerungen, Projekt-Dateianhänge, detailliertere Analytics nach Kompetenz und Kategorie, ausgebaute Spielräume und weitere verknüpfte Mini-Games. Wochenziele und Praxisaufgaben werden vom Nutzer selbst dokumentiert.
- Die Website ist auf Deutsch. Die Auslagerung sämtlicher Oberflächentexte, eine systematische WCAG-Prüfung, die Prüfung weiterer Browser und assistiver Technologien sowie fachliche Zweitsichtung aller Inhalte sind offen.
- Die bestehenden HobbyMaxing-Speicherstände der früheren Beta sind über die Beta erreichbar. Das Studio importiert sein eigenes JSON-Sicherungsformat; eine Migration der älteren Formate ist offen.

## Durchgeführte Prüfungen

- Katalogschema, Referenzen, Antwortauswertung, Wiederholungsintervalle, XP-Eindeutigkeit, Kalender und Sicherungsvalidierung über Node-Tests.
- Interaktionen der Studios und der Insel in separaten Tests. Darunter legale Schachzüge und Sonderzüge, isolierte Vorschau für HTML, CSS und JavaScript, Kamera, Sprache, Musik, Sudoku und Astronomie.
- Öffentliche GitHub-Pages-Adresse und Desktop- sowie Mobilansicht im Browser. Mini-Lektion, Hobby-Suche, Lernpfad, Schachstudio, HobbyWorld und mobile Navigation wurden dort geöffnet beziehungsweise bedient.

## Technische Entscheidung

HobbyMaxing Studio setzt die vorhandene statische, serverlose Architektur mit nativen JavaScript-Modulen fort. Dateien und Routen funktionieren ohne Bundler oder Fremdskripte innerhalb des GitHub-Pages-Verzeichnisses `studio/`.

## Nächste Entwicklungsetappe

Die Einstiege für Zeichnen, Klavier, JavaScript, Sprachen und Astronomie um zusammenhängende Module erweitern. Prüfbare Abschlusstests und Abschlussprojekte ergänzen und den Lernschritt-Fortschritt in der Auswertung weiter ausbauen.
