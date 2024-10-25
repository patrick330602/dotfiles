-- a fork of cyberdream's color pallete
---@class DaydreamColors
local M = {}

---@class DaydreamColorLight
---@field bg "#ffffff"|string
---@field bgAlt "#f7f8f9"|string
---@field bgHighlight "#e9eef2"|string
---@field bg_solid? string
---@field fg "#16181a"|string
---@field grey "#7b8496"|string
---@field blue "#5ea1ff"|string
---@field green "#5eff6c"|string
---@field cyan "#5ef1ff"|string
---@field red "#ff6e5e"|string
---@field yellow "#f1ff5e"|string
---@field magenta "#ff5ef1"|string
---@field pink "#ff5ea0"|string
---@field orange "#ffbd5e"|string
---@field purple "#bd5eff"|string
---@field white "#f7f8f9"|string
---@field black "#16181a"|string

---@class DaydreamColorDefault
---@field bg "#16181a"|string
---@field bgAlt "#1e2124"|string
---@field bgHighlight "#3c4048"|string
---@field bg_solid? string
---@field fg "#ffffff"|string
---@field grey "#7b8496"|string
---@field blue "#5ea1ff"|string
---@field green "#5eff6c"|string
---@field cyan "#5ef1ff"|string
---@field red "#ff6e5e"|string
---@field yellow "#f1ff5e"|string
---@field magenta "#ff5ef1"|string
---@field pink "#ff5ea0"|string
---@field orange "#ffbd5e"|string
---@field purple "#bd5eff"|string
---@field white "#f7f8f9"|string
---@field black "#16181a"|string

---@class DaydreamColors
---@field default DaydreamColorDefault
M.default = {
	bg = "#16181a",
	bgAlt = "#1e2124",
	bgHighlight = "#3c4048",
	fg = "#ffffff",
	grey = "#7b8496",
	blue = "#5ea1ff",
	green = "#5eff6c",
	cyan = "#5ef1ff",
	red = "#ff6e5e",
	yellow = "#f1ff5e",
	magenta = "#ff5ef1",
	pink = "#ff5ea0",
	orange = "#ffbd5e",
	purple = "#bd5eff",
	white = "#f7f8f9",
	black = "#16181a",
}

---@class DaydreamColors
---@field light DaydreamColorLight
M.light = {
	bg = "#ffffff",
	bgAlt = "#eaeaea",
	bgHighlight = "#acacac",
	fg = "#16181a",
	grey = "#7b8496",
	blue = "#0057d1",
	green = "#008b0c",
	cyan = "#008c99",
	red = "#d11500",
	yellow = "#997b00",
	magenta = "#d100bf",
	pink = "#f40064",
	orange = "#d17c00",
	purple = "#a018ff",
	white = "#f7f8f9",
	black = "#16181a",
}

---@alias Colors table<DaydreamColorDefault|DaydreamColorLight|string, string>
---@alias DaydreamPalette DaydreamColorLight|DaydreamColorDefault|Colors

return M