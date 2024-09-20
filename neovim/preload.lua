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