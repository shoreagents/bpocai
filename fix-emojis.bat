@echo off
setlocal enabledelayedexpansion

set "file=src\app\career-tools\games\disc-personality\page.tsx"
set "temp=temp_fixed.tsx"

echo Fixing remaining emoji icons...

:: Read file and replace corrupted emojis
powershell -Command "(Get-Content '%file%' -Raw -Encoding UTF8) -replace 'ðŸ†', '🏆' -replace 'ðŸ¢', '🏢' | Set-Content '%temp%' -Encoding UTF8 -NoNewline"

:: Move temp file back to original
move "%temp%" "%file%"

echo Done! Fixed remaining emoji characters.
