function Open-Profile {code $PROFILE}

function Update-PatrickScoopBucket { & "C:\Users\Patrick Wu\Git\pkscbk\bin\auto-pr.ps1" -p }
function Invoke-PatrickScoopBucket { & "C:\Users\Patrick Wu\Git\pkscbk\bin\checkver.ps1" }
function Open-PatrickScoopBucket {Set-Location "C:\Users\Patrick Wu\Git\pkscbk\"}
function Open-Website {Set-Location C:\Projects\Websites\blog}
function Get-AllHistory {Get-Content (Get-PSReadlineOption).HistorySavePath}

function Start-Backup {
  Write-Host "Fetching Git..." -ForegroundColor Green
  git --git-dir="C:\Users\Patrick Wu\dotfiles\.git" --work-tree="C:\Users\Patrick Wu\dotfiles\.git" fetch
  git --git-dir="C:\Users\Patrick Wu\dotfiles\.git" --work-tree="C:\Users\Patrick Wu\dotfiles\.git" pull
  Write-Host "Backup dotfiles..." -ForegroundColor Green
  Copy-Item "C:\Users\Patrick Wu\_vimrc" -Destination "C:\Users\Patrick Wu\dotfiles\windows"
  Copy-Item "C:\Users\Patrick Wu\.gitconfig" -Destination "C:\Users\Patrick Wu\dotfiles\windows"
  Copy-Item "C:\Users\Patrick Wu\.wslconfig" -Destination "C:\Users\Patrick Wu\dotfiles\windows"
  Write-Host "Backup Powershell configuration..." -ForegroundColor Green
  Copy-Item "C:\Users\Patrick Wu\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" -Destination "C:\Users\Patrick Wu\dotfiles\windows\WindowsPowerShell"
  Get-Module > "C:\Users\Patrick Wu\dotfiles\windows\WindowsPowerShell\installedmodules.txt"
  Write-Host "Backup Windows Terminal configuration..." -ForegroundColor Green
  Copy-Item "C:\Users\Patrick Wu\AppData\Local\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\*" -Destination "C:\Users\Patrick Wu\dotfiles\windows\WindowsTerminal" -Recurse
  $timestamp = Get-Date -Format o | ForEach-Object { $_ -replace ":", "." }
  Write-Host "Created at $timestamp. Uploading..." -ForegroundColor Green
  git --git-dir="C:\Users\Patrick Wu\dotfiles\.git" --work-tree="C:\Users\Patrick Wu\dotfiles" add -A
  git --git-dir="C:\Users\Patrick Wu\dotfiles\.git" --work-tree="C:\Users\Patrick Wu\dotfiles" commit -S -m "Windows 10 dotfiles backup: $timestamp"
  git --git-dir="C:\Users\Patrick Wu\dotfiles\.git" --work-tree="C:\Users\Patrick Wu\dotfiles" push
}

Import-Module Get-ChildItemColor

Set-Alias l Get-ChildItemColor -option AllScope
Set-Alias ls Get-ChildItemColorFormatWide -option AllScope

Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Honukai
$ThemeSettings.PromptSymbols.PromptIndicator = [char]::ConvertFromUtf32(0x03bb)