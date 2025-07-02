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
		foreground = "#E1E1E1", -- from default.fg
		background = "#151515",

		cursor_bg = "#D0D0D0", -- from default.cursorBg
		cursor_fg = "#151515", -- from default.cursorFg
		cursor_border = "#D0D0D0", -- matching cursor_bg

		selection_fg = "#E1E1E1", -- from default.fg
		selection_bg = "#202020", -- from default.bgHighlight

		scrollbar_thumb = "#171717", -- from default.bgAlt
		split = "#171717",     -- from default.bgAlt

		ansi = {
			"#151515", -- black (default.black)
			"#b46958", -- red (default.red)
			"#90A959", -- green (default.green)
			"#F4BF75", -- yellow (default.yellow)
			"#BAD7FF", -- blue (default.blue)
			"#AA759F", -- magenta (default.magenta)
			"#88afa2", -- cyan (default.cyan)
			"#E1E1E1", -- white (default.white)
		},
		brights = {
			"#727272", -- bright black (default.grey)
			"#984936", -- bright red (default.error)
			"#586935", -- bright green (default.signAdd)
			"#ab8550", -- bright yellow (default.warning)
			"#576f82", -- bright blue (default.hint)
			"#AA749F", -- bright magenta (default.purple)
			"#88afa2", -- bright cyan (same as normal)
			"#E1E1E1", -- bright white (default.white)
		},
		indexed = { [16] = "#FFA557", [17] = "#b46958" },
	}


return config
