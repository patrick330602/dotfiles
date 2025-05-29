local wezterm = require("wezterm")
local config = wezterm.config_builder()

local function get_appearance()
	if wezterm.gui then
		return wezterm.gui.get_appearance()
	end
	return "Dark"
end

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

config.use_fancy_tab_bar = false
config.window_decorations = "TITLE | RESIZE | MACOS_USE_BACKGROUND_COLOR_AS_TITLEBAR_COLOR"
config.window_frame = {
	font = wezterm.font({ family = "0xProto", weight = "Bold" }),
	font_size = 14,
}
config.tab_bar_at_bottom = true

config.force_reverse_video_cursor = true

local appearance = get_appearance()
if appearance:find("Dark") then
	config.colors = {
		foreground = "#c5c9c5",
		background = "#181616",

		cursor_bg = "#C8C093",
		cursor_fg = "#C8C093",
		cursor_border = "#C8C093",

		selection_fg = "#C8C093",
		selection_bg = "#2D4F67",

		scrollbar_thumb = "#16161D",
		split = "#16161D",

		ansi = {
			"#0D0C0C",
			"#C4746E",
			"#8A9A7B",
			"#C4B28A",
			"#8BA4B0",
			"#A292A3",
			"#8EA4A2",
			"#C8C093",
		},
		brights = {
			"#A6A69C",
			"#E46876",
			"#87A987",
			"#E6C384",
			"#7FB4CA",
			"#938AA9",
			"#7AA89F",
			"#C5C9C5",
		},
	}
else
	config.colors = {
		foreground = "#545464",
		background = "#f2ecbc",

		cursor_bg = "#43436c",
		cursor_fg = "#f2ecbc",
		cursor_border = "#43436c",

		selection_fg = "#43436c",
		selection_bg = "#c9cbd1",

		scrollbar_thumb = "#d5cea3",
		split = "#d5cea3",

		ansi = {
			"#1F1F28",
			"#c84053",
			"#6f894e",
			"#77713f",
			"#4d699b",
			"#b35b79",
			"#597b75",
			"#545464",
		},
		brights = {
			"#8a8980",
			"#d7474b",
			"#6e915f",
			"#836f4a",
			"#6693bf",
			"#624c83",
			"#5e857a",
			"#43436c",
		},
	}
end

return config
