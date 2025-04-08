require("head")
require("after")

vim.lsp.enable({
	"lua",
	"dockerfile",
	"bash",
	"yaml",
	"json",
	"xml",
	"eslint",
	"typescript",
	"python",
	"golang",
})

require("visual")
require("options")
require("keymap")
require("tail")
