# shellcheck disable=SC2148
# ignore SC2148 since this file is sourced by all shells

eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# load only if running in bash
if [ -n "${BASH_VERSINFO}" ]; then
    # load starship prompt if it is installed, else warn the user to install it
    if command -v starship >/dev/null 2>&1; then
        eval "$(starship init bash)"
    else
        echo "starship is not installed. Install it with 'brew install starship'"
    fi

    source $HOME/.dotfiles/rc/bash-preexec.sh
    eval "$(atuin init bash)"
fi


#alias
alias open="xdg-open"

# vim:ft=sh
