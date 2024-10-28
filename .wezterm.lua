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
	{ family = "Noto Sans Mono CJK HK",  scale = 1.2 },
	{ family = "Noto Sans Mono CJK TC",  scale = 1.2 },
	{ family = "Symbols Nerd Font Mono", scale = 0.75 },
})
config.font_size = 16.0

config.use_fancy_tab_bar = false
config.window_frame = {
	font = wezterm.font({ family = "0xProto", weight = "Bold" }),
	font_size = 14,
}

config.window_decorations = "RESIZE"
config.window_background_opacity = 0.8
config.macos_window_background_blur = 20
config.tab_bar_at_bottom = true

local appearance = get_appearance()
if appearance:find("Dark") then
	config.colors = {
		foreground = "#ffffff",
		background = "#16181a",

		cursor_bg = "#ffffff",
		cursor_fg = "#16181a",
		cursor_border = "#ffffff",

		selection_fg = "#ffffff",
		selection_bg = "#3c4048",

		scrollbar_thumb = "#16181a",
		split = "#16181a",

		ansi = { "#16181a", "#ff6e5e", "#5eff6c", "#f1ff5e", "#5ea1ff", "#bd5eff", "#5ef1ff", "#ffffff" },
		brights = { "#3c4048", "#ff6e5e", "#5eff6c", "#f1ff5e", "#5ea1ff", "#bd5eff", "#5ef1ff", "#ffffff" },
		indexed = { [16] = "#ffbd5e", [17] = "#ff6e5e" },
	}
else
	config.colors = {
		foreground = "#16181a",
		background = "#ffffff",

		cursor_bg = "#16181a",
		cursor_fg = "#ffffff",
		cursor_border = "#16181a",

		selection_fg = "#16181a",
		selection_bg = "#acacac",

		scrollbar_thumb = "#ffffff",
		split = "#ffffff",

		ansi = { "#ffffff", "#d11500", "#008b0c", "#997b00", "#0057d1", "#a018ff", "#008c99", "#16181a" },
		brights = { "#acacac", "#d11500", "#008b0c", "#997b00", "#0057d1", "#a018ff", "#008c99", "#16181a" },
		indexed = { [16] = "#d17c00", [17] = "#d11500" },
	}
end

config.colors["tab_bar"] = { background = "transparent" }

return config
