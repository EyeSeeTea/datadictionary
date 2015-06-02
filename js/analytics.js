function setup_Analytics(me, afterFunc) {
	var loadingTagName = 'dataLoading';
	
	me.infoList_DataSet_DataTable = $("#infoList_Analytics").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});
	
	RESTUtil.getAsynchData(me.queryURL_analyticsSQLView, function(json_Data) {
		$.each(json_Data.rows, function(i_dashboard, item_dashboard) {
			console.log(item_dashboard);
			
			var requestUrl_analytics = me.queryURL_analytics
			+ item_dashboard[1]
			+ '.json?fields=itemCount,user[name],userGroupAccesses';

			var creationDate = new Date(item_dashboard[3]);
			var creationDateFormatted = $.format.date(creationDate, "dd-MM-yyyy" );
			
			var lastUpdatedDate = new Date(item_dashboard[4]);
			var lastUpdatedDateFormatted = $.format.date(lastUpdatedDate, "dd-MM-yyyy" );
			
		
			RESTUtil.getAsynchData(requestUrl_analytics, function(json_Data_details) {
				var groups = "";
				$.each(json_Data_details.userGroupAccesses, function(i_userGroupAccesses, item_userGroupAccesses) {
					groups +=  item_userGroupAccesses.userGroupUid + ': ' + item_userGroupAccesses.access + '</br>';
				});
				
				me.infoList_DataSet_DataTable.row.add([
														  item_dashboard[5],
														  json_Data_details.itemCount,
														  creationDateFormatted + " / " + lastUpdatedDateFormatted,
														  json_Data_details.user.name,
														  groups
														]).draw();
			});

		})
		
	}, function() {
		alert('Failed to load analytics.');
	}, function() {
		QuickLoading.dialogShowAdd(loadingTagName);
	}, function() {
		QuickLoading.dialogShowRemove(loadingTagName);
	});
	
	afterFunc();
}