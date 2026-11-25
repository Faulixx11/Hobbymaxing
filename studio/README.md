# HobbyMaxing Studio

HobbyMaxing Studio ist eine deutschsprachige Lernplattform für 80 Hobbys. Sie verbindet interaktive Einstiegslektionen, spezialisierte Studios, persönliche Projekte und eine spielbare Insel.

- [Website öffnen](https://faulixx11.github.io/Hobbymaxing/studio/)
- [Bisherige HobbyMaxing-Beta](https://faulixx11.github.io/Hobbymaxing/)
- [Entwicklungsstand](PROJECT_STATUS.md) und [Inhaltsstand je Hobby](CONTENT_STATUS.md)

## Lokal starten

Node.js ab Version 22.13 genügt. Führe die Befehle im Verzeichnis `studio` aus.

```sh
npm start
npm test
npm run build
```

Öffne für die Entwicklung `http://127.0.0.1:4317/studio/`. Der Produktionsbuild steht in `dist/`. GitHub Pages liefert die Anwendung im Repository-Unterordner `studio/` aus. Direkte Links verwenden Hash-Routen.

## Eigene Daten

Profil, Lernfortschritt, Kalender, Journal und Spielwelt bleiben lokal im Browser. Unter **Einstellungen** lassen sie sich exportieren, aus einer Studio-Sicherung wiederherstellen oder zurücksetzen. Studio und die frühere Beta führen jeweils eigene Speicherstände.

## Mitwirken

Neue Lerninhalte gehören in `content.js`. Sie benötigen ein konkretes Lernziel, überprüfbare Schritte oder transparente Praxiskriterien, Hilfestellung und Feedback. `core.test.mjs` prüft unter anderem Verweise und Antwortdefinitionen. Das Entwicklungsmodell steht in [ARCHITECTURE.md](ARCHITECTURE.md).

Die Bildmotive wurden für HobbyMaxing Studio erstellt. Die eingebetteten Schriften [Manrope](assets/manrope-LICENSE.txt) und [Fraunces](assets/fraunces-LICENSE.txt) stehen unter der SIL Open Font License.
