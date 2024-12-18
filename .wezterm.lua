local wezterm = require("wezterm")
local config = wezterm.config_builder()

function get_appearance()
	if wezterm.gui then
		return wezterm.gui.get_appearance()
	end
	return "Dark"
end

config.font = wezterm.font_with_fallback({
	{
		family = "0xProto",
		harfbuzz_features = { "ss01" },
	},
	"Flog Symbols",
	{ family = "Noto Sans Mono CJK HK", scale = 1.2 },
	{ family = "Noto Sans Mono CJK TC", scale = 1.2 },
	{ family = "Symbols Nerd Font Mono", scale = 0.75 },
})
config.font_size = 16.0

config.use_fancy_tab_bar = false
config.window_frame = {
	font = wezterm.font({ family = "0xProto", weight = "Bold" }),
	font_size = 14,
}

config.window_decorations = "RESIZE"
-- config.window_background_opacity = 0.8
-- config.macos_window_background_blur = 20
config.tab_bar_at_bottom = true

local appearance = get_appearance()
if appearance:find("Dark") then
	config.colors = {
		foreground = "#E1E1E1", -- from default.fg
		background = "#151515", -- from default.bg

		cursor_bg = "#D0D0D0", -- from default.cursorBg
		cursor_fg = "#151515", -- from default.cursorFg
		cursor_border = "#D0D0D0", -- matching cursor_bg

		selection_fg = "#E1E1E1", -- from default.fg
		selection_bg = "#202020", -- from default.bgHighlight

		scrollbar_thumb = "#171717", -- from default.bgAlt
		split = "#171717", -- from default.bgAlt

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
		indexed = { [16] = "#FFA557", [17] = "#b46958" }, -- using orange and red
	}
else
	config.colors = {
		foreground = "#151515", -- from light.fg
		background = "#F5F5DC", -- from light.bg

		cursor_bg = "#151515", -- from light.cursorFg
		cursor_fg = "#D0D0D0", -- from light.cursorBg
		cursor_border = "#151515", -- matching cursor_bg

		selection_fg = "#151515", -- from light.fg
		selection_bg = "#acacac", -- from light.bgHighlight

		scrollbar_thumb = "#eaeaea", -- from light.bgAlt
		split = "#eaeaea", -- from light.bgAlt

		ansi = {
			"#151515", -- black (light.black)
			"#b46958", -- red (light.red)
			"#90A959", -- green (light.green)
			"#F4BF75", -- yellow (light.yellow)
			"#7E97AB", -- blue (light.blue)
			"#AA759F", -- magenta (light.magenta)
			"#88afa2", -- cyan (light.cyan)
			"#E1E1E1", -- white (light.white)
		},
		brights = {
			"#727272", -- bright black (light.grey)
			"#984936", -- bright red (light.error)
			"#586935", -- bright green (light.signAdd)
			"#ab8550", -- bright yellow (light.warning)
			"#576f82", -- bright blue (light.hint)
			"#AA749F", -- bright magenta (light.purple)
			"#88afa2", -- bright cyan (same as normal)
			"#E1E1E1", -- bright white (light.white)
		},
		indexed = { [16] = "#FFA557", [17] = "#b46958" }, -- using orange and red
	}
end

config.colors["tab_bar"] = { background = "transparent" }

return config
