return {
	{
		"nvzone/typr",
		dependencies = "nvzone/volt",
		opts = {
			on_attach = function(buf)
				vim.opt_local.winbar = nil
			end,
		},
		cmd = { "Typr", "TyprStats" },
	},
	{
		"steveslatky/vimcino",
		--- optional custom options
		---@field vimcino.Config
		opts = {
			stats = { file_loc = vim.fn.stdpath("data") .. "/vimcino_stats" },
			blackjack = {
				number_of_decks = 1,
			},
		},
	},
}
