/*
 *  Copyright (c) 2015-2017.
 *
 *  This file is part of Data Dictionary.
 *
 *  Data Dictionary is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Data Dictionary is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Data Dictionary.  If not, see <http://www.gnu.org/licenses/>.
 */

// =========================================================
// DHIS Get/Submit Related

DhisUtils = {};

(function() {
	var saveSettings = function(url, data, method) {
		return RESTUtil.post(url, data, {type: method})
			.then(null, function(xhr) {
				// First try to update the existing settings (PUT), otherwise create them (POST)
				if (method == "PUT" && xhr.status == 404) {
					 return saveSettings(url, data, "POST");
				} else {
					alert("Error saving settings");
				}
			});
	};
	
	/* Public functions */

	DhisUtils.getUserInfo = function(dhisPath) {
		return $.when(
			DhisUtils.getRequestData(RESTUtil.get(dhisPath + "me")),
			DhisUtils.getRequestData(RESTUtil.get(dhisPath + "me/authorities"))
		).then(function(me, meAuth) {
			return $.extend(me, {authorities: meAuth});
		});
	};

	DhisUtils.getRequestData = function(ajaxPromise) {
		return ajaxPromise.then(function(data, statusText, xhr) { return data; });
	};

	DhisUtils.getDataStorePath = function(apiPath, namespace, key) {
		return apiPath + "dataStore/" + namespace + "/" + key;
	};

	DhisUtils.saveSettings = function(apiPath, namespace, key, data) {
		var url = DhisUtils.getDataStorePath(apiPath, namespace, key);
		return saveSettings(url, data, "PUT");
	};

	DhisUtils.loadSettings = function(apiPath, namespace, key, options) {
		var url = DhisUtils.getDataStorePath(apiPath, namespace, key);
		return RESTUtil.get(url, undefined, options);
	};

	DhisUtils.loadSettingsSync = function(apiPath, namespace, key, onsuccess) {
		DhisUtils.getDataStorePath(apiPath, namespace, key);
		 $.ajax(_.defaults(options || {}, {
			type: "GET", url: url, dataType: "json",
			success: onsuccess
		}));
	};
	
  DhisUtils.idWebAppAdmin = function(user) {
	  return _(user.authorities).contains("M_dhis-web-maintenance-appmanager") ||
	         _(user.authorities).contains("ALL");
  };
  
  DhisUtils.getAttributes = function(apiPath, type) {
  	var url = apiPath + "attributes.json";
  	var qs = {paging: false, filter: type + ":eq:true", fields: "id,name"};
  	
		return RESTUtil.get(url, qs)
		  .fail(function(xhr) { 
		    throw 'Attributes retrieval was unsuccessful: ' + xhr.statusText; 
		  })
		  .then(function(data) {
		    return data.attributes;
		  });
  }
})();
