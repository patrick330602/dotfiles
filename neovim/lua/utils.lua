local M = {}

M.IsWayland = function()
	local is_linux = vim.fn.has('unix') == 1 and vim.fn.has('mac') == 0

	if not is_linux then
		return false
	end

	local wayland_display = vim.fn.getenv('WAYLAND_DISPLAY')
	local xdg_session_type = vim.fn.getenv('XDG_SESSION_TYPE')

	local is_wayland = (wayland_display ~= vim.NIL and wayland_display ~= '') or
		(xdg_session_type ~= vim.NIL and xdg_session_type:lower() == 'wayland')

	return is_wayland
end

return M
