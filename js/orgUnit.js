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

// ---------------------------------------
// -- 'Search by Country' related

var orgUnitStructure = {};

function populateCountryList(me, loadingTagName, afterFunc) {
	var listTag = me.countryListTag;
	listTag.empty();

	var queryURL_getCountries = apiPath + "organisationUnits.json?paging=no&level=" + me.orgUnitList.val();
	
	RESTUtil.getAsynchData(queryURL_getCountries, function(json_Data) {
		var json_DataOrdered = Util.sortByKey(json_Data.organisationUnits,
				"displayName");

		Util.populateSelect(listTag, me.orgUnitList.find("option:selected").text(), json_DataOrdered);

		afterFunc();
	}, function() {
		alert('Failed to load country list.');
	}, function() {
		QuickLoading.dialogShowAdd(loadingTagName);
	}, function() {
		QuickLoading.dialogShowRemove(loadingTagName);
	});

}

function setup_SearchByOrgUnit(me) {
	
	me.orgUnitTabMode.buttonset();
	
	me.orgUnitTabMode.find(":radio").click(function(e){
		var contentContainer = $(this).closest(".content");
		if ($(this).val() == 'tableContent'){
			contentContainer.find('.tableContent').show();
			contentContainer.find('.graphContent').hide();
		}
		else{
			contentContainer.find('.graphContent').show();
			contentContainer.find('.tableContent').hide();
		}
	});
	
	me.orgUnitGraphSelector.click(function(e){
		calculateMaxNumber(orgUnitStructure, $(this).val())
		update();
	});
	
	me.orgUnitScaleSelector.click(function(e){
		update();
	});
	
	me.infoList_DataSet_DataTable = $("#infoList_DataSet").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ], "pageLength": 50});
	me.infoList_Event_DataTable = $("#infoList_Event").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ], "pageLength": 50});
	me.infoList_Tracker_DataTable = $("#infoList_Tracker").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ], "pageLength": 50});
	me.infoList_OrgUnitGroup_DataTable = $("#infoList_OrgUnitGroup").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ], "pageLength": 50});
	me.infoList_User_DataTable = $("#infoList_User").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ], "pageLength": 50});

	// Set up the events
	me.countryListTag.change(function() {
		$(".subContent").hide(); 
		
		($(this).val() != "") ? Util.disableTag(me.retrieveData_CountryTag,
				false) : Util.disableTag(me.retrieveData_CountryTag, true);
	});

	me.retrieveData_CountryTag.click(function() {
				$("#tableMode").click();
		
				var requestCount = 0;

				var loadingTagName = 'dataLoading';

				// Reset the timer
				me.countDownTag.countdown('destroy');
				$('#defaultCountdownSpan').text('Time Elapsed: ');

				me.countDownTag.countdown({
					since : 0,
					compact : true,
					format : 'MS'
				});

				//Clear tables 
				me.infoList_DataSet_DataTable.clear().draw();
				me.infoList_Event_DataTable.clear().draw();
				me.infoList_Tracker_DataTable.clear().draw();
				me.infoList_OrgUnitGroup_DataTable.clear().draw();
				me.infoList_User_DataTable.clear().draw()
				
				//Summary Variables
				me.summary = {numberOfDatasets: 0, numberOfEvents: 0, numberOfTrackers: 0, orgUnitGroups: new Array(), users: 0, dataValues: 0, eventInstances: 0, trackerInstances: 0};

				var requestUrl_OrgUnits = apiPath + 'organisationUnits/' + me.countryListTag.val() + '.json?includeDescendants=true&fields=id,organisationUnitGroups[id],users[id,name]';

				orgUnitStructure = {"id": "root", "name":me.countryListTag.find(":selected").text(), "_children" : [], "type" : "Organization Unit"};
				orgUnitDataElements = [];
				usersUniqueList = [];
				dataElementsUniqueList = [];
				
				RESTUtil.getAsynchData(
								requestUrl_OrgUnits,
								function(countryOrgUnitList) {
									var requestUrl_dataSetLists = apiPath + 'dataSets.json?paging=no&fields=id,name';

									// For preventing the ahead finish..
									QuickLoading.dialogShowAdd(loadingTagName);
//										requestCount++;

									// alert( 'get all dataset ids.' );
									RESTUtil.getAsynchData(requestUrl_dataSetLists,	
											function(json_dsList) {
												var json_dsList_Sorted = Util.sortByKey(json_dsList.dataSets,"name");
												// for each dataset
												$.each(json_dsList_Sorted,
														function(i_ds,item_ds) {
															var requestUrl_dataSetDetail = apiPath + 'dataSets/'
																	+ item_ds.id
																	+ '.json?fields=id,shortName,name,description,dataSetType,dataSetElements[dataElement[id,name,valueType,aggregationType,lastUpdated]],organisationUnits[id,level]';

															RESTUtil.getAsynchData(requestUrl_dataSetDetail,
																	function(json_dataSet) {
																			// requestCount++;

																			var foundCount = 0;
																			var foundOrgUnits = {};
																			var dataElements = DataHelpers.getDataElements(json_dataSet);

																			$.each(json_dataSet.organisationUnits,
																					function(i_dsOU, item_dsOU) {
																				
																						var found = false;

																						$.each(countryOrgUnitList.organisationUnits,
																								function(i_countryOU, item_countryOU) {
																							
																									if (item_countryOU.id == item_dsOU.id) {
																										
																										//Update org unit by level for this dataset
																										if (item_dsOU.level in foundOrgUnits){
																											foundOrgUnits[item_dsOU.level] = foundOrgUnits[item_dsOU.level] + 1;
																										}
																										else{
																											foundOrgUnits[item_dsOU.level] = 1;
																										}
																										
																										found = true;
																										return false;
																									}
																								});

																						if (found) {
																							foundCount++;
																							// return
																							// false;
																						}
																					});

																					if (foundCount > 0) {
																						
																						//----------------------------
																						// Preparing data for graph mode
																						
																						//FIXME: We can use a js lib (underscore) to deal with this in a better way
																						// Transform data element ids in a array of ids
																						var dataElementsIds = [];
																						
																						$.each(dataElements, function(i_dataElement, item_dataElement) {
																							if (item_dataElement.valueType != "DATE"){
																								dataElementsIds.push(item_dataElement.id);
																								if (orgUnitDataElements.indexOf(item_dataElement.id) == -1){
																									orgUnitDataElements.push(item_dataElement.id);
																								}
																							}
																						});
																						
																						//Getting data values
																						var datasetsAnalyticsUrl = apiPath + 'analytics.json?dimension=dx:' + dataElementsIds.join(";") + '&filter=ou:' + me.countryListTag.val() + '&filter=pe:LAST_12_MONTHS&aggregationType=COUNT&displayProperty=SHORTNAME';
																						var datasetDataValues = 0;
																						RESTUtil.getAsynchData(datasetsAnalyticsUrl, function(datasetsAnalyticsList) {
																							$.each(datasetsAnalyticsList.rows, function(i_row, item_row) {
																								var currentDataElementDataValues = parseInt(item_row[1]);
																								
																								//FIXME: We need to check why it is not a number
																								if (!isNaN(currentDataElementDataValues)){
																									$.each(dataElements, function(i_de, item_de) {
																										if (item_de.id == item_row[0]){
																											// Add number of data values to data element
																											item_de["numberDataValues"] = currentDataElementDataValues;
																											
																											// Getting category elements
																											item_de["_children"]=[];
																											var categoryElementsUrl = apiPath + 'analytics.json?dimension=co&dimension=dx:' + item_row[0] + '&filter=ou:' + me.countryListTag.val() + '&filter=pe:LAST_12_MONTHS&aggregationType=COUNT&displayProperty=SHORTNAME';
																											RESTUtil.getAsynchData(categoryElementsUrl, function(categoryElementsList) {
																												$.each(categoryElementsList.rows, function(i_ce, item_ce) {
																													item_de["_children"].push({"id": item_ce[1], "shortName":categoryElementsList.metaData.names[item_ce[1]], "numberDataValues":item_ce[2]});
																												});
																											});
																										}
																									});
																								
																									// Add data values for this data element
																									datasetDataValues += currentDataElementDataValues

																									//Just add to the organisation unit the unique data values
																									if (dataElementsUniqueList.indexOf(item_row[0]) == -1){
																										dataElementsUniqueList.push(item_row[0]);
																										me.summary.dataValues += currentDataElementDataValues;
																									}
																								}
																							});
																							orgUnitStructure._children.push({"id": json_dataSet.id, "shortName":json_dataSet.shortName, "name":json_dataSet.name, "_children":dataElements, "type": "Dataset", "numberDataElements": dataElements.length, "numberDataValues":datasetDataValues});
																						});
																						
																						// Preparing data for graph mode
																						//----------------------------

																						//Getting Completed information
																						var currentDatasetTime = -1;
																						var currentDatasetPercentage = -1;
																						//var tooltip = "";
																						var tooltip = {};
																						var completedAnalyticsUrl = apiPath + 'analytics.json?dimension=dx:' + json_dataSet.id + '&filter=ou:' + me.countryListTag.val() + '&dimension=pe:LAST_12_MONTHS&displayProperty=SHORTNAME';
																						RESTUtil.getAsynchData(completedAnalyticsUrl, function(completedAnalyticsList) {
																							$.each(completedAnalyticsList.rows, function(i_row, item_row) {
																								//tooltip += item_row[1].substring(4,6) + "-" + item_row[1].substring(0,4) + " => " + item_row[2] + "%\n";
																								tooltip[item_row[1]] = item_row[2];
																								if (item_row[1] > currentDatasetTime){
																									currentDatasetTime = item_row[1];
																									currentDatasetPercentage = item_row[2];
																								}
																							});
																							
																						},
																						function() {
																						},
																						function() {
																						},
																						function() {
																							me.summary.numberOfDatasets++;
																							
																							var organizationUnitByLevel = "";
																							for (var level in foundOrgUnits){
																								organizationUnitByLevel += "L" + level + ": " + foundOrgUnits[level] + "</br>";
																							}
																							
																							var isCustomDataset = (json_dataSet.dataSetType == 'custom')?'Y':'N';
																							
																							var datasetCompleted = "No information during the last 12 months";
																							if (currentDatasetPercentage != -1 && currentDatasetTime != -1){
																								var currentDatasetTimeDateFormatted = currentDatasetTime.substring(4,6) + "-" + currentDatasetTime.substring(0,4);
																								datasetCompleted = currentDatasetTimeDateFormatted + " => " + currentDatasetPercentage + "%";
																							}
																							
																							//Formatted tooltip
																							var tooltipKeys = Object.keys(tooltip);
																							tooltipKeys.sort();
																							var formattedTooltip = "";
																							jQuery.each(tooltipKeys, function(i, key){
																								formattedTooltip += key.substring(4,6) + "-" + key.substring(0,4) + " => " + tooltip[key] + "%\n";
																						    });
																							
																							me.infoList_DataSet_DataTable.row.add([
																							  '<a href="" class="dataSetLink" dsid="'+ json_dataSet.id + '">' + '<b>' + json_dataSet.name + '</b></br>' + Util.getNotEmpty(json_dataSet.description) + '</a>',
																							  organizationUnitByLevel,
																							  dataElements.length,
																							  isCustomDataset,
																							  '<span title="' + formattedTooltip + '">' + datasetCompleted + "</span>"
																							]).draw();

																							// Add event to this row.
																							setDataSetLinkAction(me);
																						});
																						
																						
																						

																					}

																				},
																				function() {
																				},
																				function() {
																					requestCount++;
																					QuickLoading.dialogShowAdd(loadingTagName);
																				},
																				function() {
																					QuickLoading.dialogShowRemove(loadingTagName);
																					requestCount--;
																					checkRequestCount(me, requestCount);
																				});

																		});

													},
													function() {
													},
													function() {
														QuickLoading.dialogShowAdd(loadingTagName);
													},
													function() {
														QuickLoading.dialogShowRemove(loadingTagName);
													});
									

									// Requesting Org Unit Groups and USER
									$.each(countryOrgUnitList.organisationUnits,
											function(i_countryOU, item_countryOU) {
										
										//Create user table
										$.each(item_countryOU.users,
												function(i_countryOUG,item_countryUsers) {
											//Check if name has not been added yet
											if (usersUniqueList.indexOf(item_countryUsers.name) == -1){
												me.infoList_User_DataTable.row.add([item_countryUsers.name]).draw();
												usersUniqueList.push(item_countryUsers.name);
											}
										});

										//Create OUG table
										$.each(item_countryOU.organisationUnitGroups,
												function(i_countryOUG,item_countryOUG) {
										
											if(me.summary.orgUnitGroups.indexOf(item_countryOUG.id) == -1){
												//Update organization unit groups summary
												me.summary.orgUnitGroups.push(item_countryOUG.id);
												
											
												var requestUrl_orgUnitGroupsLists = apiPath + 'organisationUnitGroups/' + item_countryOUG.id + '.json?fields=id,name,lastUpdated,organisationUnitGroupSet[id],organisationUnits';
												RESTUtil.getAsynchData(requestUrl_orgUnitGroupsLists,	
													function(json_ougList) {
														var belongsToGroupSet = (json_ougList.organisationUnitGroupSet == undefined)?'N':'Y';
													
														var lastUpdatedDate = new Date(json_ougList.lastUpdated);
														var lastUpdatedDateFormatted = $.format.date(lastUpdatedDate, "dd-MM-yyyy" );
														
														me.infoList_OrgUnitGroup_DataTable.row.add([
																								  '<b>' + json_ougList.name + '</b></br>'  + Util.getNotEmpty(json_ougList.description),
																								  json_ougList.organisationUnits.length,
																								  belongsToGroupSet,
																								  lastUpdatedDateFormatted
																								]).draw();
														
													},
													function() {
													},
													function() {
														requestCount++;
														QuickLoading.dialogShowAdd(loadingTagName);
													},
													function() {
														QuickLoading.dialogShowRemove(loadingTagName);
														requestCount--;
														checkRequestCount(me, requestCount);
													});
											}	
										});
									});
									

									console.log('Getting programs...');

									// Retrieve Program List
									var requestUrl_programList = apiPath + 'programs.json?paging=no&fields=id,name,programType,description,organisationUnits[id,level],programStages[id,name,dataEntryType,programStageDataElements]';

									RESTUtil.getAsynchData(requestUrl_programList, function(programList) {
														// requestCount++;

														$.each(programList.programs,
																function(i_program, item_program) {
																	var found = 0;
																	var foundOrgUnits = {};

																	$.each(item_program.organisationUnits,
																			function(
																					i_programOU,
																					item_programOU) {
																				$.each(countryOrgUnitList.organisationUnits,
																							function(i_countryOU,
																									item_countryOU) {
																								if (item_countryOU.id == item_programOU.id) {
																									found++;
																									
																									//Update org unit by level for this dataset
																									if (item_programOU.level in foundOrgUnits){
																										foundOrgUnits[item_programOU.level] = foundOrgUnits[item_programOU.level] + 1;
																									}
																									else{
																										foundOrgUnits[item_programOU.level] = 1;
																									}
																								}
																							});
																			});

																	if (found > 0) {
																		
//																		var program_type = "";
																		var deCount = 0;

																		var organizationUnitByLevel = "";
																		for (var level in foundOrgUnits){
																			organizationUnitByLevel += "L" + level + ": " + foundOrgUnits[level] + "</br>";
																		}

//																		var tooltip = {};
																		var totalInstances = 0;
																		var numberInstancesColumn = "";
																		var numberProgramStages = item_program.programStages.length; 
																		$.each(item_program.programStages, function(i_ps,item_ps) {
																			
																				//Count number of data elements
																				deCount += item_ps.programStageDataElements.length;
																				
																				//Count number of instance
																				var programInstancesURL = apiPath + 'analytics/events/aggregate/' + item_program.id +'.json?stage=' + item_ps.id + '&dimension=pe:LAST_12_MONTHS&filter=ou:' +  me.countryListTag.val() + '&outputType=EVENT&displayProperty=SHORTNAME';
																				RESTUtil.getAsynchData(programInstancesURL, function(programInstanceList) {
																					var subtotalInstances = 0;
																					$.each(programInstanceList.rows, function(i_pi, item_pi) {
//																						tooltip[item_pi[0]] = item_pi[1];
																						subtotalInstances += parseInt(item_pi[1]);
																					});
																					totalInstances += subtotalInstances;
																					numberInstancesColumn += item_ps.name + ": " + subtotalInstances + "</br>";
																					
																					numberProgramStages--;
																					
																					if (numberProgramStages == 0) {
																						//Formatted tooltip
	//																					var tooltipKeys = Object.keys(tooltip);
	//																					tooltipKeys.sort();
	//																					var formattedTooltip = "";
	//																					var totalInstances = 0;
	//																					jQuery.each(tooltipKeys, function(i, key){
	//																						formattedTooltip += key.substring(4,6) + "-" + key.substring(0,4) + " => " + tooltip[key] + "%\n";
	//																						totalInstances += tooltip[key];
	//																				    });
																					
																						if (item_program.programType == "WITHOUT_REGISTRATION") {
																							var isCustomEvent = (item_program.programStages[0].dataSetType == 'custom')?'Y':'N';
																							
																							me.infoList_Event_DataTable.row.add([
																																	  '<b>' + item_program.name + '</b></br>' + Util.getNotEmpty(item_program.description),
																																	  organizationUnitByLevel,
																																	  deCount,
																																	  //'<span title="' + formattedTooltip + '">' + totalInstances + "</span>",
																																	  totalInstances,
																																	  isCustomEvent,
																																	  'not currently possible'
																																	]).draw();
																							
																							me.summary.numberOfEvents++;
																							me.summary.eventInstances += totalInstances;
																							
																							orgUnitStructure._children.push({"id": item_program.id, "name":item_program.name, "type": "Event", "numberEventInstances":totalInstances, "numberDataElements":deCount});
																						} else if (item_program.programType == "WITH_REGISTRATION") {
																						
																							me.infoList_Tracker_DataTable.row.add([
																																	  '<b>' + item_program.name + '</b></br>' + Util.getNotEmpty(item_program.description),
																																	  organizationUnitByLevel,
																																	  deCount,
																																	  //'<span title="' + formattedTooltip + '">' + totalInstances + "</span>",
																																	  numberInstancesColumn,
																																	  'not implemented yet',
																																	  'not currently possible'
																																	]).draw();
																							
																							me.summary.numberOfTrackers++;
																							me.summary.trackerInstances += totalInstances;
																							
																							orgUnitStructure._children.push({"id": item_program.id, "name":item_program.name, "type": "Tracker", "numberTrackerInstances":totalInstances, "numberDataElements":deCount});
																						}
																					}
																					
																				},
																				function() {
																					alert('Failed to retrieve program stages.');
																				},
																				function() {
																					requestCount++;
																				},
																				function() {
																					requestCount--;
																					checkRequestCount(me, requestCount);
																				});	
																		});

																	}
																});

													},
													function() {
														alert('Failed to load program list.');
													},
													function() {
														requestCount++;
														QuickLoading.dialogShowAdd(loadingTagName);
													},
													function() {
														QuickLoading.dialogShowRemove(loadingTagName);
														requestCount--;
														checkRequestCount(me, requestCount);

													});

									// Remove one for middle stopping case.
									QuickLoading.dialogShowRemove(loadingTagName);
//										requestCount--;
//										checkRequestCount(me, requestCount);

								},
								function() {
									alert('Failed to retrieve org units.');
								},
								function() {
									requestCount++;
									QuickLoading.dialogShowAdd(loadingTagName);
								},
								function() {
									QuickLoading.dialogShowRemove(loadingTagName);
									requestCount--;
									checkRequestCount(me, requestCount);
								});

			});
}


