# Ästad – Kalkylatorer (TypeScript/React)

## Ladda upp ändringar till GitHub

Följ dessa steg när du vill få in dina lokala uppdateringar i det skarpa repositoriet:

1. Kontrollera vilka filer som ändrats:
   ```bash
   git status
   ```
2. Lägg till de filer som ska med i commiten:
   ```bash
   git add <sökväg till fil>
   ```
   Använd `git add -p` om du vill granska ändringarna bit för bit.
3. Skapa en commit med ett tydligt meddelande:
   ```bash
   git commit -m "Beskrivning av ändringen"
   ```
4. Skicka upp commiten till GitHub:
   ```bash
   git push
   ```
   Om du arbetar i en feature-branch, ersätt `git push` med `git push origin <branch-namn>`.
5. Öppna en Pull Request i GitHub om ändringen kräver kodgranskning innan den går live.

Kör gärna `npm run build` lokalt innan du commitar, så vet du att projektet fortfarande bygger.

