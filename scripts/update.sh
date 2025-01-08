#!/bin/sh

echo "updating dependencies..."
sh "$HOME/.dotfiles/scripts/deps.sh"

# install starship config
# if starship config already exists and not symlinked, back it up
if test -f "$HOME/.config/starship.toml"; then
    if ! test -L "$HOME/.config/starship.toml"; then
        echo "::Not symlinked Starship Config; Backing up existing starship configuration..."
        mv "$HOME/.config/starship.toml" "$HOME/.config/starship.toml.bak"
        echo "::Installing starship configuration..."
        mkdir -p "$HOME/.config"
        ln -s "$HOME/.dotfiles/starship.toml" "$HOME/.config/starship.toml"
    fi
else
    echo "::Starship Config not found; Installing starship configuration..."
    mkdir -p "$HOME/.config"
    ln -s "$HOME/.dotfiles/starship.toml" "$HOME/.config/starship.toml"
fi

if test -f "$HOME/.wezterm.lua"; then
    echo "::Backing up Wezterm configuration..."
    mv "$HOME/.wezterm.lua" "$HOME/.wezterm.lua.bak"
fi
echo "::Installing Wezterm Configuration..."
ln -s "$HOME/.dotfiles/.wezterm.lua" "$HOME/.wezterm.lua"

if test -d "$HOME/.config/nvim" && test ! -L "$HOME/.config/nvim"; then
    echo "::Backing up existing nvim configuration..."
    mv "$HOME/.config/nvim" "$HOME/.config/nvim.bak"
fi

echo "::Installing nvim configuration..."
ln -sfn "$HOME/.dotfiles/neovim" "$HOME/.config/nvim" && \
    nvim --headless "+Lazy! sync" +qa && \
    nvim --headless "+TSUpdateSync" +qa && \
    nvim --headless "+MasonToolsUpdateSync" +qa

echo "::Done! Please restart your shell/terminal if needed."
