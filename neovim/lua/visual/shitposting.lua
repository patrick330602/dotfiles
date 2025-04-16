local M = {}

function M.tiktok()
	local width = 60
	local height = 11
	local row = math.floor((vim.o.lines - height) / 2)
	local col = math.floor((vim.o.columns - width) / 2)

	local buf = vim.api.nvim_create_buf(false, true)

	local title = "Sorry, Neovim isn’t available right now."
	local padding = math.floor((width - #title - 2) / 2)
	local title_line = string.rep(" ", padding) .. title .. string.rep(" ", width - #title - padding)

	local message = {
		title_line,
		"",
		"A law banning Neovim has been enacted in the U.S.",
		"Unfortunately, that means you can’t use Neovim for now.",
		"",
		"We are fortunate that you can just go get a life and",
		" stop configuring neovim and go touch grass lol. ",
		"Or you can just use vim.",
		"",
		string.rep("─", width),
		"[Learn More]" .. string.rep(" ", width - 11 - 12) .. "[Close App]",
	}

	vim.api.nvim_buf_set_lines(buf, 0, -1, false, message)

	-- Window options
	local opts = {
		style = "minimal",
		relative = "editor",
		width = width,
		height = height,
		row = row,
		col = col,
		border = "rounded",
	}

	local win = vim.api.nvim_open_win(buf, true, opts)

	vim.wo[win].winhl = "Normal:PopupNormal"
	vim.wo[win].winbar = ""

	vim.keymap.set("n", "<CR>", function()
		vim.api.nvim_win_close(win, true)
	end, { buffer = buf })

	vim.keymap.set("n", "q", function()
		vim.api.nvim_win_close(win, true)
	end, { buffer = buf })

	vim.bo[buf].modifiable = false
	vim.bo[buf].buftype = "nofile"

	local ns_id = vim.api.nvim_create_namespace("popup")
	for i = 0, #message - 1 do
		if i == 0 then
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Title", i, 0, -1)
		elseif i == #message - 1 then
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Special", i, 0, 12)
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Special", i, width - 11, width)
		elseif i == #message - 3 then
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Comment", i, 0, -1)
		else
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Comment", i, 0, -1)
		end
	end
end

function M.ass()
	local width = 60
	local height = 6
	local row = math.floor((vim.o.lines - height) / 2)
	local col = math.floor((vim.o.columns - width) / 2)

	local buf = vim.api.nvim_create_buf(false, true)

	local title = "Neovim"
	local padding = math.floor((width - #title - 2) / 2)
	local title_line = string.rep(" ", padding) .. title .. string.rep(" ", width - #title - padding)

	local button = "OK: <CR>"
	local button_padding = math.floor((width - #button - 2) / 2)
	local button_line = string.rep(" ", button_padding) .. button

	local separate_line = string.rep("─", width)


	-- Initial message with "Analyzing code..." text
	local message = {
		title_line,
		"",
		"Analyzing code...",
		"",
		"",
		""
	}

	vim.api.nvim_buf_set_lines(buf, 0, -1, false, message)

	-- Window options
	local opts = {
		style = "minimal",
		relative = "editor",
		width = width,
		height = height,
		row = row,
		col = col,
		border = "rounded",
	}

	local win = vim.api.nvim_open_win(buf, true, opts)

	vim.wo[win].winhl = "Normal:PopupNormal"
	vim.wo[win].winbar = ""

	-- Simulate code analysis with a progress indicator
	local analysis_steps = {
		"Analyzing code... ⣾",
		"Analyzing code... ⣽",
		"Analyzing code... ⣻",
		"Analyzing code... ⢿",
		"Analyzing code... ⡿",
		"Analyzing code... ⣟",
		"Analyzing code... ⣯",
		"Analyzing code... ⣷",
	}

	local timer = vim.loop.new_timer()
	local step = 1
	local timestep = 1

	timer:start(0, 200, vim.schedule_wrap(function()
		if not vim.api.nvim_win_is_valid(win) then
			timer:stop()
			return
		end

		vim.bo[buf].modifiable = true
		vim.api.nvim_buf_set_lines(buf, 2, 3, false, { analysis_steps[step] })
		vim.bo[buf].modifiable = false

		step = step % #analysis_steps + 1
		timestep = timestep + 1

		-- After a few iterations, show the final message
		if timestep == 20 then
			timer:stop()
			vim.bo[buf].modifiable = true
			vim.api.nvim_buf_set_lines(buf, 2, 6, false, {
				"Your code is ass. Session Terminated.",
				"",
				separate_line,
				button_line
			})
			vim.bo[buf].modifiable = false

			-- Update highlights
			local ns_id = vim.api.nvim_create_namespace("popup")
			vim.api.nvim_buf_clear_namespace(buf, ns_id, 0, -1)

			for i = 0, height - 1 do
				if i == 0 then
					vim.api.nvim_buf_add_highlight(buf, ns_id, "Title", i, 0, -1)
				elseif i == height - 1 then
					vim.api.nvim_buf_add_highlight(buf, ns_id, "Special", i, 0, -1)
				elseif i == 2 then
					vim.api.nvim_buf_add_highlight(buf, ns_id, "String", i, 0, -1)
				elseif i == 5 then
					vim.api.nvim_buf_add_highlight(buf, ns_id, "Comment", i, 0, -1)
				else
					vim.api.nvim_buf_add_highlight(buf, ns_id, "Comment", i, 0, -1)
				end
			end
		end
	end))

	-- Modified OK button to quit Neovim
	vim.keymap.set("n", "<CR>", function()
		vim.api.nvim_win_close(win, true)
		vim.cmd("qa!") -- Force quit Neovim
	end, { buffer = buf })

	vim.bo[buf].modifiable = false
	vim.bo[buf].buftype = "nofile"

	-- Initial highlights
	local ns_id = vim.api.nvim_create_namespace("popup")
	for i = 0, #message - 1 do
		if i == 0 then
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Title", i, 0, -1)
		elseif i == #message - 1 then
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Special", i, 0, -1)
		elseif i == 2 then
			vim.api.nvim_buf_add_highlight(buf, ns_id, "String", i, 0, -1)
		else
			vim.api.nvim_buf_add_highlight(buf, ns_id, "Comment", i, 0, -1)
		end
	end
end

return M
