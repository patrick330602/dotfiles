return {
	{
		"nvzone/typr",
		dependencies = "nvzone/volt",
		cmd = { "Typr", "TyprStats" },
	},
	{
		"nvzone/timerly",
		cmd = "TimerlyToggle",
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
