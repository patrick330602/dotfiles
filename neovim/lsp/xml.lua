return {
	cmd = { "lemminx" },
	filetypes = { "xml", "xsd", "xsl", "xslt", "svg" },
	root_markers = {
		".git",
	},
	settings = {
		xml = {
			format = {
				splitAttributes = false,
				joinContentLines = false,
				joinCommentLines = false,
				preserveEmptyContent = true,
				preservedNewlines = 0,
			},
		},
	},
	single_file_support = true,
}
