# shellcheck disable=SC2148
# ignore SC2148 since this file is sourced by all shells

BASE_HOMEBREW_FOLDER=/usr/local
if [ "$(arch)" = "arm64" ]; then
    BASE_HOMEBREW_FOLDER=/opt/homebrew
fi

eval "$(${BASE_HOMEBREW_FOLDER}/bin/brew shellenv)"

# load only if running in zsh
if [ -n "$ZSH_VERSION" ]; then
  # load starship prompt if it is installed, else warn the user to install it
    if [ -f ${BASE_HOMEBREW_FOLDER}/bin/starship ]; then
        eval "$(starship init zsh)"
    else
        echo "starship is not installed. Install it with 'brew install starship'"
    fi

    # load zsh-syntax highlighting if it is installed, else warn the user to install it
    if [ -f ${BASE_HOMEBREW_FOLDER}/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh ]; then
        source "${BASE_HOMEBREW_FOLDER}/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
    else
        echo "zsh-syntax-highlighting is not installed. Install it with 'brew install zsh-syntax-highlighting'"
    fi

    eval "$(atuin init zsh)"
fi

# load only if running in bash
if [ -n "${BASH_VERSINFO}" ]; then
  # load starship prompt if it is installed, else warn the user to install it
    if [ -f ${BASE_HOMEBREW_FOLDER}/bin/starship ]; then
        eval "$(starship init bash)"
    else
        echo "starship is not installed. Install it with 'brew install starship'"
    fi

    source $HOME/.dotfiles/bash-preexec.sh
    eval "$(atuin init bash)"
fi

#alias
alias unlock="xattr -cr"
alias unlock-librewolf="xattr -cr /Applications/LibreWolf.app"
alias unlock-chromium="xattr -cr /Applications/Chromium.app"
alias unlock-docker="security -v unlock-keychain ~/Library/Keychains/login.keychain-db"
alias updateall="brew update && brew upgrade && brew cu -f -a -y && mas upgrade"

# vim:ft=sh
