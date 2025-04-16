local configs = require("nvim-treesitter.configs")
configs.setup({
	ignore_install = {},
	auto_install = true,
	ensure_installed = "all",
	sync_install = false,
	highlight = { enable = true },
	indent = { enable = true },
	textobjects = {
		-- syntax-aware textobjects
		enable = true,
		lsp_interop = {
			enable = true,
			peek_definition_code = {
				["dF"] = "@function.outer",
				["DF"] = "@class.outer",
			},
		},
		keymaps = {
			["af"] = "@function.outer",
			["if"] = "@function.inner",
			["aC"] = "@class.outer",
			["iC"] = "@class.inner",
			["ac"] = "@conditional.outer",
			["ic"] = "@conditional.inner",
			["ae"] = "@block.outer",
			["ie"] = "@block.inner",
			["al"] = "@loop.outer",
			["il"] = "@loop.inner",
			["is"] = "@statement.inner",
			["as"] = "@statement.outer",
			["ad"] = "@comment.outer",
			["am"] = "@call.outer",
			["im"] = "@call.inner",
		},
		move = {
			enable = true,
			set_jumps = true,
			goto_next_start = {
				["]m"] = "@function.outer",
				["]]"] = "@class.outer",
			},
			goto_next_end = {
				["]M"] = "@function.outer",
				["]["] = "@class.outer",
			},
			goto_previous_start = {
				["[m"] = "@function.outer",
				["[["] = "@class.outer",
			},
			goto_previous_end = {
				["[M"] = "@function.outer",
				["[]"] = "@class.outer",
			},
		},
		select = {
			enable = true,
			keymaps = {
				["af"] = "@function.outer",
				["if"] = "@function.inner",
				["ac"] = "@class.outer",
				["ic"] = "@class.inner",
			},
		},
		swap = {
			enable = true,
			swap_next = {
				["<leader>a"] = "@parameter.inner",
			},
			swap_previous = {
				["<leader>A"] = "@parameter.inner",
			},
		},
	},
})

require("ufo").setup({
	provider_selector = function(bufnr, filetype, buftype)
		return { "treesitter", "indent" }
	end,
})

local parser_config = require "nvim-treesitter.parsers".get_parser_configs()
parser_config.opensips = {
	install_info = {
		url = "https://code.wedotstud.io/patrick/tree-sitter-opensips",
		files = { "src/parser.c" },
	},
	filetype = "opensips",
}
