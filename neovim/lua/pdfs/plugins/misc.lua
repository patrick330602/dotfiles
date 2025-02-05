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
}
