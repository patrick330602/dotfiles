-- inspired by https://gist.githubusercontent.com/roycrippen4/86d3a69fc7d28e406a2e883132c6ea81/raw/af4c111b2c60eb296024d99b8d1446302dd3eb42/statusline.lua
local M = {}
local left_extension = { "undotree", "copilot-chat" }
local left_extension_hidden = { "diff" }
local right_extension = { "oil", "DiffviewFiles" }
local right_extension_hidden = {}

local function findValueByKeyPrefix(prefix)
	local filetypes = {
		undotree = {
			icon = "%#StUndoTree#  ",
			label = "Undotree",
		},
		diff = {
			icon = "",
			label = "",
		},
		oil = {
			icon = "%#StOil# 󰼙 ",
			label = "Oil",
		},
		trouble = {
			icon = "%#StTrouble#  ",
			label = "Trouble",
		},
		["copilot-chat"] = {
			icon = "%#StCopilotChat#  ",
			label = "Copilot Chat",
		},
		Neogit = {
			icon = "%#StGit#  ",
			label = "Git",
		},
		toggleterm = {
			icon = "%#StTerm#  ",
			label = "Terminal",
		},
		DiffviewFiles = {
			icon = "%#StDiffFile#  ",
			label = "Diff",
		},
	}
	for key, value in pairs(filetypes) do
		if type(key) == "string" and string.sub(prefix, 1, #key) == key then
			return value
		end
	end
	return nil
end

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
	local current_mode = "%#" .. hl_group .. "# %#None# "

	local recording_register = vim.fn.reg_recording()

	if recording_register == "" then
		return current_mode
	else
		return "%#STMacro# 󰑊 " .. recording_register .. "%#None# "
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

local function get_window_info()
	local windows = {}
	local current_tab = vim.api.nvim_get_current_tabpage()
	local wins = vim.api.nvim_tabpage_list_wins(current_tab)

	-- Sort windows by their position (top to bottom, left to right)
	table.sort(wins, function(a, b)
		local a_row = vim.api.nvim_win_get_position(a)[1]
		local b_row = vim.api.nvim_win_get_position(b)[1]
		if a_row == b_row then
			return vim.api.nvim_win_get_position(a)[2] < vim.api.nvim_win_get_position(b)[2]
		end
		return a_row < b_row
	end)

	for _, win in ipairs(wins) do
		local buf = vim.api.nvim_win_get_buf(win)
		local name = vim.api.nvim_buf_get_name(buf)
		local filename = name ~= "" and vim.fn.fnamemodify(name, ":t") or "Empty"
		local ft = vim.bo[buf].ft
		local special_window = findValueByKeyPrefix(ft)
		local is_floating = vim.api.nvim_win_get_config(win).relative ~= ""

		if filename ~= "Empty" and name ~= "" then
			if #filename > 25 then
				filename = truncate_filename(filename)
			end

			local is_current = win == vim.api.nvim_get_current_win()
			table.insert(windows, {
				win = win,
				filename = filename,
				is_current = is_current,
				is_floating = is_floating,
				filetype = ft,
				special_window = special_window,
			})
		end
	end
	return windows
end

M.files = function()
	local windows = get_window_info()
	local result = {}
	local center_items = {}

	for _, win_info in ipairs(windows) do
		local filename_display = win_info.filename
		if win_info.is_floating then
			filename_display = "[" .. filename_display .. "]"
		end

		local hl_group = win_info.is_current and "StFileNameCurrent" or "StFileName"
		local entry = string.format("%%#%s# %s %%#None#", hl_group, filename_display)

		if win_info.special_window then
			local ft = win_info.filetype
			if
				vim.tbl_contains(left_extension, ft)
				or vim.tbl_contains(left_extension_hidden, ft)
				or vim.tbl_contains(right_extension, ft)
				or vim.tbl_contains(right_extension_hidden, ft)
			then
				goto continue
			else
				table.insert(center_items, "[" .. win_info.special_window.label .. "]")
			end
		else
			table.insert(result, entry)
		end
		::continue::
	end

	local final_result = table.concat(result, " | ")
	if #center_items > 0 then
		if #result > 0 then
			final_result = final_result .. " | " .. table.concat(center_items, " | ")
		else
			final_result = table.concat(center_items, " | ")
		end
	end
	return final_result
end

local function get_extensions(filetypes, hidden)
	local result = {}
	local current_win = vim.api.nvim_get_current_win()
	local wins = vim.api.nvim_tabpage_list_wins(vim.api.nvim_get_current_tabpage())

	for _, win in ipairs(wins) do
		local buf = vim.api.nvim_win_get_buf(win)
		local ft = vim.bo[buf].ft

		if vim.tbl_contains(filetypes, ft) and not vim.tbl_contains(hidden, ft) then
			local r = findValueByKeyPrefix(ft)
			if r then
				table.insert(
					result,
					string.format("%s%s%s", r.icon, win == current_win and r.label .. " " or "", "%#None#")
				)
			end
		end
	end

	return table.concat(result, "")
end

M.left_extensions = function()
	return get_extensions(left_extension, left_extension_hidden)
end

M.right_extensions = function()
	return get_extensions(right_extension, right_extension_hidden)
end

M.term_info = function()
	if vim.bo.ft == "toggleterm" then
		return "%#StTermNum# " .. vim.b.toggle_number .. " %#None#"
	else
		return ""
	end
end

M.oil_info = function()
	if vim.bo.ft == "oil" then
		return "%#StFileName# " .. require("oil").get_current_dir() .. " %#None#"
	else
		return ""
	end
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
	local branch_name = "%#StGitBranch#  " .. git_status.head

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
	local r = findValueByKeyPrefix(vim.bo.ft)
	if r ~= nil then
		return ""
	end

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

vim.opt.statusline = "%{%v:lua.require('pdfs.visual.statusline').generate_statusline()%}"

M.generate_statusline = function()
	local statusline = {
		M.mode(),
		M.left_extensions(),
		M.git(),
		"%=",
		M.files(),
		M.term_info(),
		"%=",
		M.oil_info(),
		M.lsp_diagnostics(),
		M.cursor_position(),
		M.right_extensions(),
	}
	return table.concat(statusline)
end

return M
