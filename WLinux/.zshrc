# Oh My Zsh
export ZSH=/home/patrick/.oh-my-zsh
ZSH_THEME="callmepk"
export UPDATE_ZSH_DAYS=7
plugins=(ubuntu command-not-found zsh-autosuggestions zsh-syntax-highlighting)
source $ZSH/oh-my-zsh.sh

# Settings
export DISPLAY=:0
export LIBGL_ALWAYS_INDIRECT=1
export GDK_SCALE=2
export PULSE_SERVER=tcp:127.0.0.1
export GPG_TTY=$(tty)
export PATH="${HOME}/exec:$PATH"
export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# Virtualenv
#export VIRTUAL_ENV_DISABLE_PROMPT=1
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/Devel
source /usr/local/bin/virtualenvwrapper.sh

# Alias
alias cls='clear && echo -en "\e[3J"'
alias g="git"
alias socks='ALL_PROXY=socks5://127.0.0.1:1080/ http_proxy=http://rua:rua@27.0.0.1:1080/ https_proxy=http://rua:rua@127.0.0.1:1080/ HTTP_PROXY=http://rua:rua@127.0.0.1:1080/ HTTPS_PROXY=http://rua:rua@127.0.0.1:1080/'
alias nemo="nemo --no-desktop"
# Perl
PATH="/home/patrick/perl5/bin${PATH:+:${PATH}}"; export PATH;
PERL5LIB="/home/patrick/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"; export PERL5LIB;
PERL_LOCAL_LIB_ROOT="/home/patrick/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"; export PERL_LOCAL_LIB_ROOT;
PERL_MB_OPT="--install_base \"/home/patrick/perl5\""; export PERL_MB_OPT;
PERL_MM_OPT="INSTALL_BASE=/home/patrick/perl5"; export PERL_MM_OPT;
