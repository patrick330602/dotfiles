# shellcheck disable=SC2155,SC1091

# exports
export GPG_TTY=$(tty)
export PATH="$HOME/go/bin:$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$HOME/.android-tools/bin:/usr/local/bin:/usr/local/sbin:$PATH:/usr/local/opt/coreutils/libexec/gnubin"

# alias
alias dchdate="date +'%a, %d %b %Y %T %z'"

# if bat is installed, alias cat to bat
if command -v bat >/dev/null 2>&1; then
	alias cat="bat"
fi

#nodejs related
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# python related
export VIRTUAL_ENV_DISABLE_PROMPT=true

# vim:ft=sh
