local M = {}

-- Define the toggleterm format
M.toggleterm = {
	cmd = { vim.o.shell },
	buf = nil, -- Buffer will be assigned here
	winopt = {
		relative = "editor",
		col = 0, -- Start from the leftmost column
		row = vim.o.lines - math.floor(vim.o.lines * 0.3), -- Start the window 20% from the bottom
		width = vim.o.columns, -- Full width of the editor
		height = math.floor(vim.o.lines * 0.3) - 2, -- 20% height of the editor
		border = { "═", "═", "═", "", "", "", "", "" },
		style = "minimal",
	},
}

M.toggle = function()
	if not vim.api.nvim_buf_is_valid(M.toggleterm.buf or -1) then
		M.toggleterm.buf = vim.api.nvim_create_buf(false, false)
	end
	M.win = vim.iter(vim.fn.win_findbuf(M.toggleterm.buf)):find(function(b_wid)
		return vim.iter(vim.api.nvim_tabpage_list_wins(0)):any(function(t_wid)
			return b_wid == t_wid
		end)
	end) or vim.api.nvim_open_win(M.toggleterm.buf, false, M.toggleterm.winopt)

	if vim.api.nvim_win_get_config(M.win).hide then
		vim.api.nvim_win_set_config(M.win, { hide = false })
		vim.api.nvim_set_current_win(M.win)
		if vim.bo[M.toggleterm.buf].channel <= 0 then
			vim.fn.termopen(M.toggleterm.cmd)
		end
		vim.cmd("startinsert")
	else
		vim.api.nvim_win_set_config(M.win, { hide = true })
		vim.api.nvim_set_current_win(vim.fn.win_getid(vim.fn.winnr("#")))
	end
end

return M
