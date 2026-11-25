# Architektur von HobbyMaxing Studio

Die deutschsprachige Single-Page-Anwendung besteht aus HTML, CSS und nativen JavaScript-Modulen. `index.html` startet die Anwendung ohne Build-Schritt. Hash-Routen erlauben Direktlinks im GitHub-Pages-Unterordner `studio/`. Bilder und Styles laden über relative Pfade.

## Module und Datenfluss

| Datei | Zuständigkeit |
| --- | --- |
| `app.js` | Start, Navigation, App-Rahmen, Seitenwechsel und zentrale Interaktionen |
| `ui.js`, `style.css` | Gemeinsame UI-Bausteine, HTML-Maskierung, Icons, Layout und Darstellungseinstellungen |
| `pages.js` | Landingpage, Hobby-Explorer, Hobbyseiten, Startübersicht und Profil |
| `content.js` | Deutsche Kategorien, Hobbydaten und interaktive Lerninhalte |
| `learning.js` | Lernschritte, Aufgabenprüfung, Lernnachweise und Wiederholungen |
| `planner.js` | Quests, Challenges, Kalender, Projekte und Journal |
| `state.js` | Profilzustand, validierte Daten, Speicherzugriff und importierbare Sicherungen |
| `studios.js` | Spezialisierte Lernumgebungen mit technik- und fachspezifischen Eingaben |
| `world.js`, `world.css` | Isometrische HobbyWorld, Lernexpedition und Inselbedienung |

`state.js` lädt ein versioniertes Profil aus IndexedDB und fällt bei fehlender Verfügbarkeit auf `localStorage` zurück. Speichervorgänge schreiben serialisierte Momentaufnahmen in Reihenfolge. Das Importformat der Studio-Ausgabe ist JSON und wird vor dem Laden validiert. Die Ursprungsversion des Projekts nutzt einen eigenen Speicher und bleibt im Projektstamm erreichbar. Geräteübergreifender Transfer erfolgt per Export und Import.

Der Katalog verwendet stabile Hobby-IDs. Lektionen führen in der Oberfläche durch kurze Einführungen, überprüfbare Antworten und dokumentierbare praktische Schritte. Der Lernzustand speichert Abschlüsse, Kompetenznachweise und Wiederholungen getrennt. XP und Aktivität werden zentral gespeichert, damit Dashboard, Auswertungen und Spielwelt denselben Lernstand verwenden.

Das Programmierstudio rendert die Vorschau in einem `iframe` mit Sandbox und eigener Content Security Policy. Die Vorschau kommuniziert Aufgabenresultate über Nachrichten mit der Anwendung. Jedes Studio initialisiert seine eigene Bedienoberfläche beim Öffnen.

## HobbyWorld

`mountWorld` erhält den aktuellen Zustand sowie Rückrufe zum Speichern, Navigieren und Anzeigen von Statusmeldungen. Die Funktion gibt die Bereinigung für Ereignisse, Zeitgeber und Zeichenanimation zurück. Die Karte zeichnet Gelände, Wasser, Gebäude und Figur über Canvas. Das Gelände bleibt in einer Bildfläche im Speicher. Verfügbare Interaktionen erscheinen zusätzlich als HTML-Bedienelemente.

`state.world` speichert Position, Jackenfarbe, Anzeigename, Dekorationen pro Feld, besuchte Bauplätze, Siege im Gedächtnisspiel und dokumentierte Expeditionsmissionen. Relevante Lektionsabschlüsse bestimmen, welche Hobbygebäude sichtbar werden. XP schalten Basislager, Waldlichtung, Taktbrücke, Sternwarte und Gipfel bei 0, 30, 100, 225 und 450 XP frei. Sternwarte und Gipfel beziehen Kalendertermine beziehungsweise abgeschlossene Projekte ein. Reale Aufgaben werden als Selbstdokumentation erfasst.

## Erweiterungen

Neue Funktionen werden an passenden Moduleinstiegen ergänzt. Zusätzliche Lernschritte gehören zuerst in das Inhaltsformat. Ergänzende Sprachen können über sprachspezifische Inhaltspakete und auslagerbare Oberflächentexte hinzugefügt werden. Ein künftiger Server kann über eine alternative Speicheranbindung hinter dem Zustandsmodul eingesetzt werden. Die bestehende Lern- und Spielbedienung arbeitet mit dem Browserprofil.
