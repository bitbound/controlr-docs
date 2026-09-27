#!/usr/bin/env pwsh

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$TargetVersion
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$versionFile = Join-Path $repoRoot 'controlr-version.txt'

if ([string]::IsNullOrWhiteSpace($TargetVersion)) {
  $TargetVersion = (Invoke-RestMethod -Uri 'https://api.github.com/repos/bitbound/ControlR/releases/latest' -Headers @{ 'User-Agent' = 'controlr-docs' }).tag_name
}

if ([string]::IsNullOrWhiteSpace($TargetVersion) -or $TargetVersion -eq 'null') {
  Write-Error 'Could not determine the ControlR version.'
  exit 1
}

$currentVersion = ''
if (Test-Path $versionFile) {
  $currentVersion = (Get-Content $versionFile -Raw).Trim()
}

if ($currentVersion -eq $TargetVersion) {
  Write-Host "Version file already reads $TargetVersion. Nothing to do."
  exit 0
}

"$TargetVersion" | Out-File -FilePath $versionFile -Encoding utf8
Write-Host "Synced $currentVersion -> $TargetVersion"
