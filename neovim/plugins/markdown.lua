return {
	"OXY2DEV/markview.nvim",
	lazy = false,
	config = function()
		local presets = require("markview.presets")

		require("markview").setup({
			modes = { "n", "i", "no", "c" },
			hybrid_modes = { "i" },
			checkboxes = presets.checkboxes.nerd,
			headings = presets.headings.marker,
			-- This is nice to have
			callbacks = {
				on_enable = function(_, win)
					vim.wo[win].conceallevel = 2
					vim.wo[win].concealcursor = "nc"
				end,
			},
		})
	end,
}
