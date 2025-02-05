local M = {}

local scroll_offset = 0

local function get_unique_path(buf, tab_buffers)
	local full_path = vim.fn.bufname(buf)
	if full_path == "" then
		return "No Name"
	end

	local filename = vim.fn.fnamemodify(full_path, ":t")
	local path = vim.fn.fnamemodify(full_path, ":h")

	-- Check if there are other buffers with the same filename
	local duplicates = {}
	for other_buf, _ in pairs(tab_buffers) do
		if other_buf ~= buf then
			local other_path = vim.fn.bufname(other_buf)
			local other_filename = vim.fn.fnamemodify(other_path, ":t")
			if other_filename == filename then
				table.insert(duplicates, other_path)
			end
		end
	end

	if #duplicates == 0 then
		return filename
	end

	-- Find the distinguishing directory
	local parts = vim.split(path, "/")
	local other_parts = {}
	for _, dup_path in ipairs(duplicates) do
		table.insert(other_parts, vim.split(vim.fn.fnamemodify(dup_path, ":h"), "/"))
	end

	local diff_index = #parts
	for i = #parts, 1, -1 do
		local all_same = true
		for _, op in ipairs(other_parts) do
			if i > #op or parts[i] ~= op[i] then
				all_same = false
				break
			end
		end
		if not all_same then
			diff_index = i
			break
		end
	end

	-- Construct the path from the distinguishing directory onwards
	local result_parts = {}
	for i = diff_index, #parts do
		table.insert(result_parts, parts[i])
	end

	if #result_parts > 0 then
		return table.concat(result_parts, "/") .. "/" .. filename
	end
	return filename
end

local function switch_to_next_buffer()
	local current_tab = vim.fn.tabpagenr()
	local current_tabnr = vim.api.nvim_get_current_tabpage()
	local all_buffers = vim.api.nvim_list_bufs()
	local current_buf = vim.api.nvim_get_current_buf()

	-- Get ordered list of buffers in current tab
	local tab_buffers = {}
	for _, buf in ipairs(all_buffers) do
		if vim.fn.buflisted(buf) == 1 then
			-- Check if buffer is loaded in current tab
			local windows = vim.fn.win_findbuf(buf)
			for _, win in ipairs(windows) do
				local win_tab = vim.api.nvim_win_get_tabpage(win)
				if win_tab == current_tabnr then
					table.insert(tab_buffers, buf)
					break
				end
			end
			-- Include hidden buffers that were last accessed in this tab
			local buf_tab = vim.fn.getbufvar(buf, "last_tab")
			if buf_tab == "" or tonumber(buf_tab) == current_tab then
				-- Only insert if not already in the list
				if not vim.tbl_contains(tab_buffers, buf) then
					table.insert(tab_buffers, buf)
				end
			end
		end
	end

	-- Find current buffer index
	local current_index = 0
	for i, buf in ipairs(tab_buffers) do
		if buf == current_buf then
			current_index = i
			break
		end
	end

	-- Switch to next buffer or first if at end
	if #tab_buffers > 0 then
		local next_index = current_index % #tab_buffers + 1
		vim.api.nvim_set_current_buf(tab_buffers[next_index])
	end
end

