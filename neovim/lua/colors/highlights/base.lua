local M = {}
local util = require("colors.util")

function M.get(t)
	local highlights = {
		Comment = { fg = t.grey, italic = true },
		ColorColumn = { bg = t.bgHighlight },
		Conceal = { fg = t.grey },
		Cursor = { fg = t.cursorFg, bg = t.cursorBg },
		ICursor = { link = "Cursor" },
		CursorIM = { link = "Cursor" },
		CursorColumn = { bg = t.bgHighlight },
		CursorLine = { bg = t.bgHighlight },
		Directory = { fg = t.blue },
		DiffAdd = { bg = util.blend(t.bg, t.green, 0.8) },
		DiffChange = { bg = util.blend(t.bg, t.blue, 0.8) },
		DiffDelete = { bg = util.blend(t.bg, t.red, 0.8) },
		DiffText = { bg = util.blend(t.bg, t.orange, 0.8) },
		Added = { fg = t.green },
		Removed = { fg = t.red },
		EndOfBuffer = { fg = t.bg },
		ErrorMsg = { fg = t.red },
		VertSplit = { fg = t.bgHighlight, bg = t.bg },
		WinSeparator = { fg = t.bgHighlight, bg = t.bg },
		Folded = { fg = t.grey, bg = t.bg },
		FoldColumn = { fg = t.grey, bg = t.bg },
		SignColumn = { fg = t.grey, bg = t.bg },
		SignColumnSB = { fg = t.grey, bg = t.bg },
		Substitute = { fg = t.red, bg = t.bgHighlight },
		LineNr = { fg = util.blend(t.bgHighlight, t.fg, 0.9) },
		CursorLineNr = { fg = t.grey },
		MatchParen = { fg = t.pink, bg = t.bgHighlight },
		ModeMsg = { fg = t.fg },
		MsgArea = { fg = t.fg },
		MoreMsg = { fg = t.blue },
		NonText = { fg = util.blend(t.bg, t.grey, 0.55) },
		Normal = { fg = t.fg, bg = t.bg },
		NormalNC = { fg = t.fg, bg = t.bg },
		NormalFloat = { fg = t.fg, bg = t.bg },
		FloatTitle = { fg = t.cyan, bg = t.bg },
		FloatBorder = { fg = t.bgHighlight, bg = t.bg },
		Pmenu = { fg = t.fg, bg = t.bgAlt },
		PmenuSel = { fg = t.fg, bg = t.bgHighlight },
		PmenuSbar = { fg = t.bg, bg = t.bgHighlight },
		PmenuThumb = { fg = t.bg, bg = t.bgHighlight },
		Question = { fg = t.yellow },
		QuickFixLine = { bg = t.bgHighlight },
		Search = { fg = t.bgAlt, bg = t.fg },
		IncSearch = { fg = t.bgAlt, bg = t.cyan },
		CurSearch = { fg = t.bgAlt, bg = t.cyan },
		SpecialKey = { fg = t.grey },
		SpellBad = { sp = t.red, undercurl = true },
		SpellCap = { sp = t.yellow, undercurl = true },
		SpellLocal = { sp = t.blue, undercurl = true },
		SpellRare = { sp = t.purple, undercurl = true },
		StatusLine = { fg = t.fg, bg = t.bg },
		StatusLineNC = { fg = t.grey, bg = t.bg },
		WinBar = { fg = t.fg, bg = t.bg },
		WinBarNC = { fg = t.grey, bg = t.bg },
		Title = { fg = t.fg },
		Visual = { bg = t.bgHighlight },
		VisualNOS = { bg = t.bgHighlight },
		WarningMsg = { fg = t.orange },
		Whitespace = { fg = t.grey },
		WildMenu = { fg = t.bg, bg = t.blue },


		Type = { fg = t.purple },

		Underlined = { underline = true },
		Bold = { bold = true },
		Italic = { italic = true },

		Error = { fg = t.red },
		Todo = { fg = t.purple, bold = true },

		qfLineNr = { fg = t.grey },
		qfFileName = { fg = t.blue },

		LspReferenceText = { bg = t.bgHighlight },
		LspReferenceRead = { bg = t.bgHighlight },
		LspReferenceWrite = { bg = t.bgHighlight },

		DiagnosticError = { fg = t.red },
		DiagnosticWarn = { fg = t.yellow },
		DiagnosticInfo = { fg = t.blue },
		DiagnosticHint = { fg = t.cyan },
		DiagnosticUnnecessary = { fg = t.grey },

		DiagnosiiucVirtualTextError = { fg = t.red },
		DiagnosticVirtualTextWarn = { fg = t.yellow },
		DiagnosticVirtualTextInfo = { fg = t.blue },
		DiagnosticVirtualTextHint = { fg = t.cyan },

		DiagnosticUnderlineError = { undercurl = true, sp = t.red },
		DiagnosticUnderlineWarn = { undercurl = true, sp = t.yellow },
		DiagnosticUnderlineInfo = { undercurl = true, sp = t.blue },
		DiagnosticUnderlineHint = { undercurl = true, sp = t.cyan },

		LspSignatureActiveParameter = { fg = t.orange },
		LspCodeLens = { fg = t.grey },
		LspInlayHint = { fg = t.grey, bg = t.bgAlt },
		LspInfoBorder = { fg = t.bg },
	}

	return highlights
end

return M
