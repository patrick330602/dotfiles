#!/bin/sh
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


# install configuration nvim-config.lua to ~/.config/nvim/init.lua
# backup existing init.vim if it exists
if test -f "$HOME/.config/nvim/init.vim"; then
    echo "::Backing up existing nvim configuration in vim format..."
    mv "$HOME/.config/nvim/init.vim" "$HOME/.config/nvim/init.vim.bak"
fi
if test -f "$HOME/.config/nvim/init.lua"; then
    echo "::Backing up existing nvim configuration in lua format..."
    mv "$HOME/.config/nvim/init.lua" "$HOME/.config/nvim/init.lua.bak"
fi
echo "::Installing nvim configuration..."
mkdir -p "$HOME/.config/nvim"
if ! test -d "$HOME/.config/nvim/lua/pdfs"; then
    mkdir -p "$HOME/.config/nvim/lua"
    ln -s "$HOME/.dotfiles/neovim" "$HOME/.config/nvim/lua/pdfs"
fi
ln -s "$HOME/.dotfiles/init.lua" "$HOME/.config/nvim/init.lua"
nvim --headless "+Lazy! sync" +qa

echo "::Done! Please restart your shell."
