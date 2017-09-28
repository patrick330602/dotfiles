# oh-my-zsh
export ZSH=/home/patrick/.oh-my-zsh
ZSH_THEME="WSL"
export UPDATE_ZSH_DAYS=7
plugins=(git ubuntu zsh-syntax-highlighting zsh-autosuggestions)
source $ZSH/oh-my-zsh.sh

# Settings
export GOPATH="$HOME/go_projects"
export GOBIN="$GOPATH/bin"
export PATH="$PATH:/home/patrick/wslu/source:/home/patrick/exec:/usr/local/go/bin:/home/patrick/go_projects/bin:/opt/gradle/gradle-4.1/bin"
export DISPLAY=:0

# Alias

## COMP2011
alias cdc1='cd /mnt/c/Files/Documents/HKUST/Courses/Year2-F-COMP2011/'
alias cdl1='cd /mnt/c/Files/Documents/HKUST/Courses/Year2-F-COMP2011/_lab'
alias cdh1='cd /mnt/c/Files/Documents/HKUST/Courses/Year2-F-COMP2011/_homework'

## COMP2012
alias cdc2='cd /mnt/c/Files/Documents/HKUST/Courses/Year2-S-COMP2012/'
alias cdl2='cd /mnt/c/Files/Documents/HKUST/Courses/Year2-S-COMP2012/_lab'
alias cdh2='cd /mnt/c/Files/Documents/HKUST/Courses/Year2-S-COMP2012/_homework'

## Hexo
alias hexo_svr="hexo clean && hexo server"
alias cdsites="cd /mnt/c/Files/Documents/Projects/Websites/"

## other
alias clean="make clean"
alias neofetch="neofetch --ascii_distro 'Windows 10 Linux Subsystem'"
alias nodelts="nvm use lts/*"
alias nodes="nvm use stable"

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

# Dev
DEBEMAIL="wotingwu@live.com"
DEBFULLNAME="Patrick Wu"
export DEBEMAIL DEBFULLNAME

# Add RVM to PATH for scripting. Make sure this is the last PATH variable change.
export PATH="$PATH:$HOME/.rvm/bin"
