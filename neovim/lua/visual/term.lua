---@class Terminal
---@field win number|nil Window handle
---@field buf number|nil Buffer handle
local Terminal = {}
Terminal.__index = Terminal

---@type table<string, Terminal>
local terminals = {}

---@class TerminalOpts
---@field height? number Window height (0-1 for percentage)
---@field cwd? string Working directory
---@field env? table<string,string> Environment variables

local function new(cmd, opts)
	opts = opts or {}
	local self = setmetatable({}, Terminal)

	-- Create buffer
	self.buf = vim.api.nvim_create_buf(false, true)
	vim.api.nvim_buf_set_option(self.buf, "filetype", "toggleterm")

	-- Calculate height
	local height = opts.height or 0.4
	if height <= 1 then
		height = math.floor(vim.o.lines * height)
	end

	-- Create window
	vim.cmd("botright " .. height .. "split")
	self.win = vim.api.nvim_get_current_win()
	vim.api.nvim_win_set_buf(self.win, self.buf)

	-- Set window options
	vim.api.nvim_win_set_option(self.win, "number", false)
	vim.api.nvim_win_set_option(self.win, "relativenumber", false)
	vim.api.nvim_win_set_option(self.win, "winhl", "Normal:Normal")
	vim.api.nvim_win_set_option(self.win, "winfixheight", true)

	-- Open terminal
	local term_opts = {
		cwd = opts.cwd,
		env = opts.env,
	}
	if vim.tbl_isempty(term_opts) then
		term_opts = vim.empty_dict()
	end

	vim.fn.termopen(cmd or vim.o.shell, term_opts)
	vim.cmd("startinsert")

	-- Setup autocommands for cleanup
	vim.api.nvim_create_autocmd("TermClose", {
		buffer = self.buf,
		callback = function()
			if self.win and vim.api.nvim_win_is_valid(self.win) then
				vim.api.nvim_win_close(self.win, true)
			end
			if self.buf and vim.api.nvim_buf_is_valid(self.buf) then
				vim.api.nvim_buf_delete(self.buf, { force = true })
			end
			self.win = nil
			self.buf = nil
		end,
	})

	return self
end

---@param cmd? string|string[]
---@param opts? TerminalOpts
local function toggle(cmd, opts)
	local id = vim.inspect({ cmd = cmd, cwd = opts and opts.cwd, env = opts and opts.env })

	-- Close existing terminal
	if terminals[id] and terminals[id].win and vim.api.nvim_win_is_valid(terminals[id].win) then
		vim.api.nvim_win_close(terminals[id].win, true)
		terminals[id].win = nil
		return
	end

	-- Create new terminal
	terminals[id] = new(cmd, opts)
end

return {
	toggle = toggle,
}
