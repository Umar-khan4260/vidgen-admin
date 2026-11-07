$envText = Get-Content '.env.local' -Raw
function Get-EnvVal($k) {
  $m = [regex]::Match($envText, "(?ms)^$k=(.*?)(?=^\r?\n[A-Z_]+=|\Z)", 'SingleLine')
  if ($m.Success) { return $m.Groups[1].Value.Trim().Trim('"') }
  return ''
}
$fpk = (Get-EnvVal 'FIREBASE_PRIVATE_KEY') -replace [regex]::Escape("`r`n"), '\n' -replace "`n", '\n'
$lines = @()
$lines += "FIREBASE_PROJECT_ID=$(Get-EnvVal 'FIREBASE_PROJECT_ID')"
$lines += "FIREBASE_CLIENT_EMAIL=$(Get-EnvVal 'FIREBASE_CLIENT_EMAIL')"
$lines += "FIREBASE_PRIVATE_KEY=$fpk"
$lines += "ADMIN_EMAIL=$(Get-EnvVal 'ADMIN_EMAIL')"
$lines += "ADMIN_PASSWORD=$(Get-EnvVal 'ADMIN_PASSWORD')"
$lines += "ADMIN_SESSION_SECRET=$(Get-EnvVal 'ADMIN_SESSION_SECRET')"
$lines += "KIE_API_KEY=$(Get-EnvVal 'KIE_API_KEY')"
$outPath = Join-Path (Get-Location).Path '.env.docker'
[System.IO.File]::WriteAllLines($outPath, $lines)
"written .env.docker, key line length: $($fpk.Length)"
Get-Content '.env.docker' | Select-Object -First 3
Get-Content '.env.docker' -TotalCount 1 | ForEach-Object { $_.Length }