-- a fork of cyberdream's color pallete
---@class DaydreamColors
local M = {}

---@class DaydreamColorDefault
---@field bg "#151515"|string
---@field bgAlt "#171717"|string
---@field bgHighlight "#202020"|string
---@field fg "#E1E1E1"|string
---@field grey "#727272"|string
---@field blue "#BAD7FF"|string
---@field green "#90A959"|string
---@field cyan "#88afa2"|string
---@field red "#b46958"|string
---@field yellow "#F4BF75"|string
---@field magenta "#AA759F"|string
---@field pink "#AA749F"|string
---@field orange "#FFA557"|string
---@field purple "#AA749F"|string
---@field white "#E1E1E1"|string
---@field black "#151515"|string
---@field error "#984936"|string
---@field warning "#ab8550"|string
---@field info "#ab8550"|string
---@field hint "#576f82"|string
---@field todo "#578266"|string
---@field signAdd "#586935"|string
---@field signChange "#51657B"|string
---@field signDelete "#984936"|string
---@field cursorBg "#151515"|string
---@field cursorFg "#D0D0D0"|string
---@field accentBlue "#191a20"|string
---@field accentGreen "#1c2019"|string
---@field accentRed "#201919"|string
---@field winShadeLighter "#1e2326"|string
---@field winShadeDarker "#141719"|string

---@class DaydreamColors
---@field default DaydreamColorDefault
M.default = {
	none = "NONE",
	bg = "#151515",
	bgAlt = "#171717",
	bgHighlight = "#202020",
	fg = "#E1E1E1",
	grey = "#727272",
	blue = "#BAD7FF",
	green = "#90A959",
	cyan = "#88afa2",
	red = "#b46958",
	yellow = "#F4BF75",
	magenta = "#AA759F",
	pink = "#AA749F",
	orange = "#FFA557",
	purple = "#AA749F",
	white = "#E1E1E1",
	black = "#151515",
	error = "#984936",
	warning = "#ab8550",
	info = "#ab8550",
	hint = "#576f82",
	todo = "#578266",
	signAdd = "#586935",
	signChange = "#51657B",
	signDelete = "#984936",
	cursorFg = "#151515",
	cursorBg = "#D0D0D0",
	accentBlue = "#191a20",
	accentGreen = "#1c2019",
	accentRed = "#201919",
	winShadeLighter = "#1e2326",
	winShadeDarker = "#141719",
}



---@alias Colors table<DaydreamColorDefault|string, string>
---@alias DaydreamPalette DaydreamColorDefault|Colors

return M
