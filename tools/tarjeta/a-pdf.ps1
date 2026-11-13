# Convierte las tarjetas HTML de difusion/ a PDF con Microsoft Edge (headless).
# Primero:  npm run tarjeta     Luego:  powershell -ExecutionPolicy Bypass -File tools\tarjeta\a-pdf.ps1
$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$perfil = Join-Path $env:TEMP "edge-headless-tarjeta"
foreach ($nombre in "tarjeta-imprenta", "tarjetas-a4") {
  $html = Join-Path $raiz "difusion\$nombre.html"
  $pdf  = Join-Path $raiz "difusion\$nombre.pdf"
  $url  = "file:///" + ($html -replace '\\', '/')
  & $edge --headless=new --disable-gpu --no-first-run "--user-data-dir=$perfil" --no-pdf-header-footer `
    "--print-to-pdf=$pdf" --virtual-time-budget=3000 $url 2>$null | Out-Null
  Start-Sleep -Milliseconds 500
  if (Test-Path $pdf) { Write-Host "OK  difusion\$nombre.pdf" } else { Write-Host "ERROR  $nombre" }
}
