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
function setup_Analytics(me, afterFunc) {
	
	if (typeof me.infoList_DataSet_Analytics == "undefined"){
		me.infoList_DataSet_Analytics = $("#infoList_Analytics").DataTable({
			"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ],
			"columns": [{"width":"25%"}, null, null, {"width":"20%"}, {"width":"25%"}],
			"pageLength": 50});
	}

	var requestUrl_AnalyticsEditSQLView = me.queryURL_analyticsSQLView +
		$("#sqlViewEditSettings").val() + "/data?paging=false";
	
	RESTUtil.getAsynchData(requestUrl_AnalyticsEditSQLView, function (editSQLView){
		
		var loadingTagName = 'dataLoading';
		var requestUrl_AnalyticsSQLView = me.queryURL_analyticsSQLView +
			$("#sqlViewSettings").val() + "/data?paging=false";
		var userGrouspNameDict = {};
		var userId;
		
		RESTUtil.getAsynchData(me.queryURL_me, function(user_data) {
			
			userId = user_data.id;
			
			RESTUtil.getAsynchData(me.queryURL_analytics_ownDashboard, function(json_Data_owner) {
				RESTUtil.getAsynchData(requestUrl_AnalyticsSQLView, function(json_Data) {
					$.each(getRows(json_Data), function(i_dashboard, item_dashboard) {
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
												$.each(getRows(editSQLView), function(i_editLink, item_editLink) {
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
											console.error('Failed to load analytics: ' + requestUrl_analytics_userGroups);
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
					console.error('Failed to load analytics: ' + requestUrl_AnalyticsSQLView);
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

function getRows(data) {
    if (data && data.rows) {
        return data.rows;
    } else if (data && data.listGrid && data.listGrid.rows) {
        return data.listGrid.rows;
    } else {
        throw new Error("Cannot get rows from data");
    }
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
		  if (successFunc) successFunc();
		},
	  error: function( msg ) {
		  if (failFunc) failFunc();
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

