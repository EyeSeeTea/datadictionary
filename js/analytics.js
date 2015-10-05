function setup_Analytics(me, afterFunc) {
	
	if (typeof me.infoList_DataSet_Analytics == "undefined"){
		me.infoList_DataSet_Analytics = $("#infoList_Analytics").DataTable({
			"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ],
			"columns": [{"width":"25%"}, null, null, {"width":"20%"}, {"width":"25%"}],
			"pageLength": 50});
	}

	var requestUrl_AnalyticsEditSQLView = me.queryURL_analyticsSQLView + $("#sqlViewEditSettings").val() + "/data";
	
	RESTUtil.getAsynchData(requestUrl_AnalyticsEditSQLView, function (editSQLView){
		
		var loadingTagName = 'dataLoading';
		var requestUrl_AnalyticsSQLView = me.queryURL_analyticsSQLView + $("#sqlViewSettings").val() + "/data";
		var userGrouspNameDict = {};
		var userId;
		
		RESTUtil.getAsynchData(me.queryURL_me, function(user_data) {
			
			userId = user_data.id;
			
			RESTUtil.getAsynchData(me.queryURL_analytics_ownDashboard, function(json_Data_owner) {
				RESTUtil.getAsynchData(requestUrl_AnalyticsSQLView, function(json_Data) {
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
										groups += userGrouspNameDict[item_userGroupAccesses.userGroupUid];
									}	
									else{
										
										var requestUrl_analytics_userGroups = me.queryURL_analytics_userGroups
										+ item_userGroupAccesses.userGroupUid
										+ '.json?fields=name';
										RESTUtil.getAsynchData(requestUrl_analytics_userGroups, function(json_UserGroups_details) {
											
											// Do not add links if the user belongs to this group
											var belongsToGroup = false;
											$.each(user_data.userGroups, function(i_belongUserGroups, item_belongUserGroups) {
												if (item_userGroupAccesses.userGroupUid == item_belongUserGroups.id){
													belongsToGroup=true;
													return false;
												}
											});
											var joinEditLinks = "";
											if (!belongsToGroup){
												$.each(editSQLView.rows, function(i_editLink, item_editLink) {
													if (item_editLink[2] == json_UserGroups_details.name){
														editLink = dhisPath + "dhis-web-maintenance-user/editUserGroupForm.action?userGroupId=" + item_editLink[0];
														return false;
													}
												});
												joinEditLinks = " <a style='color:#f45e00' href='#' onclick='submitData_URL(this, \"" + apiPath + "userGroups/" + item_userGroupAccesses.userGroupUid + "/users/" + userId + "\")'>join</a> | <a style='color:#f45e00' target='_blank' href='" + editLink +"'>edit</a>";
											}
											
											userGrouspNameDict[item_userGroupAccesses.userGroupUid] = json_UserGroups_details.name + ': ' + item_userGroupAccesses.access 
											+ joinEditLinks
											+ '</br>';
											groups += userGrouspNameDict[item_userGroupAccesses.userGroupUid];
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
	});
	
	afterFunc();
}

function submitData_URL( el, url, successFunc, failFunc )
{		
	$.ajax({
	  type: "POST",
	  url: url,
	  //data: JSON.stringify( jsonData ),
	  contentType: "text/plain; charset=utf-8",
	  success: function( msg ) {
		  $(this).closest('tr').css("background-color", 'whitesmoke');
		  successFunc();
		},
	  error: function( msg ) {
		  failFunc();
		}			   
	});
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

