-- inspired by https://gist.githubusercontent.com/roycrippen4/86d3a69fc7d28e406a2e883132c6ea81/raw/af4c111b2c60eb296024d99b8d1446302dd3eb42/statusline.lua
local autocmd = vim.api.nvim_create_autocmd

local clock_timer = vim.uv.new_timer()

--- WARNING: DONT CHANGE THIS
local function redraw()
	vim.cmd("redrawstatus")
end

if clock_timer then
	clock_timer:start(1000, 1000, vim.schedule_wrap(redraw))
end

local M = {}

local modes = {
	-- Normal
	["n"] = "StNormalMode",
	["no"] = "StNormalMode",
	["nov"] = "StNormalMode",
	["noV"] = "StNormalMode",
	["noCTRL-V"] = "StNormalMode",
	["niI"] = "StNormalMode",
	["niR"] = "StNormalMode",
	["niV"] = "StNormalMode",
	["nt"] = "StNTerminalMode",
	["ntT"] = "StNTerminalMode",

	-- Visual
	["v"] = "StVisualMode",
	["vs"] = "StVisualMode",
	["V"] = "StVisualMode",
	["Vs"] = "StVisualMode",
	[""] = "StVisualMode",

	-- Insert
	["i"] = "StInsertMode",
	["ic"] = "StInsertMode",
	["ix"] = "StInsertMode",

	-- Terminal
	["t"] = "StTerminalMode",

	-- Replace
	["R"] = "StReplaceMode",
	["Rc"] = "StReplaceMode",
	["Rx"] = "StReplaceMode",
	["Rv"] = "StReplaceMode",
	["Rvc"] = "StReplaceMode",
	["Rvx"] = "StReplaceMode",

	-- Select
	["s"] = "StSelectMode",
	["S"] = "StSelectMode",
	[""] = "StSelectMode",

	-- Command
	["c"] = "StCommandMode",
	["cv"] = "StCommandMode",
	["ce"] = "StCommandMode",

	-- Confirm
	["r"] = "StConfirmMode",
	["rm"] = "StConfirmMode",
	["r?"] = "StConfirmMode",
	["x"] = "StConfirmMode",

	-- Shell
	["!"] = "StTerminalMode",
}

M.mode = function()
	local mode = vim.api.nvim_get_mode().mode
	local hl_group = modes[mode] or "StUnknownMode"
	local current_mode = "%#" .. hl_group .. "# %#StSep#"

	local recording_register = vim.fn.reg_recording()

	if recording_register == "" then
		return current_mode
	else
		return "%#STMacro# 󰑊 " .. recording_register .. "%#StSep#"
	end
end

local function truncate_filename(filename, max_length)
	local max_len = max_length or 20
	local len = #filename

	if len <= max_len then
		return filename
	end

	local base_name, extension = filename:match("(.*)%.(.*)")
	if not base_name then
		base_name = filename
		extension = ""
	end

	local base_len = max_len - #extension - 1
	local partial_len = math.floor(base_len / 2)

	return base_name:sub(1, partial_len) .. "…" .. base_name:sub(-partial_len) .. "." .. extension
end

M.file_info = function()
	local icon = " 󰈚 "
	local path = vim.api.nvim_buf_get_name(vim.api.nvim_win_get_buf(0))
	local name = (path == "" and "Empty ") or path:match("([^/\\]+)[/\\]*$")

	if name == "[Command Line]" then
		return "  CmdHistory "
	end

	if #name > 25 then
		name = truncate_filename(name)
	end

	if name ~= "Empty " then
		local ft_icon, _ = require("nvim-web-devicons").get_icon(name)
		icon = ((ft_icon ~= nil) and ft_icon) or icon

		name = " " .. name .. " "
	end

	local filetypes = {
		DressingInput = {
			icon = "  ",
			label = "INPUT BOX",
		},
		lspinfo = {
			icon = "  ",
			label = "LSP INFO",
		},
		mason = {
			icon = "%#StMason# 󱌣 ",
			label = "MASON",
		},
		undotree = {
			icon = "%#StUndoTree#  ",
			label = "UNDOTREE",
		},
		lazy = {
			icon = "%#StLazy# 💤 ",
			label = "LAZY",
		},
		oil = {
			icon = "%#StOil# 󰼙 ",
			label = "Oil",
		},
		Trouble = {
			icon = "%#StTrouble#  ",
			label = "TROUBLE",
		},
		TelescopePrompt = {
			icon = "%#StTelescope#  ",
			label = "TELESCOPE",
		},
	}

	local ft = vim.bo.ft
	if #ft >= 6 and string.sub(ft, 1, 6) == "Neogit" then
		return "%#StGit#  Git %#StSep# "
	end
	for k, v in pairs(filetypes) do
		if string.find(ft, k) ~= nil then
			return v.icon .. v.label .. "%#StSep# "
		end
	end

	return " %#StFileName# " .. icon .. name .. "%#StSep# "