function checkRequestCount(me, requestCount) {
	if (requestCount == 0) {
		me.infoList_SummaryTableTag.find("#dataSets_InfoList_Summary").text(me.summary.numberOfDatasets + " (" + me.summary.dataValues + ")");
		me.infoList_SummaryTableTag.find("#trackers_InfoList_Summary").text(me.summary.numberOfTrackers + " (" + me.summary.trackerInstances + ")");
		me.infoList_SummaryTableTag.find("#events_InfoList_Summary").text(me.summary.numberOfEvents + " (" + me.summary.eventInstances + ")");
		me.infoList_SummaryTableTag.find("#orgUnitGroups_InfoList_Summary").text(me.summary.orgUnitGroups.length);
		me.infoList_SummaryTableTag.find("#users_InfoList_Summary").text(usersUniqueList.length);
		
		me.countDownTag.countdown('pause');
		$('#defaultCountdownSpan').text('Time it Took: ');
		
		// Add values to root node
		orgUnitStructure["numberDataValues"] = me.summary.dataValues;
		orgUnitStructure["numberDataElements"] = orgUnitDataElements.length;
		orgUnitStructure["numberTrackerInstances"] = me.summary.trackerInstances;
		orgUnitStructure["numberEventInstances"] = me.summary.eventInstances;
		
		console.log("orgUnitStructure");
		console.log(orgUnitStructure);
		
		// Init graph
		initGraph(orgUnitStructure);
		$("#graphSettings").show();
	}
}

function setDataSetLinkAction(me) {
	var trCurrent = me.infoList_DataSetTableTag.find('tr:last');

	trCurrent.find('a.dataSetLink').click(function() {
		var anchorClicked = $(this);

		var dataSetId = anchorClicked.attr('dsid');

		if (Util.trim(dataSetId) != "") {
			me.selectDataSet(dataSetId);
			me.getDataElementsBtnTag.click();

			// Set the change tab to dataSet one (first one)
			$("#tabs").tabs();
			$("#tabs").tabs("option", "active", 1);
		}

		return false;
	});

}

// -- 'Search by Country' related
// ---------------------------------------
