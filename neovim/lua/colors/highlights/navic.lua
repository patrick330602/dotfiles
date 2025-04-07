local M = {}
local util = require("colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		NavicIconsFile = { fg = t.fg },
		NavicIconsModule = { fg = t.blue },
		NavicIconsNamespace = { link = "Include" },
		NavicIconsPackage = { fg = t.cyan },
		NavicIconsClass = { fg = t.orange },
		NavicIconsMethod = { link = "Function" },
		NavicIconsProperty = { link = "Identifier" },
		NavicIconsField = { link = "Identifier" },
		NavicIconsConstructor = { link = "Special" },
		NavicIconsEnum = { fg = t.purple },
		NavicIconsInterface = { fg = util.blend(t.purple, t.pink, 0.65) },
		NavicIconsFunction = { link = "Function" },
		NavicIconsVariable = { fg = t.fg },
		NavicIconsConstant = { link = "Constant" },
		NavicIconsString = { link = "String" },
		NavicIconsNumber = { link = "Number" },
		NavicIconsBoolean = { link = "Boolean" },
		NavicIconsArray = { fg = t.cyan },
		NavicIconsObject = { fg = t.orange },
		NavicIconsKey = { link = "Identifier" },
		NavicIconsNull = { link = "Special" },
		NavicIconsEnumMember = { fg = t.purple },
		NavicIconsStruct = { fg = t.orange },
		NavicIconsEvent = { fg = t.pink },
		NavicIconsOperator = { link = "Operator" },
		NavicIconsTypeParameter = { fg = t.orange, italic = true },
		NavicText = { fg = t.fg },
		NavicSeparator = { fg = t.blue },
	}

	return highlights
end

return M
