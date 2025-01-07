local constants = require("pdfs.visual.constants")
local utils = require("pdfs.visual.utils")

local M = {}

M.mode = function()
	local mode = vim.api.nvim_get_mode().mode
	local hl_group = constants.modes[mode] or "StUnknownMode"
	local current_mode = "%#" .. hl_group .. "# %#None# "

	local recording_register = vim.fn.reg_recording()

	if recording_register == "" then
		return current_mode
	else
		return "%#STMacro# 󰑊 " .. recording_register .. "%#None# "
	end
end

M.extensions = function()
	local result = {}
	local current_win = vim.api.nvim_get_current_win()
	local wins = vim.api.nvim_tabpage_list_wins(vim.api.nvim_get_current_tabpage())

	for _, win in ipairs(wins) do
		local buf = vim.api.nvim_win_get_buf(win)
		local ft = vim.bo[buf].ft

		if
			utils.findValueByPrefix(constants.extensions, ft)
			and not utils.findValueByPrefix(constants.extensions_hidden, ft)
		then
			local r = utils.findValueByPrefix(constants.extensions, ft)
			if r then
				local hl = current_win == win and "%#" .. r.hl_group .. "#" or "%#StExtInactive#"
				table.insert(result, hl .. " " .. r.icon .. " %#None#")
			end
		end
	end

	return table.concat(result, "")
end

M.git = function()
	local bufnr = vim.api.nvim_win_get_buf(0)
	if not vim.b[bufnr].gitsigns_head or vim.b[bufnr].gitsigns_git_status then
		return "%#None#"
	end

	local git_status = vim.b[bufnr].gitsigns_status_dict

	local added = (git_status.added and git_status.added ~= 0) and ("%#StGitAdd# +" .. git_status.added) or ""
	local changed = (git_status.changed and git_status.changed ~= 0) and ("%#StGitChange# ~" .. git_status.changed)
		or ""
	local removed = (git_status.removed and git_status.removed ~= 0) and ("%#StGitRemove# -" .. git_status.removed)
		or ""
	local branch_name = git_status.head and "%#StGitBranch#  " .. git_status.head or ""

	return branch_name .. added .. changed .. removed .. " %#None# "
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

	return "%#StPos# Ln %l, Col %c "
end

M.generate_statusline = function()
	local statusline = {
		M.mode(),
		M.git(),
		"%=",
		M.lsp_diagnostics(),
		M.extensions(),
		M.cursor_position(),
	}
	return table.concat(statusline)
end

return M