-- Dropdown menu implementation
local function create_dropdown(items, callback, opts)
	opts = opts or {}
	local relative = opts.relative or "editor"
	local row = opts.row or 1
	local col = opts.col or 0

	-- Create buffer for dropdown
	local buf = vim.api.nvim_create_buf(false, true)
	vim.api.nvim_buf_set_lines(buf, 0, -1, false, items)

	-- Calculate dimensions
	local max_width = 0
	for _, item in ipairs(items) do
		max_width = math.max(max_width, #item)
	end

	-- Create window
	local win = vim.api.nvim_open_win(buf, true, {
		relative = relative,
		row = row,
		col = col,
		width = max_width,
		height = #items,
		style = "minimal",
		border = "single",
	})

	-- Set window options
	vim.api.nvim_set_option_value("cursorline", true, { win = win })
	vim.api.nvim_set_option_value("modifiable", false, { buf = buf })
	vim.api.nvim_set_option_value("bufhidden", "delete", { buf = buf })

	vim.opt_local.winbar = nil

	-- Set keymaps and functions
	local function close_menu()
		if vim.api.nvim_win_is_valid(win) then
			vim.api.nvim_win_close(win, true)
		end
	end

	local function select_item()
		local idx = vim.api.nvim_win_get_cursor(win)[1]
		close_menu()
		if callback then
			callback(idx)
		end
	end

	-- Combine regular and mouse keymaps
	local keymaps = {
		["<Esc>"] = close_menu,
		["<CR>"] = select_item,
		["<C-c>"] = close_menu,
	}

	for k, v in pairs(keymaps) do
		vim.keymap.set("n", k, v, { buffer = buf, nowait = true })
	end

	-- Close on buffer leave
	vim.api.nvim_create_autocmd("BufLeave", {
		buffer = buf,
		once = true,
		callback = close_menu,
	})
end

-- Buffer click handler
local function buffer_click(bufnr, clicks, button, mods)
	if button == "l" then
		vim.api.nvim_set_current_buf(bufnr)
	elseif button == "r" then
		local mouse_pos = vim.fn.getmousepos()
		create_dropdown({ "Close", "Save", "Force Close" }, function(choice)
			if choice == 1 then
				vim.cmd("bd " .. bufnr)
			elseif choice == 2 then
				vim.cmd("w")
			elseif choice == 3 then
				vim.cmd("bd! " .. bufnr)
			end
		end, {
			relative = "editor",
			row = mouse_pos.screenrow,
			col = mouse_pos.screencol,
		})
	end
end

-- Close buffer handler
local function close_buffer_click(bufnr, clicks, button, mods)
	if button == "l" then
		vim.cmd("bd " .. bufnr)
	end
end

-- Tab click handler
local function tab_click(minwid, clicks, button, mods)
	if button == "l" then
		vim.api.nvim_set_current_tabpage(minwid)
	elseif button == "r" then
		local tab_nr = vim.api.nvim_tabpage_get_number(minwid)
		local mouse_pos = vim.fn.getmousepos()
		create_dropdown({ "Close", "New", "Move Left", "Move Right" }, function(choice)
			if choice == 1 then
				vim.cmd("tabclose " .. tab_nr)
			elseif choice == 2 then
				vim.cmd("tabnew")
			elseif choice == 3 then
				vim.cmd("tabmove -1")
			elseif choice == 4 then
				vim.cmd("tabmove +1")
			end
		end, {
			relative = "editor",
			row = mouse_pos.screenrow,
			col = mouse_pos.screencol,
		})
	end
end

-- Make text clickable
local function make_clickable(text, id, handler)
	return "%" .. id .. "@" .. handler .. "@" .. text .. "%X"
end

-- Check if buffer is modified
local function is_modified(buf)
	return vim.fn.getbufvar(buf, "&modified") == 1
end

-- Main tabline function
function M.tabline()
	local tabline = {}
	local current_tab = vim.fn.tabpagenr()
	local tabs = vim.api.nvim_list_tabpages()
	local all_buffers = vim.api.nvim_list_bufs()
	local current_tabnr = vim.api.nvim_get_current_tabpage()

	table.insert(tabline, "%#TabLineLogo#  %#TabLineFill#%< ")

	-- Get buffers in current tab
	local tab_buffers = {}
	for _, buf in ipairs(all_buffers) do
		if vim.fn.buflisted(buf) == 1 then
			-- Check if buffer is loaded in current tab
			local windows = vim.fn.win_findbuf(buf)
			for _, win in ipairs(windows) do
				local win_tab = vim.api.nvim_win_get_tabpage(win)
				if win_tab == current_tabnr then
					tab_buffers[buf] = true
					break
				end
			end
			-- Also include hidden buffers that were last accessed in this tab
			local buf_tab = vim.fn.getbufvar(buf, "last_tab")
			if buf_tab == "" or tonumber(buf_tab) == current_tab then
				tab_buffers[buf] = true
			end
		end
	end

	-- Show buffers in current tab
	for buf, _ in pairs(tab_buffers) do
		local buf_name = get_unique_path(buf, tab_buffers)
		local is_current = vim.api.nvim_get_current_buf() == buf

		if is_current then
			table.insert(tabline, "%#TabLineGraphSel#%#TabLineSel#")
		else
			table.insert(tabline, "%#TabLineGraph#%#TabLine#")
		end

		local buf_text = " " .. buf_name
		if is_modified(buf) then
			buf_text = buf_text .. " ● "
		else
			buf_text = buf_text .. " "
		end

		table.insert(tabline, make_clickable(buf_text, buf, "v:lua.buffer_click"))
		table.insert(tabline, make_clickable("✕ ", buf, "v:lua.close_buffer_click"))
		if vim.api.nvim_get_current_buf() == buf then
			table.insert(tabline, "%#TabLineGraphSel#")
		else
			table.insert(tabline, "%#TabLineGraph#")
		end
	end

	table.insert(tabline, "%#TabLineFill#%=")

	-- Add tabs
	for _, tab in ipairs(tabs) do
		local tab_nr = vim.api.nvim_tabpage_get_number(tab)

		if tab_nr == current_tab then
			table.insert(tabline, "%#TablineTabSel#")
		else
			table.insert(tabline, "%#TablineTab#")
		end

		table.insert(tabline, make_clickable(" " .. tab_nr .. " ", tab, "v:lua.tab_click"))
	end

	return table.concat(tabline, "")
end

-- Update autocmd to track buffer history
vim.api.nvim_create_autocmd({ "BufEnter", "Bufadd", "BufDelete", "BufFilePost" }, {
	callback = function()
		local buf = vim.api.nvim_get_current_buf()
		local tab = vim.fn.tabpagenr()
		vim.api.nvim_buf_set_var(buf, "last_tab", tab)
	end,
})

-- Set up Alt-Tab keybinding
vim.keymap.set("n", "<A-Tab>", switch_to_next_buffer, { noremap = true, silent = true })

-- Expose click handlers globally
_G.tab_click = tab_click
_G.buffer_click = buffer_click
_G.close_buffer_click = close_buffer_click

return M
