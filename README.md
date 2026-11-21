# Hobbymaxing

Hobbymaxing ist eine deutschsprachige Web-Beta für Hobbys, die du im echten Leben ausprobierst. Wähle ein Hobby, folge konkreten Quests und halte fest, was du erlebt und gelernt hast.

[Beta öffnen](https://faulixx11.github.io/Hobbymaxing/)

## Was du ausprobieren kannst

- 54 Hobbys in acht Kategorien und 169 Quests inklusive vier Wochen-Challenges.
- Lernpfade mit Einstieg, Training und Meilenstein. Fußball, Tennis und Kochen verzweigen nach der ersten Quest.
- Wochendashboard, planbare Quests, Wochenvorhaben und persönliche Wochenserien.
- Profil mit XP, Hobby-Leveln, Abzeichen, Projektbuch und Bestleistungen. Wiederholungen bringen keine zusätzlichen Quest-XP. Challenges vergeben einmal pro Woche XP.
- Erfolgskarten, Quest-Links und gemeinsame Quests. In den beiden sportlichen Challenges lassen sich geteilte Werte in eine lokale Rangliste importieren. Die beiden kreativen Challenges verwenden Galerien.

Fortschritt bleibt in der lokalen Speicherung des Browsers. Einladungs- und Ergebnislinks übertragen bewusst freigegebene Daten. Sie enthalten keinen Zugriff auf das private Projektbuch. Ranglisten beruhen auf Selbstauskunft und auf manuell importierten Links. Die App hat keine Konten, serverseitigen Freundeslisten, öffentliche Feeds, Medienuploads oder Zahlungen.

## Lokal starten

Mit Node.js und ohne zusätzliche Abhängigkeiten:

```sh
npm start
npm test
```

Öffne anschließend http://127.0.0.1:4173. Die statische App kann über GitHub Pages direkt vom Branch `main` und dem Stammordner ausgeliefert werden.

## Inhalte erweitern

In `catalog.mjs` stehen Hobby-ID, Kategorie, Material, Ort, Fähigkeit und die Quests mit Zeit, Ablauf, erwartetem Ergebnis und Anpassung. Der Katalog setzt für jede Zeile einen Einstieg, Training und einen Meilenstein zusammen. Zusätzliche Quests können Voraussetzungen und Alternativen definieren. Behalte veröffentlichte IDs bei und erhöhe die Quest-Version, wenn sich die Bedingungen einer Messung ändern.

Die Quests sind eigene Übungen. Im Menü „Quellen & Hinweise“ stehen die recherchierten Inspirationsquellen. Die vier Fotos stammen von [Unsplash](https://unsplash.com/license).
