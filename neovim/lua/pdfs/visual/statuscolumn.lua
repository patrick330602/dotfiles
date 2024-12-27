---@class StatusColumn
---@overload fun(): string
local M = setmetatable({}, {
	__call = function(t)
		return t.get()
	end,
})

-- Configuration
local config = {
	left = { "mark", "sign" }, -- priority of signs on the left (high to low)
	right = { "fold", "git" }, -- priority of signs on the right (high to low)
}

-- Numbers in Neovim handling
local LINE_NR = "%=%{%(&number || &relativenumber) && v:virtnum == 0 ? ("
	.. (vim.fn.has("nvim-0.11") == 1 and '"%l"' or 'v:relnum == 0 ? (&number ? "%l" : "%r") : (&relativenumber ? "%r" : "%l")')
	.. ') : ""%} '

-- Cache tables
local sign_cache = {}
local cache = {}
local icon_cache = {}
local did_setup = false

---@private
function M.setup()
	if did_setup then
		return
	end
	did_setup = true
	local timer = assert((vim.uv or vim.loop).new_timer())
	timer:start(50, 50, function()
		sign_cache = {}
		cache = {}
	end)
end

---@private
---@param name string
function M.is_git_sign(name)
	if name:find("GitSign") then
		return true
	end
end

---@private
---@param buf number
function M.buf_signs(buf)
	local signs = {}

	-- Get extmark signs
	local extmarks = vim.api.nvim_buf_get_extmarks(buf, -1, 0, -1, { details = true, type = "sign" })
	for _, extmark in pairs(extmarks) do
		local lnum = extmark[2] + 1
		signs[lnum] = signs[lnum] or {}
		local name = extmark[4].sign_hl_group or extmark[4].sign_name or ""
		table.insert(signs[lnum], {
			name = name,
			type = M.is_git_sign(name) and "git" or "sign",
			text = extmark[4].sign_text,
			texthl = extmark[4].sign_hl_group,
			priority = extmark[4].priority,
		})
	end

	-- Add marks
	local marks = vim.fn.getmarklist(buf)
	vim.list_extend(marks, vim.fn.getmarklist())
	for _, mark in ipairs(marks) do
		if mark.pos[1] == buf and mark.mark:match("[a-zA-Z]") then
			local lnum = mark.pos[2]
			signs[lnum] = signs[lnum] or {}
			table.insert(signs[lnum], { text = mark.mark:sub(2), texthl = "DiagnosticHint", type = "mark" })
		end
	end

	return signs
end

---@private
---@param win number
---@param buf number
---@param lnum number
function M.line_signs(win, buf, lnum)
	local buf_signs = sign_cache[buf]
	if not buf_signs then
		buf_signs = M.buf_signs(buf)
		sign_cache[buf] = buf_signs
	end
	local signs = buf_signs[lnum] or {}

	-- Get fold signs
	vim.api.nvim_win_call(win, function()
		if vim.fn.foldclosed(lnum) >= 0 then
			signs[#signs + 1] = { text = "", texthl = "Folded", type = "fold" }
		elseif tostring(vim.treesitter.foldexpr(vim.v.lnum)):sub(1, 1) == ">" then
			signs[#signs + 1] = { text = "", type = "fold" }
		end
	end)

	table.sort(signs, function(a, b)
		return (a.priority or 0) > (b.priority or 0)
	end)
	return signs
end

---@private
function M.icon(sign)
	if not sign then
		return "  "
	end
	local key = (sign.text or "") .. (sign.texthl or "")
	if icon_cache[key] then
		return icon_cache[key]
	end
	local text = vim.fn.strcharpart(sign.text or "", 0, 2)
	text = text .. string.rep(" ", 2 - vim.fn.strchars(text))
	icon_cache[key] = sign.texthl and ("%#" .. sign.texthl .. "#" .. text .. "%*") or text
	return icon_cache[key]
end

function M.get()
	local win = vim.g.statusline_winid
	local buf = vim.api.nvim_win_get_buf(win)
	local key = ("%d:%d:%d:%d"):format(win, buf, vim.v.lnum, vim.v.virtnum and 1 or 0)
	if cache[key] then
		return cache[key]
	end

	if not did_setup then
		M.setup()
	end

	local show_signs = vim.v.virtnum == 0 and vim.wo[win].signcolumn ~= "no"
	local components = { "", LINE_NR, "" }

	if show_signs then
		local buf = vim.api.nvim_win_get_buf(win)
		local is_file = vim.bo[buf].buftype == ""
		local signs = M.line_signs(win, buf, vim.v.lnum)

		if #signs > 0 then
			local signs_by_type = {}
			for _, s in ipairs(signs) do
				signs_by_type[s.type] = signs_by_type[s.type] or s
			end

			local function find(types)
				for _, t in ipairs(types) do
					if signs_by_type[t] then
						return signs_by_type[t]
					end
				end
			end

			local left = find(config.left)
			local right = find(config.right)

			local git = signs_by_type.git
			if git and left and left.type == "fold" then
				left.texthl = git.texthl
			end
			if git and right and right.type == "fold" then
				right.texthl = git.texthl
			end

			components[1] = left and M.icon(left) or "  "
			components[3] = is_file and (right and M.icon(right) or "  ") or ""
		else
			components[1] = "  "
			components[3] = is_file and "  " or ""
		end
	end

	local result = table.concat(components, "")
	cache[key] = result
	return result
end

return M
