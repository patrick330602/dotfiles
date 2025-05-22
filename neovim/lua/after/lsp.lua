local cmp = require("blink.cmp")

require("fidget").setup({
	notification = {
		window = {
			winblend = 0,
		},
	},
})


local symbols = { Error = "󰅙", Info = "󰋼", Hint = "󰌵", Warn = "" }

for name, icon in pairs(symbols) do
	local hl = "DiagnosticSign" .. name
	vim.fn.sign_define(hl, { text = icon, numhl = hl, texthl = hl })
end

-- I like hint inlay
vim.lsp.inlay_hint.enable()

vim.lsp.config('jsonls', {
	settings = {
		json = {
			schemas = require("schemastore").json.schemas(),
			validate = { enable = true },
		},
	},
})

vim.lsp.config('yamlls', {
	settings = {
		redhat = { telemetry = { enabled = false } },
		yaml = {
			schemaStore = {
				enable = false,
				url = "",
			},
			schemas = require("schemastore").yaml.schemas(),
		},
	},

})

vim.lsp.config('lemminx', {
	settings = {
		xml = {
			format = {
				emptyElements = "collapse",
			},
		},
	},
})



-- Rust is handled separately by rustaceanvim
vim.g.rustaceanvim = {
	server = {
		settings = {
			["rust-analyzer"] = {
				diagnostics = {
					styleLints = {
						enable = true,
					},
				},
			},
		},
	},
}

cmp.setup({
	keymap = {
		preset = "super-tab",
	},
	appearance = {
		nerd_font_variant = "mono",
	},
	cmdline = {
		enabled = false,
	},
	completion = {
		accept = {
			auto_brackets = {
				enabled = true,
			},
		},
		documentation = {
			auto_show = false,
		},
		menu = {
			draw = {
				columns = { { "label", "label_description", gap = 1 }, { "kind_icon", "kind" } },
				components = {
					kind_icon = {
						text = function(ctx)
							local icon = ctx.kind_icon
							if vim.tbl_contains({ "Path" }, ctx.source_name) then
								local dev_icon, _ = require("nvim-web-devicons").get_icon(ctx.label)
								if dev_icon then
									icon = dev_icon
								end
							else
								icon = require("lspkind").symbolic(ctx.kind, {
									mode = "symbol",
								})
							end

							return icon .. ctx.icon_gap
						end,

						highlight = function(ctx)
							local hl = ctx.kind_hl
							if vim.tbl_contains({ "Path" }, ctx.source_name) then
								local dev_icon, dev_hl = require("nvim-web-devicons").get_icon(ctx.label)
								if dev_icon then
									hl = dev_hl
								end
							end
							return hl
						end,
					},
				},
			},
		},
	},

	sources = {
		default = { "lazydev", "lsp", "path", "snippets", "buffer", "html-css" },
		providers = {
			lazydev = {
				name = "LazyDev",
				module = "lazydev.integrations.blink",
				score_offset = 100,
			},
			["html-css"] = {
				name = "html-css",
				module = "blink.compat.source"
			}
		},
	},

	fuzzy = { implementation = "prefer_rust_with_warning" },
})
