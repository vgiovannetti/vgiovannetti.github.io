# Servidor local minimo para previsualizar el sitio GENERADO (_site/, se arma con: npm run build).
# Escucha SOLO en 127.0.0.1.
# Uso:  powershell -ExecutionPolicy Bypass -File tools\servir.ps1   (opcional: -Puerto 8080)
# Cortar con Ctrl+C.
param([int]$Puerto = 8080)

$raiz = [IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $PSScriptRoot) "_site"))
if (-not (Test-Path $raiz)) { Write-Host "No existe _site/. Primero genera el sitio con:  npm run build"; exit 1 }
$tipos = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'
  '.svg'='image/svg+xml'; '.png'='image/png'; '.webp'='image/webp'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'
  '.woff2'='font/woff2'; '.json'='application/json'; '.ico'='image/x-icon'; '.md'='text/plain; charset=utf-8'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Puerto)
$listener.Start()
Write-Host "Sitio en http://127.0.0.1:$Puerto/   (Ctrl+C para cortar)"

try {
  while ($true) {
    if (-not $listener.Pending()) { Start-Sleep -Milliseconds 50; continue }
    $cliente = $listener.AcceptTcpClient()
    try {
      $stream = $cliente.GetStream()
      $lector = New-Object System.IO.StreamReader($stream)
      $linea = $lector.ReadLine()
      while ($true) { $h = $lector.ReadLine(); if ($h -eq $null -or $h -eq '') { break } }

      $ruta = '/'
      if ($linea -match '^(GET|HEAD) (\S+)') { $ruta = [Uri]::UnescapeDataString(($matches[2] -split '\?')[0]) }
      if ($ruta.EndsWith('/')) { $ruta += 'index.html' }
      $archivo = [IO.Path]::GetFullPath((Join-Path $raiz $ruta.TrimStart('/')))

      # Impide salir de la carpeta del sitio (../)
      if ($archivo.StartsWith($raiz + '\') -and (Test-Path -LiteralPath $archivo -PathType Leaf)) {
        $cuerpo = [IO.File]::ReadAllBytes($archivo); $estado = '200 OK'
        $tipo = $tipos[[IO.Path]::GetExtension($archivo).ToLower()]
        if (-not $tipo) { $tipo = 'application/octet-stream' }
      } else {
        $cuerpo = [Text.Encoding]::UTF8.GetBytes('404 - No encontrado'); $estado = '404 Not Found'; $tipo = 'text/plain; charset=utf-8'
      }

      $cab = "HTTP/1.1 $estado`r`nContent-Type: $tipo`r`nContent-Length: $($cuerpo.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
      $b = [Text.Encoding]::ASCII.GetBytes($cab)
      $stream.Write($b, 0, $b.Length)
      if ($linea -notmatch '^HEAD') { $stream.Write($cuerpo, 0, $cuerpo.Length) }
      $stream.Flush()
      Write-Host ("{0} {1}" -f $estado.Substring(0,3), $ruta)
    } catch { } finally { $cliente.Close() }
  }
} finally { $listener.Stop() }
