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