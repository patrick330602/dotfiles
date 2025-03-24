#!/bin/sh

echo "updating dependencies..."
sh "$HOME/.dotfiles/scripts/deps.sh"

echo "::Ensure ~/.config exists..."
mkdir -p "$HOME/.config"

if [ -f "$HOME/.config/starship.toml" ] && [ ! -L "$HOME/.config/starship.toml" ]; then
    echo "::Found existing starship configuration, backup and symlink the config..."
    mv "$HOME/.config/starship.toml" "$HOME/.config/starship.toml.backup.$(date +%Y%m%d%H%M%S)"
    ln -sf "$HOME/.dotfiles/starship.toml" "$HOME/.config/starship.toml"
fi


if test -f "$HOME/.gitconfig" && ! test -L "$HOME/.gitconfig"; then
    echo ":: .gitconfig not installed, Setting up .gitconfig..."
    if test -f "$HOME/.gitconfig" && ! test -f "$HOME/.gitconfig-private"; then
        mv "$HOME/.gitconfig" "$HOME/.gitconfig-private"
    elif ! test -f "$HOME/.gitconfig-private"; then
        echo "::: .gitconfig-private not found, Creating an empty one..."
        touch "$HOME/.gitconfig-private"
    fi

    ln -s "$HOME/.dotfiles/.gitconfig" "$HOME/.gitconfig"
fi

echo "::Update neovim configuration..."
nvim --headless "+Lazy! sync" +qa
nvim --headless "+TSUpdateSync" +qa
nvim --headless "+MasonToolsUpdateSync" +qa

echo "::Done! Please restart your shell/terminal if needed."
