-- tails of the configuration
vim.notify = require("fidget").notify
vim.api.nvim_create_autocmd("BufWritePre", {
	callback = function()
		vim.lsp.buf.format()
	end,
})
