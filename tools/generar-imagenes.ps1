# Regenera img/og-image.png (1200x630) e img/apple-touch-icon.png (180x180)
# a partir de tools/og-image.html y tools/icono.html, usando Microsoft Edge en modo headless.
# Requiere el servidor local corriendo (tools\servir.ps1) para que carguen las tipografías.
param([int]$Puerto = 8080)

$raiz = Split-Path -Parent $PSScriptRoot
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$perfil = Join-Path $env:TEMP "edge-headless-sitio"

$trabajos = @(
  @{ url = "tools/og-image.html"; salida = "img\og-image.png"; ancho = 1200; alto = 630 },
  @{ url = "tools/icono.html";    salida = "img\apple-touch-icon.png"; ancho = 180; alto = 180 }
)
foreach ($t in $trabajos) {
  $destino = Join-Path $raiz $t.salida
  & $edge --headless=new --disable-gpu --hide-scrollbars --no-first-run "--user-data-dir=$perfil" `
    "--window-size=$($t.ancho),$($t.alto)" "--screenshot=$destino" --virtual-time-budget=3000 `
    "http://127.0.0.1:$Puerto/$($t.url)" 2>$null | Out-Null
  Start-Sleep -Milliseconds 500
  if (Test-Path $destino) { Write-Host "OK  $($t.salida)" } else { Write-Host "ERROR  $($t.salida)" }
}
