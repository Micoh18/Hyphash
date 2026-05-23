<#
.SYNOPSIS
  Generates a secure WALLET_ENCRYPTION_KEY for Hyphash.

.DESCRIPTION
  Hyphash currently expects WALLET_ENCRYPTION_KEY to be a string with at least
  32 characters. This script generates 32 cryptographically random bytes,
  encodes them as Base64URL, and uses the first 32 characters as a compatible
  key string.

  Keep this key stable once real wallets exist. If you change it later, any
  wallet secrets encrypted with the previous key may become unreadable.

.EXAMPLE
  .\scripts\generate-wallet-encryption-key.ps1

.EXAMPLE
  .\scripts\generate-wallet-encryption-key.ps1 -PrintOnly

.EXAMPLE
  .\scripts\generate-wallet-encryption-key.ps1 -OutFile .env.local
#>

param(
  [string]$OutFile = ".env.local",
  [switch]$PrintOnly
)

$ErrorActionPreference = "Stop"

function New-Base64UrlKey {
  $bytes = New-Object byte[] 32

  if ([System.Security.Cryptography.RandomNumberGenerator].GetMethod("Fill", [type[]]@([byte[]]))) {
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  } else {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
      $rng.GetBytes($bytes)
    } finally {
      $rng.Dispose()
    }
  }

  $base64 = [Convert]::ToBase64String($bytes)
  $base64Url = $base64.TrimEnd("=").Replace("+", "-").Replace("/", "_")
  return $base64Url.Substring(0, 32)
}

$key = New-Base64UrlKey
$line = "WALLET_ENCRYPTION_KEY=$key"

Write-Host "Generated WALLET_ENCRYPTION_KEY:" -ForegroundColor Green
Write-Host $line
Write-Host ""
Write-Host "Important: keep this value secret and stable once wallets exist." -ForegroundColor Yellow

if ($PrintOnly) {
  exit 0
}

if (Test-Path $OutFile) {
  $content = Get-Content -Raw -Path $OutFile

  if ($content -match "(?m)^WALLET_ENCRYPTION_KEY=") {
    $updated = $content -replace "(?m)^WALLET_ENCRYPTION_KEY=.*$", $line
    Set-Content -Path $OutFile -Value $updated -NoNewline
    Write-Host "Updated existing WALLET_ENCRYPTION_KEY in $OutFile" -ForegroundColor Green
  } else {
    Add-Content -Path $OutFile -Value "`n$line"
    Write-Host "Appended WALLET_ENCRYPTION_KEY to $OutFile" -ForegroundColor Green
  }
} else {
  Set-Content -Path $OutFile -Value "$line`n"
  Write-Host "Created $OutFile with WALLET_ENCRYPTION_KEY" -ForegroundColor Green
}
