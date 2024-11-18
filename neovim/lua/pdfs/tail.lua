-- tails of the configuration
vim.notify = require("fidget").notify

vim.api.nvim_create_user_command("LoadColors", function(opts)
	require("pdfs.colors").load()
end, {})
