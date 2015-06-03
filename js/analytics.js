function setup_Analytics(me, afterFunc) {
	var loadingTagName = 'dataLoading';
	
	if (typeof me.infoList_DataSet_Analytics == "undefined"){
		me.infoList_DataSet_Analytics = $("#infoList_Analytics").DataTable({
			"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ],
			"columns": [{"width":"25%"}, null, null, {"width":"20%"}, {"width":"25%"}]});
	}
	
	var requestUrl_AnalyticsSQLView = me.queryURL_analyticsSQLView + $("#sqlViewSettings").val() + "/data";
	var userGrouspNameDict = {};
	
	
	RESTUtil.getAsynchData(requestUrl_AnalyticsSQLView, function(json_Data) {
		console.log(json_Data);
		
		$.each(json_Data.rows, function(i_dashboard, item_dashboard) {
			var requestUrl_analytics = me.queryURL_analytics
			+ item_dashboard[1]
			+ '.json?fields=itemCount,user[name],userGroupAccesses';
			
		
			RESTUtil.getAsynchData(requestUrl_analytics, function(json_Data_details) {
				if (json_Data_details.userGroupAccesses.length > 0){
					var groups = "";
					var queries = 0;
					$.each(json_Data_details.userGroupAccesses, function(i_userGroupAccesses, item_userGroupAccesses) {
						if (item_userGroupAccesses.userGroupUid in userGrouspNameDict){
							groups +=  userGrouspNameDict[item_userGroupAccesses.userGroupUid] + ': ' + item_userGroupAccesses.access + '</br>';
						}	
						else{
							
							var requestUrl_analytics_userGroups = me.queryURL_analytics_userGroups
							+ item_userGroupAccesses.userGroupUid
							+ '.json?fields=name';
							RESTUtil.getAsynchData(requestUrl_analytics_userGroups, function(json_UserGroups_details) {
								userGrouspNameDict[item_userGroupAccesses.userGroupUid] = json_UserGroups_details.name;
								groups +=  userGrouspNameDict[item_userGroupAccesses.userGroupUid] + ': ' + item_userGroupAccesses.access + '</br>';
							},
							function() {
							},
							function() {
								queries++;
							},
							function() {
								queries--;
								addRowToTable(me, item_dashboard, json_Data_details, groups, queries);
							});
						}
						
					});
					
				}
				else{
					addRowToTable(me, item_dashboard, json_Data_details);
				}
				
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

function addRowToTable(me, item_dashboard, json_Data_details, groups, queries){
	if (typeof queries == 'undefined' || queries == 0){
		var creationDate = new Date(item_dashboard[3]);
		var creationDateFormatted = $.format.date(creationDate, "dd-MM-yyyy" );
		
		var lastUpdatedDate = new Date(item_dashboard[4]);
		var lastUpdatedDateFormatted = $.format.date(lastUpdatedDate, "dd-MM-yyyy" );
		
		me.infoList_DataSet_Analytics.row.add([
												  item_dashboard[5],
												  json_Data_details.itemCount,
												  creationDateFormatted + " / " + lastUpdatedDateFormatted,
												  json_Data_details.user.name,
												  typeof groups == 'undefined' ? "" : groups
												]).draw();
	}
	
}