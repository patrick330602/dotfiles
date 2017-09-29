/*
    GNOME Shell integration for Chrome
    Copyright (C) 2016  Yuri Konotopov <ykonotopov@gnome.org>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
 */

/* global chrome, COMPAT */

COMPAT.PERMISSIONS_CONTAINS		= true;
COMPAT.SYNC_STORAGE				= (!COMPAT.IS_OPERA || false);
COMPAT.NOTIFICATIONS_BUTTONS	= (!COMPAT.IS_OPERA && !COMPAT.IS_FIREFOX || false);

if(COMPAT.IS_FIREFOX)
{
	chrome.runtime.onMessageExternal = {
		addListener: chrome.runtime.onMessage.addListener
	};
}

if(typeof(chrome.permissions) === 'undefined')
{
	chrome.permissions = {
		contains: function(permissions, callback) {
			callback(false);
		}
	};
	COMPAT.PERMISSIONS_CONTAINS = false;
}

if(typeof(chrome.storage.sync) === 'undefined' || COMPAT.IS_FIREFOX)
{
	chrome.storage.sync = chrome.storage.local;
	COMPAT.SYNC_STORAGE = false;
}
