# Hobbymaxing

Hobbymaxing ist eine deutschsprachige Web-Beta für Hobbys, die du im echten Leben ausprobierst. Wähle ein Hobby, folge konkreten Quests und halte fest, was du erlebt und gelernt hast.

[Beta öffnen](https://faulixx11.github.io/Hobbymaxing/)

## Was du ausprobieren kannst

- 54 Hobby-Einführungen in acht Kategorien, 234 Quests und 54 Wissenschecks.
- Vier Etappen je Lernpfad: Einstieg, Training, Meilenstein und Meisterstück. Scratch, Sprachenlernen, Kochen und Tennis zeigen eigene Fähigkeiten und weitere Trainings- und Projektaufgaben. Schritte lassen sich einzeln abhaken.
- Drei Scratch-Aufgaben im Blocklabor sowie interaktive Studios für Pixel Art, Schach und Beatmaking.
- 39 nach Etappe und Sprache beschriftete Videos und Anleitungen für 22 Hobbys. Das eigentliche Tutorial steht jeweils in der App.
- Wochendashboard, planbare Quests, Wochenvorhaben und persönliche Wochenserien.
- Profil mit Tagesstreak, Wochenserie, XP, Hobby-Leveln, Abzeichen, Projektbuch und Bestleistungen. Neue App-Übungen zählen für die Tagesstreak und bringen einmalig XP. Reale Quests zählen für beide Serien.
- Sechs Wochen-Challenges mit vier Disziplin-Ranglisten und zwei Galerien. Die Ranglisten zeigen Wochenwerte und Gesamtrekorde aus eigenen und importierten Ergebnissen.
- Regelbasierter Lerncoach, Hilfe und ein direkter Link für Fragen oder Fehlerberichte auf GitHub.
- Direkt spielbare Quest-Filter, persönliche Hobby-Einstellungen, wiederholbare Streak-Übungen und eine wechselnde Wochenempfehlung.
- Satzkarten in drei Sprachen mit browserabhängiger Sprachausgabe, konkretes Einstiegsrezept, Schritt-Tipps und eine Sicherungsdatei für den eigenen Fortschritt.

Fortschritt bleibt in der lokalen Speicherung des Browsers. Die Profilsicherung enthält Quests, Notizen, Termine, Wochenvorhaben, Einladungen, importierte Ranglistenwerte, Einstellungen und Entwürfe. Fotos bleiben in einer browserlokalen Datenbank und werden weder geteilt noch exportiert.

Einladungs- und Ergebnislinks übertragen bewusst freigegebene Daten. Sie enthalten keinen Zugriff auf das private Projektbuch. Die statische Beta auf GitHub Pages verwendet manuell geteilte Ergebnisse. Die Serverversion unterstützt zusätzlich gemeinsame Räume mit Spitznamen und selbst eingetragenen Ergebnissen.

## Lokal starten

Mit Node.js ab 22.13 und ohne zusätzliche Abhängigkeiten:

```sh
npm start
npm test
```

Öffne anschließend http://127.0.0.1:4173. Die statische App kann über GitHub Pages direkt vom Branch `main` und dem Stammordner ausgeliefert werden.

## Private Live-Räume hosten

`npm start` stellt Website und Raum-API unter derselben Adresse bereit. Auf einem Node-Host setzt du bei Bedarf `HOST=0.0.0.0`, `PORT` und `HOBBYMAXING_DATA` auf ein dauerhaftes Verzeichnis. Die SQLite-Datenbank liegt in diesem Verzeichnis, standardmäßig in `.hobbymaxing/`. Verwende für eine öffentlich erreichbare Instanz HTTPS.

Öffne eine Challenge mit Punktwertung und erstelle einen privaten Raum. Wer den unvorhersehbaren Link kennt, sieht dieselbe Liste und kann als Gast einen eigenen Wert pflegen. Ein Raum nimmt bis zu 20 Gastprofile auf und läuft nach 30 Tagen ab. Die klassische lokale Rangliste bleibt unabhängig davon nutzbar. GitHub Pages führt keinen Servercode aus.

## Inhalte erweitern

In `catalog.mjs` stehen Hobby-ID, Kategorie, Material, Ort, Fähigkeit und die Quests mit Zeit, Ablauf, erwartetem Ergebnis und Anpassung. Der Katalog setzt für jede Zeile einen Einstieg, Training und einen Meilenstein zusammen. Zusätzliche Quests können Voraussetzungen und Alternativen definieren. Behalte veröffentlichte IDs bei und erhöhe die Quest-Version, wenn sich die Bedingungen einer Messung ändern.

In `lessons.mjs` stehen Erklärungen und Wissenschecks, in `projects.mjs` die Meisterstücke und in `resources.mjs` die redaktionell ausgewählten Links. Im Menü „Quellen & Hinweise“ stehen weitere Inspirationsquellen. Die vier Fotos stammen von [Unsplash](https://unsplash.com/license).
