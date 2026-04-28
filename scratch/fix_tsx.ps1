$path = 'src\app\cliente\evento\[id]\EventoDetailClient.tsx'
$content = Get-Content -LiteralPath $path
$content[1656] = "      )}"
$content[1927] = "}"
$content | Set-Content -LiteralPath $path