end

M.git = function()
	local bufnr = vim.api.nvim_win_get_buf(0)
	if not vim.b[bufnr].gitsigns_head or vim.b[bufnr].gitsigns_git_status then
		return "%#StEmptySpace#"
	end

	local git_status = vim.b[bufnr].gitsigns_status_dict

	local added = (git_status.added and git_status.added ~= 0) and ("%#StGitAdd# +" .. git_status.added) or ""
	local changed = (git_status.changed and git_status.changed ~= 0) and ("%#StGitChange# ~" .. git_status.changed)
		or ""
	local removed = (git_status.removed and git_status.removed ~= 0) and ("%#StGitRemove# -" .. git_status.removed)
		or ""
	local branch_name = "%#StGitBranch#  " .. git_status.head

	return branch_name .. added .. changed .. removed .. " %#StFileSep# "
end

M.lsp_diagnostics = function()
	if vim.bo.ft == "lazy" then
		return ""
	end

	local count = vim.diagnostic.count(0)
	local errors = count[1]
	local warnings = count[2]
	local hints = count[3]
	local info = count[4]

	errors = (errors and errors > 0) and ("%#StLspError# " .. errors .. " ") or ""
	warnings = (warnings and warnings > 0) and ("%#StLspWarning# " .. warnings .. " ") or ""
	hints = (hints and hints > 0) and ("%#StLspHints#󰠠 " .. hints .. " ") or ""
	info = (info and info > 0) and ("%#StLspInfo# " .. info .. " ") or ""

	return vim.o.columns > 140 and errors .. warnings .. hints .. info or ""
end

M.cursor_position = function()
	local current_mode = vim.fn.mode(true)

	local v_line, v_col = vim.fn.line("v"), vim.fn.col("v")
	local cur_line, cur_col = vim.fn.line("."), vim.fn.col(".")

	if current_mode == "" then
		return "%#StVisualMode#"
			.. " Ln "
			.. math.abs(v_line - cur_line) + 1
			.. ", Col "
			.. math.abs(v_col - cur_col) + 1
			.. " "
	end

	local total_lines = math.abs(v_line - cur_line) + 1
	if current_mode == "V" then
		local cur_line_is_bigger = v_line and cur_line and v_line < cur_line

		if cur_line_is_bigger then
			return "%#StVisualMode#" .. " Ln " .. v_line .. " - Ln %l ⎸ " .. total_lines
		else
			return "%#StVisualMode#" .. " Ln %l - Ln " .. v_line .. " ⎸ " .. total_lines
		end
	end

	if current_mode == "v" then
		if v_line == cur_line then
			return "%#StVisualMode#" .. " Col " .. math.abs(v_col - cur_col) + 1 .. " "
		else
			return "%#StVisualMode#" .. " Ln " .. total_lines .. " "
		end
	end

	return vim.o.columns > 140 and "%#StPos# Ln %l, Col %c " or ""
end

-- -- Dynamically changes the highlight group of the statusline mode segment based on the current mode
-- autocmd('ModeChanged', {
--   group = vim.api.nvim_create_augroup('StatusLineMode', { clear = true }),
--   callback = function()
--     local entry = modes[vim.api.nvim_get_mode().mode]
--     local hl = vim.api.nvim_get_hl(0, { name = entry.hl })
--     vim.api.nvim_set_hl(0, 'StNvimTree', { fg = hl.fg, bg = hl.bg, italic = true })
--     vim.api.nvim_set_hl(0, 'StHarpoon', { fg = hl.fg, bg = hl.bg, italic = true })
--   end,
-- })

-- Dynamically changes the highlight group of the statusline filetype icon based on the current file
-- autocmd("BufEnter", {
-- 	group = vim.api.nvim_create_augroup("StatusLineFiletype", { clear = true }),
-- 	callback = function()
-- 		local _, hl_group = require("nvim-web-devicons").get_icon(vim.fn.expand("%:e"))
--
-- 		if hl_group == nil then
-- 			return
-- 		end
--
-- 		local hl = vim.api.nvim_get_hl(0, { name = hl_group })
-- 		vim.api.nvim_set_hl(0, "StFtIcon", { fg = hl.fg, bg = "#21252b" })
-- 	end,
-- })
--
vim.opt.statusline = "%!v:lua.require('pdfs.visual.statusline').generate_statusline()"

M.generate_statusline = function()
	local statusline = {
		M.mode(),
		M.file_info(),
		M.git(),
		M.lsp_diagnostics(),
		"%=",
		M.cursor_position(),
	}
	return table.concat(statusline)
end

return M
