local M = {}

M.startsWith = function(str, key)
	return string.sub(str, 1, #key) == key
end

M.findValueByPrefix = function(tbl, prefix)
	-- Handle array-like tables (ipairs)
	if #tbl > 0 then
		for _, value in ipairs(tbl) do
			if M.startsWith(prefix, value) then
				return value
			end
		end
	end

	-- Handle key-value tables (pairs)
	for key, value in pairs(tbl) do
		if type(key) == "string" and M.startsWith(prefix, key) then
			return value
		end
	end

	return nil
end

return M
