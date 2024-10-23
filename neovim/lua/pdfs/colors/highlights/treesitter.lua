local M = {}
local util = require("pdfs.colors.util")

--- Get extension configuration
--- @param t DaydreamPalette
function M.get(t)
	local highlights = {
		["@annotation"] = { link = "PreProc" },
		["@attribute"] = { link = "PreProc" },
		["@boolean"] = { link = "Boolean" },
		["@character"] = { link = "Character" },
		["@character.special"] = { link = "SpecialChar" },
		["@comment"] = { link = "Comment" },
		["@conditional"] = { link = "Conditional" },
		["@constant"] = { link = "Constant" },
		["@constant.builtin"] = { link = "Special" },
		["@constant.macro"] = { link = "Define" },
		["@constructor"] = { link = "Special" },
		["@debug"] = { link = "Debug" },
		["@define"] = { link = "Define" },
		["@exception"] = { link = "Exception" },
		["@field"] = { link = "Identifier" },
		["@float"] = { link = "Float" },
		["@function"] = { link = "Function" },
		["@function.builtin"] = { link = "Special" },
		["@function.call"] = { link = "@function" },
		["@function.macro"] = { link = "Macro" },
		["@include"] = { link = "Include" },
		["@keyword"] = { link = "Keyword" },
		["@keyword.coroutine"] = { link = "@keyword" },
		["@keyword.function"] = { link = "Keyword" },
		["@keyword.operator"] = { link = "@operator" },
		["@keyword.return"] = { link = "@keyword" },
		["@keyword.type"] = { fg = t.orange, italic = true },
		["@label"] = { link = "Label" },
		["@markup.heading.1"] = { link = "markdownH1" },
		["@markup.heading.2"] = { link = "markdownH2" },
		["@markup.heading.3"] = { link = "markdownH3" },
		["@markup.heading.4"] = { link = "markdownH4" },
		["@markup.heading.5"] = { link = "markdownH5" },
		["@markup.heading.6"] = { link = "markdownH6" },
		["@markup.italic"] = { fg = t.blue, italic = true },
		["@markup.link.label"] = { link = "Label" },
		["@markup.link.label.markdown_inline"] = { fg = t.cyan },
		["@markup.link.markdown_inline"] = { fg = t.blue },
		["@markup.link.url"] = { fg = t.blue, underline = true },
		["@markup.list.checked"] = { fg = t.green, bold = true },
		["@markup.list.unchecked"] = { fg = t.magenta, bold = true },
		["@markup.quote"] = { link = "Comment" },
		["@markup.strong"] = { fg = t.pink, bold = true },
		["@method"] = { link = "Function" },
		["@method.call"] = { link = "@method" },
		["@namespace"] = { link = "Include" },
		["@none"] = { default = true },
		["@number"] = { link = "Number" },
		["@operator"] = { link = "Operator" },
		["@parameter"] = { link = "Identifier" },
		["@preproc"] = { link = "PreProc" },
		["@property"] = { link = "Identifier" },
		["@punctuation.bracket"] = { link = "Delimiter" },
		["@punctuation.delimiter"] = { link = "Delimiter" },
		["@punctuation.special"] = { link = "Delimiter" },
		["@repeat"] = { link = "Repeat" },
		["@storageclass"] = { link = "StorageClass" },
		["@string"] = { link = "String" },
		["@string.escape"] = { link = "SpecialChar" },
		["@string.regex"] = { link = "String" },
		["@string.special"] = { link = "SpecialChar" },
		["@symbol"] = { link = "Identifier" },
		["@tag"] = { link = "Label" },
		["@tag.attribute"] = { link = "@property" },
		["@tag.delimiter"] = { link = "Delimiter" },
		["@text"] = { link = "@none" },
		["@text.danger"] = { link = "WarningMsg" },
		["@text.emphasis"] = { italic = true },
		["@text.environment"] = { link = "Macro" },
		["@text.environment.name"] = { link = "Type" },
		["@text.literal"] = { link = "String" },
		["@text.math"] = { link = "Special" },
		["@text.note"] = { link = "SpecialComment" },
		["@text.reference"] = { link = "Constant" },
		["@text.strike"] = { strikethrough = true },
		["@text.strong"] = { bold = true, default = true },
		["@text.title"] = { link = "markdownH1" },
		["@text.title.2"] = { link = "markdownH2" },
		["@text.title.3"] = { link = "markdownH3" },
		["@text.title.4"] = { link = "markdownH4" },
		["@text.title.5"] = { link = "markdownH5" },
		["@text.todo"] = { link = "Todo" },
		["@text.underline"] = { underline = true },
		["@text.uri"] = { link = "Underlined" },
		["@text.warning"] = { link = "Todo" },
		["@type"] = { link = "Type" },
		["@type.builtin"] = { fg = util.blend(t.purple, t.pink, 0.65) },
		["@type.definition"] = { link = "Typedef" },
		["@type.qualifier"] = { link = "@keyword" },
		["@variable"] = { fg = t.fg },
		["@variable.builtin"] = { link = "Special" },
	}

	return highlights
end

return M
