#oh-my-zsh
export ZSH=/home/patrick/.oh-my-zsh
ZSH_THEME="wsler"
export UPDATE_ZSH_DAYS=7
plugins=(ubuntu)
source $ZSH/oh-my-zsh.sh

# Settings
export DISPLAY=:0
export GTK_THEME=Arc:dark
export GDK_SCALE=2
export PULSE_SERVER=tcp:127.0.0.1
export PATH="${HOME}/.jsvu:${HOME}/exec:$PATH:/usr/local/go/bin"
export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# Perl
PATH="/home/patrick/perl5/bin${PATH:+:${PATH}}"; export PATH;
PERL5LIB="/home/patrick/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"; export PERL5LIB;
PERL_LOCAL_LIB_ROOT="/home/patrick/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"; export PERL_LOCAL_LIB_ROOT;
PERL_MB_OPT="--install_base \"/home/patrick/perl5\""; export PERL_MB_OPT;
PERL_MM_OPT="INSTALL_BASE=/home/patrick/perl5"; export PERL_MM_OPT;

# Virtualenv
#export VIRTUAL_ENV_DISABLE_PROMPT=1
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3 
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/Devel
source /usr/local/bin/virtualenvwrapper.sh

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Alias

alias g="git"
alias socks='ALL_PROXY=socks5://127.0.0.1:1080/ \
        http_proxy=http://127.0.0.1:1080/ \
        https_proxy=http://127.0.0.1:1080/ \
        HTTP_PROXY=http://127.0.0.1:1080/ \
        HTTPS_PROXY=http://127.0.0.1:1080/'
