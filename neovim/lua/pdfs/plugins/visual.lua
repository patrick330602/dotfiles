return {
	{
		"f-person/auto-dark-mode.nvim",
		opts = {
			update_interval = 1000,
			set_dark_mode = function()
				vim.api.nvim_set_option_value("background", "dark", {})
				require("pdfs.colors").load()
			end,
			set_light_mode = function()
				vim.api.nvim_set_option_value("background", "light", {})
				require("pdfs.colors").load()
			end,
		},
	},
	{
		"Bekaboo/dropbar.nvim",
		-- optional, but required for fuzzy finder support
		dependencies = {
			"nvim-telescope/telescope-fzf-native.nvim",
			build = "make",
		},
		config = function()
			local dropbar_api = require("dropbar.api")
			vim.keymap.set("n", "<Leader>;", dropbar_api.pick, { desc = "Pick symbols in winbar" })
			vim.keymap.set("n", "[;", dropbar_api.goto_context_start, { desc = "Go to start of current context" })
			vim.keymap.set("n", "];", dropbar_api.select_next_context, { desc = "Select next context" })
		end,
	},
	{
		"mbbill/undotree",
		keys = {
			{ "<leader>U", vim.cmd.UndotreeToggle, desc = "Toggle UndoTree" },
		},
	},
	{
		"kevinhwang91/nvim-hlslens",
		config = function()
			require("hlslens").setup()

			local kopts = { noremap = true, silent = true }

			local maps = {
				{ "n", "n", [[<Cmd>execute('normal! ' . v:count1 . 'n')<CR><Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "N", [[<Cmd>execute('normal! ' . v:count1 . 'N')<CR><Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "*", [[*<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "#", [[#<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "g*", [[g*<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "g#", [[g#<Cmd>lua require('hlslens').start()<CR>]] },
				{ "n", "<Leader>l", "<Cmd>noh<CR>" },
			}

			for _, map in ipairs(maps) do
				vim.keymap.set(map[1], map[2], map[3], kopts)
			end
		end,
	},
	{
		"stevearc/oil.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = { default_file_explorer = true, delete_to_trash = true, view_options = { show_hidden = true } },
	},
	{
		"ibhagwan/fzf-lua",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		opts = {
			winopts = {
				backdrop = 100,
			},
			files = {
				prompt = "󰱼 ",
			},
			git = {
				files = {
					prompt = " ",
				},
				status = {
					prompt = " ",
				},
				commits = {
					prompt = " ",
				},
				bcommits = {
					prompt = " ",
				},
				blame = {
					prompt = " ",
				},
			},
			grep = {
				prompt = "󰱼 ",
				input_prompt = "󰱼 ",
				no_header = true,
				no_header_i = true,
			},
			oldfiles = {
				prompt = " ",
				include_current_session = true,
				previewer = false,
				fzf_opts = {
					-- Show full file paths
					["--with-nth"] = "-1",
					-- No line wrapping
					["--no-wrap"] = "",
				},
				hls = {
					normal = "FzfLuaTransparentNormal",
					border = "FzfLuaTransparentBorder",
				},
				winopts = {
					height = 0.4,
					width = 0.6,
					border = "rounded",
				},
			},
			diagnostics = {
				prompt = "",
				hls = {
					normal = "FzfLuaTransparentNormal",
					border = "FzfLuaTransparentBorder",
				},
				winopts = {
					split = "belowright new",
					backdrop = 0,
					height = 0.3,
					width = 1,
					preview = {
						hidden = "hidden",
					},
				},
			},
		},
	},
	{
		"rachartier/tiny-inline-diagnostic.nvim",
		event = "VeryLazy",
		priority = 1000,
		opts = {
			preset = "nonerdfont",
		},
	},
	{ "brenoprata10/nvim-highlight-colors", opts = { render = "virtual" } },
	{
		"folke/which-key.nvim",
		event = "VeryLazy",
		opts = {
			preset = "helix",
		},
		keys = {
			{
				"<leader>?",
				function()
					require("which-key").show({ global = false })
				end,
				desc = "Buffer Local Keymaps (which-key)",
			},
		},
	},
	{
		"wurli/visimatch.nvim",
		config = true,
	},
	{
		"jake-stewart/multicursor.nvim",
		branch = "1.0",
		config = function()
			local mc = require("multicursor-nvim")

			mc.setup()

			local set = vim.keymap.set

			-- Add or skip cursor above/below the main cursor.
			set({ "n", "v" }, "<up>", function()
				mc.lineAddCursor(-1)
			end)
			set({ "n", "v" }, "<down>", function()
				mc.lineAddCursor(1)
			end)
			set({ "n", "v" }, "<leader><up>", function()
				mc.lineSkipCursor(-1)
			end)
			set({ "n", "v" }, "<leader><down>", function()
				mc.lineSkipCursor(1)
			end)

			-- Add or skip adding a new cursor by matching word/selection
			set({ "n", "v" }, "<leader>n", function()
				mc.matchAddCursor(1)
			end)
			set({ "n", "v" }, "<leader>s", function()
				mc.matchSkipCursor(1)
			end)
			set({ "n", "v" }, "<leader>N", function()
				mc.matchAddCursor(-1)
			end)
			set({ "n", "v" }, "<leader>S", function()
				mc.matchSkipCursor(-1)
			end)

			-- Add all matches in the document
			set({ "n", "v" }, "<leader>A", mc.matchAllAddCursors)

			-- You can also add cursors with any motion you prefer:
			-- set("n", "<right>", function()
			--     mc.addCursor("w")
			-- end)
			-- set("n", "<leader><right>", function()
			--     mc.skipCursor("w")
			-- end)

			-- Rotate the main cursor.
			set({ "n", "v" }, "<left>", mc.nextCursor)
			set({ "n", "v" }, "<right>", mc.prevCursor)

			-- Delete the main cursor.
			set({ "n", "v" }, "<leader>x", mc.deleteCursor)

			-- Add and remove cursors with control + left click.
			set("n", "<c-leftmouse>", mc.handleMouse)

			-- Easy way to add and remove cursors using the main cursor.
			set({ "n", "v" }, "<c-q>", mc.toggleCursor)

			-- Clone every cursor and disable the originals.
			set({ "n", "v" }, "<leader><c-q>", mc.duplicateCursors)

			set("n", "<esc>", function()
				if not mc.cursorsEnabled() then
					mc.enableCursors()
				elseif mc.hasCursors() then
					mc.clearCursors()
				else
					-- Default <esc> handler.
				end
			end)

			-- bring back cursors if you accidentally clear them
			set("n", "<leader>gv", mc.restoreCursors)

			-- Align cursor columns.
			set("n", "<leader>a", mc.alignCursors)

			-- Split visual selections by regex.
			set("v", "S", mc.splitCursors)

			-- Append/insert for each line of visual selections.
			set("v", "I", mc.insertVisual)
			set("v", "A", mc.appendVisual)

			-- match new cursors within visual selections by regex.
			set("v", "M", mc.matchCursors)

			-- Rotate visual selection contents.
			set("v", "<leader>t", function()
				mc.transposeCursors(1)
			end)
			set("v", "<leader>T", function()
				mc.transposeCursors(-1)
			end)

			-- Jumplist support
			set({ "v", "n" }, "<c-i>", mc.jumpForward)
			set({ "v", "n" }, "<c-o>", mc.jumpBackward)

			-- Customize how cursors look.
			local hl = vim.api.nvim_set_hl
			hl(0, "MultiCursorCursor", { link = "Cursor" })
			hl(0, "MultiCursorVisual", { link = "Visual" })
			hl(0, "MultiCursorSign", { link = "SignColumn" })
			hl(0, "MultiCursorDisabledCursor", { link = "Visual" })
			hl(0, "MultiCursorDisabledVisual", { link = "Visual" })
			hl(0, "MultiCursorDisabledSign", { link = "SignColumn" })
		end,
	},
}
