function Open-Profile {code $PROFILE}

function Update-PatrickScoopBucket {C:\Projects\Git\pkscbk\bin\auto-pr.ps1 -p}
function Invoke-PatrickScoopBucket {C:\Projects\Git\pkscbk\bin\checkver.ps1}
function Open-PatrickScoopBucket {Set-Location C:\Projects\Git\pkscbk\}
function Open-Website {Set-Location C:\Projects\Websites\blog}
function Get-AllHistory {Get-Content (Get-PSReadlineOption).HistorySavePath}

function Start-Backup {
  Write-Host "Fetching Git..." -ForegroundColor Green
  git --git-dir=C:\Users\Patrick\dotfiles\.git --work-tree=C:\Users\Patrick\dotfiles fetch
  git --git-dir=C:\Users\Patrick\dotfiles\.git --work-tree=C:\Users\Patrick\dotfiles pull
  Write-Host "Backup dotfiles.." -ForegroundColor Green
  Copy-Item "C:\Users\Patrick\_vimrc" -Destination "C:\Users\Patrick\dotfiles\windows"
  Copy-Item "C:\Users\Patrick\.gitconfig" -Destination "C:\Users\Patrick\dotfiles\windows"
  Write-Host "Backup Powershell configuration..." -ForegroundColor Green
  Copy-Item "C:\Users\Patrick\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" -Destination "C:\Users\Patrick\dotfiles\windows\WindowsPowerShell"
  Get-InstalledModule > C:\Users\Patrick\dotfiles\windows\WindowsPowerShell\installedmodules.txt
  Write-Host "Backup Windows Terminal configuration..." -ForegroundColor Green
  Copy-Item "C:\Users\Patrick\AppData\Local\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\RoamingState\*" -Destination "C:\Users\Patrick\dotfiles\windows\WindowsTerminal" -Recurse
  $timestamp = Get-Date -Format o | ForEach-Object { $_ -replace ":", "." }
  Write-Host "Created at $timestamp. Uploading..." -ForegroundColor Green
  git --git-dir=C:\Users\Patrick\dotfiles\.git --work-tree=C:\Users\Patrick\dotfiles add -A
  git --git-dir=C:\Users\Patrick\dotfiles\.git --work-tree=C:\Users\Patrick\dotfiles commit -S -m "Windows 10 dotfiles backup: $timestamp"
  git --git-dir=C:\Users\Patrick\dotfiles\.git --work-tree=C:\Users\Patrick\dotfiles push
}

Import-Module Get-ChildItemColor

Set-Alias l Get-ChildItemColor -option AllScope
Set-Alias ls Get-ChildItemColorFormatWide -option AllScope

Import-Module posh-git
Import-Module oh-my-posh


Set-Theme Honukai
$ThemeSettings.PromptSymbols.PromptIndicator = [char]::ConvertFromUtf32(0x03bb)