#!/bin/sh

DEPS_TYPE=""
BREW_TYPE="Homebrew"

case "$(uname -s)" in
Darwin*)
	DEPS_TYPE="mac"
	;;
Linux*)
	BREW_TYPE="Linuxbrew"
	if [ -f /etc/fedora-release ]; then
		DEPS_TYPE="fedora"
	elif [ -f /etc/debian_version ]; then
		DEPS_TYPE="debian"
	elif [ -f /etc/lsb-release ] && grep -q "Ubuntu" /etc/lsb-release; then
		DEPS_TYPE="ubuntu"
	else
		echo "Unsupported Linux distribution"
		exit 1
	fi
	;;
*)
	echo "Unsupported operating system"
	exit 1
	;;
esac

common_packages="
git
libgit2
fzf
fd
rg
delta
bat
"

mac_packages="
coreutils
gnu-sed
zsh-syntax-highlighting
atuin
"

brew_packages="
atuin
starship
neovim
lua-language-server
dockerfile-language-server
bash-language-server
vscode-langservers-extracted
typescript-language-server
basedpyright
clang-format
shfmt
isort
black
prettier
"

fedora_copr="
"

fedora_packages="
"

ubuntu_ppa="
"

ubuntu_packages="
"

ubuntu_commands="
"

enable_copr() {
	sudo dnf install 'dnf-command(copr)' -y
	for pkg in "$@"; do
		sudo dnf copr enable $pkg -y
	done
}

install_packages() {
	packages=$(printf '%s' "$1" | sed -e '/^[[:space:]]*$/d' | tr '\n' ' ')

	if [ -z "$packages" ]; then
		echo "No packages specified, skipping installation."
		return 0
	fi

	case "$DEPS_TYPE" in
	mac)
		echo "::MacOS::Installing the following packages: $packages "
		brew install --quiet $packages
		;;
	fedora)
		echo "::DNF::Installing the following packages: $packages "
		sudo dnf install -y $packages
		;;
	ubuntu | debian)
		echo "::APT::Installing the following packages: $packages "
		sudo apt-get install -y $packages
		;;
	esac
}

install_brew_packages() {
	packages=$(printf '%s' "$brew_packages" | sed -e '/^[[:space:]]*$/d' | tr '\n' ' ')
	echo "Installing the common $BREW_TYPE packages: $packages "
	brew install --quiet $packages
}

execute_commands() {
	eval echo \$"${DEPS_TYPE}_commands" | while IFS= read -r cmd; do
		binary=$(echo "$cmd" | cut -d: -f1)
		command=$(echo "$cmd" | cut -d: -f2-)
		if ! command -v "$binary" >/dev/null 2>&1; then
			eval "$command"
		fi
	done
}

# Main installation logic
brew update --quiet
brew upgrade --quiet

case "$DEPS_TYPE" in
mac) ;;
fedora)
	sudo dnf update -y
	enable_copr "$fedora_copr"
	;;
ubuntu)
	echo "$ubuntu_ppa" | while IFS= read -r ppa; do
		sudo add-apt-repository -y "ppa:$ppa"
	done
	sudo apt-get update -y
	;;
esac

install_packages "$common_packages"
install_brew_packages
install_packages "$(eval echo \$"${DEPS_TYPE}_packages")"
execute_commands
