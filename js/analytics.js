function setup_Analytics(me, afterFunc) {
	var loadingTagName = 'dataLoading';
	
	if (typeof me.infoList_DataSet_Analytics == "undefined"){
		me.infoList_DataSet_Analytics = $("#infoList_Analytics").DataTable({
			"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ],
			"columns": [{"width":"25%"}, null, null, {"width":"20%"}, {"width":"25%"}],
			"pageLength": 50});
	}
	
	var requestUrl_AnalyticsSQLView = me.queryURL_analyticsSQLView + $("#sqlViewSettings").val() + "/data";
	var userGrouspNameDict = {};
	var userId;
	
	RESTUtil.getAsynchData(me.queryURL_me, function(user_data) {
		
		userId = user_data.id;
		
		RESTUtil.getAsynchData(me.queryURL_analytics_ownDashboard, function(json_Data_owner) {
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
									groups +=  userGrouspNameDict[item_userGroupAccesses.userGroupUid] + ': ' + item_userGroupAccesses.access 
									+ " <a style='color:#f45e00' href='" + apiPath + "userGroups/" + item_userGroupAccesses.userGroupUid + "/users/" + userId + "'>join</a> | <a style='color:#f45e00' target='_blank' href='" + dhisPath + "dhis-web-maintenance-user/editUserGroupForm.action?userGroupId=" + item_userGroupAccesses.userGroupUid +"'>edit</a>"
									+ '</br>';
								}	
								else{
									
									var requestUrl_analytics_userGroups = me.queryURL_analytics_userGroups
									+ item_userGroupAccesses.userGroupUid
									+ '.json?fields=name';
									RESTUtil.getAsynchData(requestUrl_analytics_userGroups, function(json_UserGroups_details) {
										userGrouspNameDict[item_userGroupAccesses.userGroupUid] = json_UserGroups_details.name;
										groups +=  userGrouspNameDict[item_userGroupAccesses.userGroupUid] + ': ' + item_userGroupAccesses.access
										+ " <a style='color:#f45e00' href='" + apiPath + "userGroups/" + item_userGroupAccesses.userGroupUid + "/users/" + userId + "'>join</a> | <a style='color:#f45e00' target='_blank' href='" + dhisPath + "dhis-web-maintenance-user/editUserGroupForm.action?userGroupId=" + item_userGroupAccesses.userGroupUid +"'>edit</a>"
										+ '</br>';
									},
									function() {
									},
									function() {
										queries++;
									},
									function() {
										queries--;
										addRowToTable(me, json_Data_owner, item_dashboard, json_Data_details, groups, queries);
									});
								}
								
							});
							
						}
						else{
							addRowToTable(me, json_Data_owner, item_dashboard, json_Data_details);
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
			
		});
	});
	
	afterFunc();
}

function addRowToTable(me, json_Data_owner, item_dashboard, json_Data_details, groups, queries){
	if (typeof queries == 'undefined' || queries == 0){
		
		var creationDate = new Date(item_dashboard[3]);
		var creationDateFormatted = $.format.date(creationDate, "dd-MM-yyyy" );
		
		var lastUpdatedDate = new Date(item_dashboard[4]);
		var lastUpdatedDateFormatted = $.format.date(lastUpdatedDate, "dd-MM-yyyy" );
		
		var rowNode = me.infoList_DataSet_Analytics.row.add([
												  item_dashboard[5],
												  json_Data_details.itemCount,
												  creationDateFormatted + " / " + lastUpdatedDateFormatted,
												  json_Data_details.user.name,
												  typeof groups == 'undefined' ? "" : groups
												]).draw().node();
		
		//Highlight if the user belongs/owns the dashboard
		$.each(json_Data_owner.dashboards, function(i_dash, item_dash) {
			if (item_dash.id == item_dashboard[1]){
				$(rowNode).css("background-color", 'whitesmoke');
			}
		});
		
	}
	
}