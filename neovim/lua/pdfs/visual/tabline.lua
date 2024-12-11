local devicons = require("nvim-web-devicons")

local M = {}

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
	vim.api.nvim_win_set_option(win, "cursorline", true)
	vim.api.nvim_buf_set_option(buf, "modifiable", false)
	vim.api.nvim_buf_set_option(buf, "bufhidden", "delete")

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

-- Get buffer name with optional modifications
local function get_buf_name(buf)
	local name = vim.fn.bufname(buf)
	local icon = ""
	local icon_highlight = ""
	local icon_hlg = {}

	local filename = name ~= "" and vim.fn.fnamemodify(name, ":t") or "No Name"
	local extension = vim.fn.fnamemodify(filename, ":e")
	icon, icon_highlight = devicons.get_icon(filename, extension, { default = true })

	if icon_highlight and icon_highlight ~= "" then
		local fg = vim.fn.synIDattr(vim.fn.synIDtrans(vim.fn.hlID(icon_highlight)), "fg")

		-- Create highlight groups for normal and selected states
		local normal_hl = icon_highlight .. "TabLine"
		local sel_hl = icon_highlight .. "TabLineSel"

		vim.api.nvim_set_hl(0, normal_hl, {
			fg = fg,
			bg = vim.fn.synIDattr(vim.fn.synIDtrans(vim.fn.hlID("TabLine")), "bg"),
		})
		vim.api.nvim_set_hl(0, sel_hl, {
			fg = fg,
			bg = vim.fn.synIDattr(vim.fn.synIDtrans(vim.fn.hlID("TabLineSel")), "bg"),
		})

		icon_hlg = { normal = normal_hl, selected = sel_hl }
	end

	return icon, icon_hlg, filename
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

	table.insert(tabline, "%#TabLineLogo#  %#TabLineFill# ")

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
		local icon, icon_hl, buf_name = get_buf_name(buf)
		local is_current = vim.api.nvim_get_current_buf() == buf

		if is_current then
			table.insert(tabline, "%#TabLineGraphSel#%#TabLineSel#")
		else
			table.insert(tabline, "%#TabLineGraph#%#TabLine#")
		end

		if icon_hl and type(icon_hl) == "table" then
			local hl_group = is_current and icon_hl.selected or icon_hl.normal
			table.insert(tabline, "%" .. "#" .. hl_group .. "# " .. icon .. " ")
		else
			table.insert(tabline, " " .. icon .. " ")
		end

		local buf_text = " " .. buf_name
		if is_modified(buf) then
			buf_text = buf_text .. "+ "
		else
			buf_text = buf_text .. " "
		end

		table.insert(tabline, make_clickable(buf_text, buf, "v:lua.buffer_click"))
		table.insert(tabline, make_clickable("✕ ", buf, "v:lua.close_buffer_click"))
		if vim.api.nvim_get_current_buf() == buf then
			table.insert(tabline, "%#TablineGraphSel#")
		else
			table.insert(tabline, "%#TablineGraph#")
		end
	end

	table.insert(tabline, "%#TabLineFill#")
	table.insert(tabline, "%=")

	-- Add tabs
	for _, tab in ipairs(tabs) do
		local tab_nr = vim.api.nvim_tabpage_get_number(tab)

		if tab_nr == current_tab then
			table.insert(tabline, "%#TabLineSel#")
		else
			table.insert(tabline, "%#TabLine#")
		end

		table.insert(tabline, make_clickable(" " .. tab_nr .. " ", tab, "v:lua.tab_click"))
	end

	return table.concat(tabline, "")
end

-- Update autocmd to track buffer history
vim.api.nvim_create_autocmd("BufEnter", {
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

vim.o.showtabline = 2 -- Always show tabline
vim.o.tabline = '%!v:lua.require("pdfs.visual.tabline").tabline()'

return M