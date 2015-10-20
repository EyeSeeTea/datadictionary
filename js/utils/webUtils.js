/*
 *  Copyright (c) 2015.
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

function RESTUtil() {
}

RESTUtil.getAsynchData = function(url, actionSuccess, actionError,
		loadingStart, loadingEnd) {
	return $.ajax({
		type : "GET",
		dataType : "json",
		url : url,
		async : true,
		success : actionSuccess,
		error : actionError,
		beforeSend : function(xhr) {
			if (loadingStart !== undefined)
				loadingStart();
		}
	}).always(function(data) {
		if (loadingEnd !== undefined)
			loadingEnd();
	});
}