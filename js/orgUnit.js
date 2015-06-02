// ---------------------------------------
// -- 'Search by Country' related

var orgUnitStructure = {};

function populateCountryList(me, loadingTagName, afterFunc) {
	var listTag = me.countryListTag;
	listTag.empty();

	var queryURL_getCountries = apiPath + "organisationUnits.json?level=" + me.orgUnitList.val();
	
	RESTUtil.getAsynchData(queryURL_getCountries, function(json_Data) {
		var json_DataOrdered = Util.sortByKey(json_Data.organisationUnits,
				"name");

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

function setup_SearchByCountry(me) {
	
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
	
	me.infoList_DataSet_DataTable = $("#infoList_DataSet").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});
	me.infoList_Event_DataTable = $("#infoList_Event").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});
	me.infoList_Tracker_DataTable = $("#infoList_Tracker").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});
	me.infoList_OrgUnitGroup_DataTable = $("#infoList_OrgUnitGroup").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});
	me.infoList_User_DataTable = $("#infoList_User").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});

	// Set up the events
	me.countryListTag.change(function() {
		($(this).val() != "") ? Util.disableTag(me.retrieveData_CountryTag,
				false) : Util.disableTag(me.retrieveData_CountryTag, true);
	});

	me.retrieveData_CountryTag.click(function() {
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
				me.summary = {numberOfDatasets: 0, numberOfEvents: 0, numberOfTrackers: 0, orgUnitGroups: new Array(), users: 0, dataValues: 0};

				var requestUrl_OrgUnits = apiPath + 'organisationUnits/' + me.countryListTag.val() + '.json?includeDescendants=true&fields=id,organisationUnitGroups[id],users[id,name]';

				orgUnitStructure = {"id": "root", "name":me.countryListTag.find(":selected").text(), "childNodes" : []};
				
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
																	+ '.json?fields=id,name,description,dataSetType,dataElements[id,name],organisationUnits[id,level]';

															RESTUtil.getAsynchData(requestUrl_dataSetDetail,
																	function(json_dataSet) {
																			// requestCount++;

																			var foundCount = 0;
																			var foundOrgUnits = {};
																			

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
																						//FIXME: We can use a js lib (underscore) to deal with this in a better way
																						var dataElementsIds = [];
																						$.each(json_dataSet.dataElements, function(i_dataElement, item_dataElement) {
																							dataElementsIds.push(item_dataElement.id);
																						});
																						
																						//Getting data values
																						var datasetsAnalyticsUrl = apiPath + 'analytics.json?dimension=dx:' + dataElementsIds.join(";") + '&filter=ou:' + me.countryListTag.val() + '&filter=pe:LAST_12_MONTHS&aggregationType=COUNT&displayProperty=SHORTNAME';
																						var datasetDataValues = 0;
																						RESTUtil.getAsynchData(datasetsAnalyticsUrl, function(datasetsAnalyticsList) {
																								$.each(datasetsAnalyticsList.rows, function(i_row, item_row) {
																									datasetDataValues += parseInt(item_row[1]);
																									me.summary.dataValues += parseInt(item_row[1]);
																								});
																						});
																						
																						orgUnitStructure.childNodes.push({"id": json_dataSet.id, "name":json_dataSet.name, "childNodes":json_dataSet.dataElements, "type": "dataset", "numberDataValues":datasetDataValues});

																						//Getting Completed information
																						var currentDatasetTime = 0;
																						var currentDatasetPercentage = 0;
																						var completedAnalyticsUrl = apiPath + 'analytics.json?dimension=dx:' + json_dataSet.id + '&filter=ou:' + me.countryListTag.val() + '&dimension=pe:LAST_12_MONTHS&displayProperty=SHORTNAME';
																						RESTUtil.getAsynchData(completedAnalyticsUrl, function(completedAnalyticsList) {
																							console.log(completedAnalyticsList);
																							$.each(completedAnalyticsList.rows, function(i_row, item_row) {
																								if (item_row[1] > currentDatasetTime){
																									currentDatasetTime = item_row[1];
																									currentDatasetPercentage = item_row[2];
																								}
																							});
																						});
																						
																						
																						me.summary.numberOfDatasets++;
																						
																						var organizationUnitByLevel = "";
																						for (var level in foundOrgUnits){
																							organizationUnitByLevel += "L" + level + ": " + foundOrgUnits[level] + "</br>";
																						}
																						
																						var isCustomDataset = (json_dataSet.dataSetType == 'custom')?'Y':'N';
																						
																						var datasetCompleted = "No information during the last 12 months";
																						if (currentDatasetPercentage == '0' && currentDatasetTime == '0'){
																							datasetCompleted = currentDatasetTime + " => " + currentDatasetPercentage + "%";
																						}
																						
																						me.infoList_DataSet_DataTable.row.add([
																						  '<a href="" class="dataSetLink" dsid="'+ json_dataSet.id + '">' + '<b>' + json_dataSet.name + '</b></br>' + Util.getNotEmpty(json_dataSet.description) + '</a>',
																						  organizationUnitByLevel,
																						  json_dataSet.dataElements.length,
																						  isCustomDataset,
																						  datasetCompleted
																						]).draw();

																						// Add event to this row.
																						setDataSetLinkAction(me);

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
										
										$.each(item_countryOU.users,
												function(i_countryOUG,item_countryUsers) {
											
											me.summary.users++;
											
											me.infoList_User_DataTable.row.add([item_countryUsers.name]).draw();
											
										});
										
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
									var requestUrl_programList = apiPath + 'programs.json?paging=no&fields=id,name,type,description,organisationUnits[id,level],programStages[dataEntryType,programStageDataElements]';

									RESTUtil.getAsynchData(
													requestUrl_programList,
													function(programList) {
														// requestCount++;

														$.each(programList.programs,
																function(
																		i_program,
																		item_program) {
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
//																			var program_type = "";
																		var deCount = 0;

																		var organizationUnitByLevel = "";
																		for (var level in foundOrgUnits){
																			organizationUnitByLevel += "L" + level + ": " + foundOrgUnits[level] + "</br>";
																		}

																		$.each(item_program.programStages,
																						function(
																								i_ps,
																								item_ps) {
																							deCount += item_ps.programStageDataElements.length;
																						});

																		if (item_program.type == 3) {
																			var isCustomEvent = (item_program.programStages[0].dataSetType == 'custom')?'Y':'N';
																			
																			me.infoList_Event_DataTable.row.add([
																													  '<b>' + item_program.name + '</b></br>' + Util.getNotEmpty(item_program.description),
																													  organizationUnitByLevel,
																													  deCount,
																													  isCustomEvent,
																													  'not currently possible'
																													]).draw();
																			
																			me.summary.numberOfEvents++;
																		} else if (item_program.type == 1) {
																		
																			me.infoList_Tracker_DataTable.row.add([
																													  '<b>' + item_program.name + '</b></br>' + Util.getNotEmpty(item_program.description),
																													  organizationUnitByLevel,
																													  deCount,
																													  'not implemented yet',
																													  'not currently possible'
																													]).draw();
																			
																			me.summary.numberOfTrackers++;
																		}

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
		me.infoList_SummaryTableTag.find("#dataSets_InfoList_Summary").text(me.summary.numberOfDatasets);
		me.infoList_SummaryTableTag.find("#trackers_InfoList_Summary").text(me.summary.numberOfTrackers);
		me.infoList_SummaryTableTag.find("#events_InfoList_Summary").text(me.summary.numberOfEvents);
		me.infoList_SummaryTableTag.find("#orgUnitGroups_InfoList_Summary").text(me.summary.orgUnitGroups.length);
		me.infoList_SummaryTableTag.find("#users_InfoList_Summary").text(me.summary.users);
		me.infoList_SummaryTableTag.find("#dataValues_InfoList_Summary").text(me.summary.dataValues);
		
		me.countDownTag.countdown('pause');
		$('#defaultCountdownSpan').text('Time it Took: ');
		
		orgUnitStructure["numberDataValues"] = me.summary.dataValues;
		console.log(orgUnitStructure);
		initGraph(orgUnitStructure);
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
			$("#tabs").tabs("option", "active", 0);
		}

		return false;
	});

}

// -- 'Search by Country' related
// ---------------------------------------