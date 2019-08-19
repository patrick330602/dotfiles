function Open-Profile {code $PROFILE}

function Update-PatrickScoopBucket {C:\Projects\Git\pkscbk\bin\auto-pr.ps1 -p}
function Show-PatrickScoopBucket {C:\Projects\Git\pkscbk\bin\checkver.ps1}
function Open-PatrickScoopBucket {Set-Location C:\Projects\Git\pkscbk\}
function Open-Website {Set-Location C:\Projects\Websites\blog}
function Get-AllHistory {Get-Content (Get-PSReadlineOption).HistorySavePath}

Import-Module Get-ChildItemColor

Set-Alias l Get-ChildItemColor -option AllScope
Set-Alias ls Get-ChildItemColorFormatWide -option AllScope

Import-Module posh-git
Import-Module oh-my-posh

$ThemeSettings.PromptSymbols.FailedCommandSymbol = [char]::ConvertFromUtf32(0x2717)

Set-Theme Honukai

# Chocolatey profile
$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
  Import-Module "$ChocolateyProfile"
}
