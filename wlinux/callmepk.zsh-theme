# ZSH Theme - informator
# Author: Patrick Wu <wotingwu@live.com>
# Theme based on my theme WSL theme, WSL only
autoload -Uz add-zsh-hook

export VIRTUAL_ENV_DISABLE_PROMPT=yes

function virtenv_indicator {
    if [[ -z $VIRTUAL_ENV ]] then
        psvar[1]=''
    else
        psvar[1]=${VIRTUAL_ENV##*/}
    fi
}

add-zsh-hook precmd virtenv_indicator


# Current Dir Shortener
local current_dir=' %{$fg[magenta]%}%14<...<%~%<<%{$reset_color%} '

# Git info
local git_info='$(git_prompt_status)%{$fg[cyan]%}$(git_prompt_info)'
ZSH_THEME_GIT_PROMPT_ADDED=" %{$fg[green]%}+"
ZSH_THEME_GIT_PROMPT_MODIFIED=" %{$fg[magenta]%}!"
ZSH_THEME_GIT_PROMPT_DELETED=" %{$fg[red]%}-"
ZSH_THEME_GIT_PROMPT_RENAMED=" %{$fg[blue]%}>"
ZSH_THEME_GIT_PROMPT_UNMERGED=" %{$fg[cyan]%}#"
ZSH_THEME_GIT_PROMPT_UNTRACKED=" %{$fg[yellow]%}?"
ZSH_THEME_GIT_PROMPT_PREFIX=" "
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DIRTY=":%{$fg[red]%}x"
ZSH_THEME_GIT_PROMPT_CLEAN=":%{$fg[green]%}o"

local exit_code="%(?,,[%{$fg[red]%}%B! %?%b%{$reset_color%}])"
local userinfo="%(!.%{$fg[red]%}.%{$fg[blue]%})$USER%{$reset_color%}"

PROMPT="%(1V.%{$fg[yellow]%}%1v %{$reset_color%}.)${userinfo}${git_info} %{$fg[magenta]%}%~%{$reset_color%} %(!.#.$) "
RPROMPT="${exit_code}"
