local wezterm = require("wezterm")
local config = wezterm.config_builder()

config.font = wezterm.font_with_fallback({
	{
		family = "0xProto",
		harfbuzz_features = { "ss01" },
	},
	{ family = "Noto Sans Mono CJK HK", scale = 1.2 },
	{ family = "Noto Sans Mono CJK TC", scale = 1.2 },
	{ family = "Symbols Nerd Font Mono", scale = 0.75 },
})

config.font_size = 16.0

config.window_background_opacity = 0.8
config.macos_window_background_blur = 20

config.tab_bar_at_bottom = true
local theme_path = os.getenv("HOME") .. "/.dotfiles/theme.yaml"
local colors, _ = wezterm.color.load_base16_scheme(theme_path)
local bar = wezterm.plugin.require("https://github.com/adriankarlen/bar.wezterm")

bar.apply_to_config(config, {
	modules = {
		username = {
			enabled = false,
		},
		hostname = {
			enabled = false,
		},
		clock = {
			enabled = false,
		},
	},
})

config.colors = colors
config.colors["tab_bar"] = { background = "transparent" }
-- and finally, return the configuration to wezterm
return config
