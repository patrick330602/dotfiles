return { { "sbdchd/neoformat" },
    {
        "nvim-treesitter/nvim-treesitter",
        build = ":TSUpdate",
        config = function()
            local configs = require("nvim-treesitter.configs")

            configs.setup({
                ensure_installed = {
                    "bash",
                    "c",
                    "c_sharp",
                    "cpp",
                    "css",
                    "csv",
                    "dockerfile",
                    "git_config",
                    "go",
                    "json",
                    "make",
                    "nim",
                    "powershell",
                    "python",
                    "rust",
                    "toml",
                    "typescript",
                    "xml",
                    "yaml",
                    "lua",
                    "vim",
                    "vimdoc",
                    "javascript",
                    "html",
                },
                sync_install = false,
                highlight = { enable = true },
                indent = { enable = true },
            })
        end,
    },
    {
        "lukas-reineke/indent-blankline.nvim",
        main = "ibl",
        ---@module "ibl"
        ---@type ibl.config
        opts = {},
        config = function()
            require("ibl").setup({})
        end,
    },
}
