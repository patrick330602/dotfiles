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
		foreground = "#C5C9C7",
		background = "#14171d",

		cursor_bg = "#C5C9C7",
		cursor_fg = "#14171d",
		cursor_border = "#C5C9C7",

		selection_fg = "#C5C9C7",
		selection_bg = "#393B42",

		scrollbar_thumb = "#393B42",
		split = "#393B42",

		ansi = {
			"#14171d",
			"#C4746E",
			"#8A9A7B",
			"#C4B28A",
			"#8BA4B0",
			"#A292A3",
			"#8EA4A2",
			"#A4A7A4",
		},
		brights = {
			"#A4A7A4",
			"#E46876",
			"#87A987",
			"#E6C384",
			"#7FB4CA",
			"#938AA9",
			"#7AA89F",
			"#C5C9C7",
		}
	}
else
	config.colors = {
		foreground = "#24262D",
		background = "#f2f1ef",

		cursor_bg = "#24262D",
		cursor_fg = "#f2f1ef",
		cursor_border = "#24262D",

		selection_fg = "#24262D",
		selection_bg = "#e2e1df",

		scrollbar_thumb = "#6d6f6e",
		split = "#6d6f6e",

		ansi = {
			"#24262D",
			"#c84053",
			"#6f894e",
			"#77713f",
			"#4d699b",
			"#b35b79",
			"#597b75",
			"#545464",
		},
		brights = {
			"#6d6f6e",
			"#d7474b",
			"#6e915f",
			"#836f4a",
			"#6693bf",
			"#624c83",
			"#5e857a",
			"#43436c",
		}
	}
end

return config
