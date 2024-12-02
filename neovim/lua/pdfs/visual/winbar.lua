local M = {}

M.info = function()
	return " %#WbLocation# " .. require("nvim-navic").get_location() .. " %#None#"
end

-- Enhanced tab click handler
local function tab_click(minwid, clicks, button, mods)
	if button == "l" then
		vim.api.nvim_set_current_tabpage(minwid)
	elseif button == "r" then
		local tab_nr = vim.api.nvim_tabpage_get_number(minwid)
		local choice = vim.fn.confirm("Tab " .. tab_nr .. " operations:", "&Close\n&New\n&Move Left\n&Move Right", 1)

		if choice == 1 then
			vim.cmd("tabclose " .. tab_nr)
		elseif choice == 2 then
			vim.cmd("tabnew")
		elseif choice == 3 then
			vim.cmd("tabmove -1")
		elseif choice == 4 then
			vim.cmd("tabmove +1")
		end
	end
end

local function make_clickable(text, id)
	return "%" .. id .. "@v:lua.tab_click@" .. text .. "%X"
end

M.tabs = function()
	local tabpages = vim.api.nvim_list_tabpages()

	local sections = {}
	local current_tab_nr = vim.fn.tabpagenr()

	table.insert(sections, "%#StTabs#")

	for nr, tab in ipairs(tabpages) do
		local tab_text = " " .. tostring(nr)

		if nr == current_tab_nr then
			table.insert(sections, "%#StTabActive#")
			table.insert(sections, make_clickable(tab_text .. " ", tab))
		else
			table.insert(sections, "%#StTabs#")
			table.insert(sections, make_clickable(tab_text .. " ", tab))
		end
		table.insert(sections, "%#StNothing#")
	end

	return " " .. table.concat(sections, "")
end

vim.opt.winbar = "%{%v:lua.require('pdfs.visual.winbar').generate_winbar()%}"

M.generate_winbar = function()
	local winbar = {
		M.info(),
		"%=",
		M.tabs(),
	}
	return table.concat(winbar)
end

_G.tab_click = tab_click

return M
