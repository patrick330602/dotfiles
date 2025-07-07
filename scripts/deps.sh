#!/bin/sh

DEPS_TYPE=""

case "$(uname -s)" in
Darwin*)
	DEPS_TYPE="mac"
	;;
Linux*)
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
neovim
libgit2
fzf
fd
rg
delta
bat
lsd
"

mac_packages="
coreutils
gnu-sed
zsh-syntax-highlighting
atuin
starship
"

fedora_copr="
atim/starship
"

fedora_packages="
starship
python3-neovim
"

fedora_commands="
autin:curl --proto '=https' --tlsv1.2 -LsSf https://github.com/atuinsh/atuin/releases/latest/download/atuin-installer.sh | sh
"

ubuntu_ppa="
neovim-ppa/stable
"

ubuntu_packages="
python3-neovim
"

ubuntu_commands="
starship:curl -fsSL https://starship.rs/install.sh | sh -s -- -y
"

enable_copr() {
	sudo dnf install 'dnf-command(copr)' -y
	for pkg in "$@"; do
		sudo dnf copr enable $pkg -y
	done
}

install_packages() {
	packages=$(printf '%s' "$1" | sed -e '/^[[:space:]]*$/d' | tr '\n' ' ')
	case "$DEPS_TYPE" in
	mac)
		echo "::Homebrew::Installing the following packages: $packages "
		brew install --quiet $packages
		;;
	fedora)
		echo "::DNF::Installing the following packages: $packages "
		sudo dnf install -y $packages
		;;
	ubuntu | debian)
		echo "::Homebrew::Installing the following packages: $packages "
		sudo apt-get install -y $packages
		;;
	esac
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
case "$DEPS_TYPE" in
mac)
	brew update --quiet
	brew upgrade --quiet
	;;
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
install_packages "$(eval echo \$"${DEPS_TYPE}_packages")"
execute_commands
