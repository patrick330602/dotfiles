-- Remove old plugins installed by vim-plug
local plug_dir = vim.fn.stdpath("data") .. "/plugged"
if vim.fn.isdirectory(plug_dir) == 1 then
	vim.fn.delete(plug_dir, "rf")
	vim.api.nvim_echo({
		{ "Removed old plugins installed by vim-plug.\n", "WarningMsg" },
	}, true, {})
end

-- Remove vim-plug if installed
local plug_path = vim.fn.stdpath("data") .. "/site/autoload/plug.vim"
if vim.fn.filereadable(plug_path) == 1 then
	os.remove(plug_path)
	vim.api.nvim_echo({ { "Removed vim-plug from Neovim.\n", "WarningMsg" } }, true, {})
end

--configurations to set at head
vim.g.mapleader = " "
vim.opt.termguicolors = true

vim.filetype.add({
	pattern = {
		[".*"] = {
			function(path, buf)
				return vim.bo[buf]
						and vim.bo[buf].filetype ~= "bigfile"
						and path
						and vim.fn.getfsize(path) > (15 * 1024 * 1024)
						and "bigfile"
					or nil
			end,
		},
	},
})

-- big file handling
-- inspired from https://github.com/folke/snacks.nvim/blob/main/lua/snacks/bigfile.lua
local function wo(win, wo)
	for k, v in pairs(wo or {}) do
		vim.api.nvim_set_option_value(k, v, { scope = "local", win = win })
	end
end

vim.api.nvim_create_autocmd({ "FileType" }, {
	group = vim.api.nvim_create_augroup("local_bigfile", { clear = true }),
	pattern = "bigfile",
	callback = function(ev)
		local path = vim.fn.fnamemodify(vim.api.nvim_buf_get_name(ev.buf), ":p:~:.")
		vim.notify(
			("Big file detected `%s`."):format(path) .. "Some Neovim features have been disabled.",
			vim.log.levels.WARN
		)
		vim.api.nvim_buf_call(ev.buf, function()
			vim.cmd([[NoMatchParen]])
			wo(0, { foldmethod = "manual", statuscolumn = "", conceallevel = 0 })
			vim.b.minianimate_disable = true
			vim.schedule(function()
				vim.bo[ev.buf].syntax = vim.filetype.match({ buf = ev.buf }) or ""
			end)
		end)
	end,
})
