local wezterm = require("wezterm")
local config = wezterm.config_builder()

config.enable_wayland = false

config.font = wezterm.font_with_fallback({
	{
		family = "0xProto",
		harfbuzz_features = { "ss01" },
	},
	"Flog Symbols",
	{ family = "Noto Sans Mono CJK HK",  scale = 1.2 },
	{ family = "Noto Sans Mono CJK TC",  scale = 1.2 },
	{ family = "Symbols Nerd Font Mono", scale = 0.75 },
})
config.font_size = 16.0
if wezterm.target_triple == 'x86_64-unknown-linux-gnu' then
	config.font_size = 12.0
end

config.use_fancy_tab_bar = false
config.window_decorations = "TITLE | RESIZE | MACOS_USE_BACKGROUND_COLOR_AS_TITLEBAR_COLOR"
config.window_frame = {
	font = wezterm.font({ family = "0xProto", weight = "Bold" }),
	font_size = 14,
}
config.tab_bar_at_bottom = true


config.colors = {
	foreground = "#d4dce6",
	background = "#0f1419",

	cursor_bg = "#c4d1dc",
	cursor_fg = "#0f1419",
	cursor_border = "#c4d1dc",

	selection_fg = "#d4dce6",
	selection_bg = "#1a2332",

	scrollbar_thumb = "#111823",
	split = "#111823",

	ansi = {
		"#0f1419",
		"#c17a6b",
		"#5d8a72",
		"#d4a574",
		"#7fb3d3",
		"#8b7ca6",
		"#4a9b9b",
		"#d4dce6",
	},
	brights = {
		"#6b7d8f",
		"#b85c4a",
		"#4a6b3a",
		"#c4965a",
		"#5a7a8f",
		"#8b7ca6",
		"#4a9b9b",
		"#d4dce6",
	},
	indexed = { [16] = "#d49c6b", [17] = "#a67c9a" },
}

return config
