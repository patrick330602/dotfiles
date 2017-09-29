#oh-my-zsh
export ZSH=/home/patrick/.oh-my-zsh
ZSH_THEME="linuxer-fancy"
export UPDATE_ZSH_DAYS=7
plugins=(ubuntu git)
source $ZSH/oh-my-zsh.sh

# Settings

export PATH="/home/patrick/exec:$PATH"
export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'
export WORKON_HOME=$HOME/.virtualenvs

# Alias

## COMP2011
alias cdc1='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-F-COMP2011/'
alias cdl1='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-F-COMP2011/_lab'
alias cdh1='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-F-COMP2011/_homework'

## COMP2012
alias cdc2='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-S-COMP2012/'
alias cdl2='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-S-COMP2012/_lab'
alias cdh2='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-S-COMP2012/_homework'

## COMP2021
alias cd21='cd /media/patrick/Local\ Disk/Files/Documents/HKUST/Courses/Year2-S-COMP2021'

## Hexo
alias hexo_svr="hexo clean && hexo server"
alias cdsites="cd /media/patrick/Local\ Disk/Files/Documents/Projects/Websites/"

## Other
alias clean="make clean"

#NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

PATH="/home/patrick/perl5/bin${PATH:+:${PATH}}"; export PATH;
PERL5LIB="/home/patrick/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"; export PERL5LIB;
PERL_LOCAL_LIB_ROOT="/home/patrick/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"; export PERL_LOCAL_LIB_ROOT;
PERL_MB_OPT="--install_base \"/home/patrick/perl5\""; export PERL_MB_OPT;
PERL_MM_OPT="INSTALL_BASE=/home/patrick/perl5"; export PERL_MM_OPT;
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Virtualenv
export VIRTUAL_ENV_DISABLE_PROMPT=1
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3 
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/Devel
source /usr/local/bin/virtualenvwrapper.sh
