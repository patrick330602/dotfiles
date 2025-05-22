# shellcheck disable=SC2148
# ignore SC2148 since this file is sourced by all shells

# load only if running in bash
# shellcheck disable=SC2128
if [ -n "${BASH_VERSINFO}" ]; then
	# load starship prompt if it is installed, else warn the user to install it
	if command -v starship >/dev/null 2>&1; then
		eval "$(starship init bash)"
	else
		if command -v dnf >/dev/null 2>&1; then
			instructions="sudo dnf copr enable atim/starship && sudo dnf install starship"
		else
			instructions="curl -fsSL https://starship.rs/install.sh | bash"
		fi
		echo "starship is not installed. Install it with '$instructions'"
	fi

	# shellcheck source=bash-preexec.sh
	source "$HOME/.dotfiles/rc/bash-preexec.sh"
	eval "$(atuin init bash)"
fi

#alias
alias open="xdg-open"

# vim:ft=sh
