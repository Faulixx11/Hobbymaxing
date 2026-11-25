# Hobbymaxing

Hobbymaxing ist eine deutschsprachige Web-Beta für Hobbys, die du im echten Leben ausprobierst. Wähle ein Hobby, folge konkreten Quests und halte fest, was du erlebt und gelernt hast.

[Beta öffnen](https://faulixx11.github.io/Hobbymaxing/) · [Neues HobbyMaxing Studio](https://faulixx11.github.io/Hobbymaxing/studio/)

## Was du ausprobieren kannst

- 54 Hobby-Einführungen in acht Regionen, 228 reguläre Quests und 54 Wissenschecks.
- Vier Etappen je Lernpfad mit sichtbarem Fortschritt und einem empfohlenen nächsten Schritt. Zehn Pfade sind vertieft: Tennis, Vogelbeobachtung, Fotografie, Zeichnen, Beatmaking, Kochen, Origami, Scratch, Schach und Sprachenlernen.
- Einstiegsproben, Materiallisten, Übungsvarianten und ein persönlicher Plan mit verfügbarer Zeit, Ausrüstung, Ziel, Schwerpunkt und optionalem Projekttermin.
- Prüfkriterien für Meisterstücke, private Projektgalerie und ein Hobbyjournal mit optionalen Vorher-Nachher-Fotos.
- Acht Übungsstudios für Scratch, Zeichnen, Rhythmus, Schach, Kochen, Fotografie, Lauf- und Krafttraining und Sprachen. Die bisherigen Studios für Pixel Art, Schach und Beatmaking bleiben erreichbar. Das Trainingstagebuch unterstützt CSV-Vorschau. Der Sprachvergleich setzt bei Aufnahme ein Mikrofon und bei Wiedergabe der Vorlage eine lokale Gerätestimme voraus.
- Externe Quellen mit Sprache, Lernziel und Abrufdatum, soweit erneut geprüft. Übernommene Links und YouTube-Suchen tragen einen entsprechenden Hinweis. Die Übungen selbst stehen in der App.
- Wochendashboard, bis zu drei wählbare Wochenetappen, Wochenrückblick und saisonale Pfade. Unter „Heute“ stehen kurze Quests und der Wiedereinstieg in pausierte Hobbys.
- Profil mit Tagesstreak, Wochenserie, XP, Hobby-Leveln, Abzeichen, Projektbuch und Bestleistungen. Neue App-Übungen zählen für die Tagesstreak und bringen einmalig XP. Reale Quests zählen für beide Serien.
- Fairer Tagesstreak: Während einer laufenden Serie kann einmal pro Woche ein freiwilliger Erholungstag genommen werden. Er erhält die Serie, bringt aber keine XP und ersetzt keine echte Wochen-Praxisquest.
- Sechs Wochen-Challenges mit vier Disziplin-Ranglisten und zwei Galerien. Die Ranglisten zeigen Wochenwerte und Gesamtrekorde aus eigenen und importierten Ergebnissen.
- Regelbasierter Lerncoach, Hilfe und ein direkter Link für Fragen oder Fehlerberichte auf GitHub.
- Direkt spielbare Quest-Filter, persönliche Hobby-Einstellungen, wiederholbare Streak-Übungen und eine wechselnde Wochenempfehlung.
- Satzkarten in 14 Sprachen (Englisch, Spanisch, Französisch, Italienisch, Portugiesisch, Niederländisch, Polnisch, Türkisch, Russisch, Japanisch, Koreanisch, Mandarin, Hindi und Arabisch). Die Aussprache nutzt die Sprachstimme des Browsers/Geräts und fordert die passende Sprachregion an; installierte Stimmen und Klangqualität unterscheiden sich je Gerät. Nicht-lateinische Schriftsysteme zeigen zusätzlich eine Lautschrift. Übersetzungen lassen sich für den Selbsttest abdecken.
- Fokusmodus für jede freigeschaltete Quest: große, abhakbare Arbeitsschritte, gespeicherter Fortschritt sowie ein pausierbarer, neu startbarer Countdown. Der Timer speichert nur im aktuellen Browser-Tab.
- Hobby-Expedition: Wähle eine Stimmung und lass dir eine passende, freigeschaltete Quest unter 25 Minuten vorschlagen. Bereits erledigte Ideen werden bei einem weiteren Vorschlag übersprungen, wenn Alternativen offen sind.
- Druckbare Pfade, Offline-Questkarten, dunkles Standarddesign, größere Schrift, Textansicht und reduzierte Bewegung.

Fortschritt bleibt im Browser. Die Profilsicherung enthält Quests, Journal, Termine, Wochenvorhaben, Einladungen, importierte Ranglistenwerte, Einstellungen und Studioentwürfe. Beim Import kannst du die Sicherung vor der Zusammenführung prüfen. Unter „Profil“ lassen sich die lokalen Profildaten und Fotos löschen. Fotos bleiben ausschließlich in der browserlokalen Datenbank. Zum Gerätewechsel kannst du den Fortschritt als JSON exportieren und auf dem anderen Gerät importieren.

Eine priorisierte Sammlung weiterer Produktideen mit Nutzerwert, Aufwand und Risiken steht in [BETA-IDEEN.md](BETA-IDEEN.md).

Einladungs- und Ergebnislinks übertragen bewusst freigegebene Daten. Sie enthalten keinen Zugriff auf das private Projektbuch. Die statische Beta auf GitHub Pages verwendet manuell geteilte Ergebnisse. Die Node-Version unterstützt zusätzlich private Live-Räume und widerrufbare Freigaben.

## Lokal starten

Mit Node.js ab 22.13 und ohne zusätzliche Abhängigkeiten:

```sh
npm start
npm test
```

Öffne anschließend http://127.0.0.1:4173. Die statische App kann über GitHub Pages direkt vom Branch `main` und dem Stammordner ausgeliefert werden.

## Private Live-Räume hosten

`npm start` stellt Website und Raum-API unter derselben Adresse bereit. Auf einem Node-Host setzt du bei Bedarf `HOST=0.0.0.0`, `PORT` und `HOBBYMAXING_DATA` auf ein dauerhaftes Verzeichnis. Die SQLite-Datenbank liegt in diesem Verzeichnis, standardmäßig in `.hobbymaxing/`. Verwende für eine öffentlich erreichbare Instanz HTTPS.

Öffne eine Challenge mit Punktwertung und erstelle einen privaten Raum. Wer den unvorhersehbaren Link kennt, sieht dieselbe Liste und kann als Gast einen eigenen Wert pflegen. Ein Raum nimmt bis zu 20 Gastprofile auf und läuft nach 30 Tagen ab. Die klassische lokale Rangliste bleibt unabhängig davon nutzbar.

Unter „Challenges“ kannst du in der Node-Version auch einen Buddy- oder Teamraum starten. Buddy-Räume haben zwei Plätze, Teamräume zwanzig. Die Teilnehmenden geben ihre Wochenbeiträge aktiv frei. Pro Person zählen höchstens sieben gemeldete Praxistage. Der Raum läuft nach sieben Tagen ab.

In der Node-Version können abgeschlossene Projektkarten und anonyme Fortschrittssummen nach Zustimmung als abrufbarer Link freigegeben werden. Diese Links laufen nach 30 Tagen ab und sind im ursprünglichen Browser unter „Profil → Freigaben verwalten“ widerrufbar. Die Freigabe enthält je nach Auswahl einen Projekttitel oder Zahlen zu Etappen, Projekten und Praxistagen. Fotos und Journaleinträge bleiben beim Nutzer. GitHub Pages führt keinen Servercode aus.

## Inhalte erweitern

In `catalog.mjs` stehen Hobby-ID, Kategorie, Material, Ort, Fähigkeit und die Quests mit Zeit, Ablauf, erwartetem Ergebnis und Anpassung. Der Katalog setzt für jede Zeile einen Einstieg, Training und einen Meilenstein zusammen. Zusätzliche Quests können Voraussetzungen und Alternativen definieren. Behalte veröffentlichte IDs bei und erhöhe die Quest-Version, wenn sich die Bedingungen einer Messung ändern.

In `lessons.mjs` stehen Erklärungen und Wissenschecks, in `projects.mjs` die Meisterstücke und in `expedition-content.mjs` Einstiege, Übungsvarianten und Kriterien. Externe Ressourcen und Angaben zur Prüfung stehen in `resources.mjs`. Im Menü „Quellen & Hinweise“ stehen weitere Inspirationsquellen. Die vier Fotos stammen von [Unsplash](https://unsplash.com/license).

