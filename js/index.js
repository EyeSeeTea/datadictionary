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
var dhisPath ="";
var apiPath = "";

var _queryURL_getOrgUnit = apiPath + "organisationUnits";

var _dataManager;
var _catComboData = {};

//We keep country although now it is for any org unit level in general in order to allow old links to keep working
var tabsMap = ['Country','DataSet','Dashboard','Users','OrgGroups','DB','Group','Group'];
var typeMap = ['','','','','','','DE','IND'];

// ======================================================
// Document Ready Run

$(document).ready(function() {

	$.getJSON( "manifest.webapp", function( json ) {

		getServerInfo(dhisPath, function(info) {
			var apiVersionPath = getApiVersionPath(info.version);

			if (!apiVersionPath) {
				$(document.body).empty();
				alert("Unsupported DHIS2 version: " + info.version);
			} else {
				// Read dhis and api path from manifest.webapp 
				dhisPath = json.activities.dhis.href;
				apiPath = dhisPath + "api/" + apiVersionPath + "/";

				// Configure dhis and api path components
				configureDhisPathComponents();
	
				// Set Layout define on manifest.webapp
				setLayout(json.layout);

				// Change url when a new tab is selected
				$("#tabs").tabs({disabled: [3,4,5], activate: function(event ,ui){
					refreshURL(tabsMap[ui.newTab.index()], typeMap[ui.newTab.index()], $("#tabs div.ui-tabs-panel:visible").find('.action_select').val());
				}});

				// Change url when dropdownlist is selected
				$('.action_select').on('click change', function(){
					refreshURL(tabsMap[$("#tabs").tabs('option', 'selected')], typeMap[$("#tabs").tabs('option', 'selected')], $(this).val())
				});

				_dataManager = new DataManager();
			}
		});
	} );

});

function configureDhisPathComponents(){
	$('#headerBanner').attr("onclick", "window.location.href=\"" + dhisPath + "dhis-web-dashboard-integration/index.action\"");
	$('#headerText').attr("onclick", "window.location.href=\"" + dhisPath + "dhis-web-dashboard-integration/index.action\"");
	$('#closeButton').attr("onclick", "window.location.href=\"" + dhisPath + "dhis-web-dashboard-integration/index.action\"");
}

function setLayout(layout){
	if (layout == 'jhpiego'){
		$('#headerText').text('JADE Dev');
		$('#header').css({'background-color':'#305B75'});
	}
	else if (layout == 'psi') {
		$('#headerText').text('PSI MIS');
		$('#header').css({'background-color':'#467e4a'})
	}
	$('#versionText').attr("href", "https://docs.google.com/document/d/1kas42KhcTIIL0cE9_PVwcEJw97wunVaAafwKuM0JaBc");
	$('#versionText').attr("target","_blank");
}

//Change url without reloading page
function refreshURL(selectedTab, selectedType, selectedValue){
	var tabString = '?Tab=' + selectedTab;
	var typeString = (selectedType!='')?('&Type=' + selectedType):'';
	var valueString = (selectedValue != '' && typeof selectedValue != 'undefined')?"&Value=" + selectedValue:"";
	var explorerUrl = '//' + location.host + location.pathname + tabString + typeString + valueString;
	if(history.pushState) {history.pushState(null, null, explorerUrl);}
}

// -------------------------------------------
// -- Data Element Manager Class

function DataManager() {
	var me = this;

	me.sqlViews = {
		dashboard_list: {
			name: "DataDictionary - Dashboard List",
			type: "VIEW",
			cacheStrategy: "RESPECT_SYSTEM_SETTING",
			sqlQuery: "SELECT * FROM dashboard;"
		},
		dashboard_join: {
			name: "DataDictionary - Dashboard Join",
			type: "VIEW",
			cacheStrategy: "RESPECT_SYSTEM_SETTING",
			sqlQuery: "SELECT usergroupid, uid, name, userid FROM usergroup;"
		}
	};

	me.adminRole = {
		name: "DataDictionary admin",
		description: "Can change global settings of the DataDictionary app",
		authorities: ["Admin Data Dictionary"]
	};

	me.queryURL_DataElementGet = apiPath + "dataElements/";
	me.queryURL_IndicatorGet = apiPath + "indicators/";
	me.queryURL_DataElementListGet = apiPath + "dataElements.json?paging=false";
	me.queryURL_DataSetListGet = apiPath + "dataSets.json?paging=false";
	me.queryURL_DataSetDetailGet = apiPath + "dataSets/";

	me.queryURL_analyticsSQLView = apiPath + "sqlViews/";
	me.queryURL_analytics = apiPath + "dashboards/";
	me.queryURL_analytics_ownDashboard = apiPath + "dashboards.json";
	me.queryURL_analytics_userGroups = apiPath + "userGroups/";
	me.queryURL_me = apiPath + "me.json";

	me.dataElementPopup = new DataElementPopup();
	me.indicatorPopup = new IndicatorPopup();

	me.contentDivTag = $('#content');
	me.trDataSetSelectionTag = $('#trDataSetSelection');
	me.dataSetFullListTag = $('#dataSetFullList');
	me.dataSetSearchTag = $('#dataSetSearch');

	me.getDataElementsBtnTag = $('#getDataElementsBtn');

	me.tbDataElementListTag = $('#tbDataElementList');
	me.dataElementListDivTag = $('#dataElementList');

	//Mode
	me.orgUnitTabMode = $('#orgUnitTabMode')
	
	//Graph settings
	me.orgUnitGraphSelector = $('#graphSelector');
	me.orgUnitScaleSelector = $('#scaleSelector');
	
	//Settings
	me.settingDialogFormTag = $( '#settingDialogForm' );
	me.settingPopupFormOpenTag = $( '#settingPopupFormOpen' );
	
	// 
	me.dataListDEDiv_byGroupTag = $('#dataListDE_byGroup');
	me.tbDataListDE_byGroupTag = $('#tbDataListDE_byGroup');
	me.dataListINDDiv_byGroupTag = $('#dataListIND_byGroup');
	me.tbDataListIND_byGroupTag = $('#tbDataListIND_byGroup');

	// Group related tags
	me.groupTypeTag = $('#groupType');
	me.divGroupLoadingTag = $('#divGroupLoading');

	me.groupListTag = $('#groupList');
	me.indicatorListTag = $('#indicatorList');

	me.paramTab = '';
	me.paramSearchValue = '';
	me.paramSearchType = '';
	me.paramOption = '';

	me.setGroupParameterSelection = false;

	me.dataSetSelectedId;
	me.dataSetList_Saved;

	me.oTable_DE_ByDataSet;
	me.oTable_DE_ByGroup;
	me.oTable_IND_ByGroup;

	me.descriptionDiv_Height = 100;
	me.origHeightName = 'origHeight';

	me.staticVal_AllDataSet = 'AllDataSet';

	// ------------ 'Country' related

	me.countryListTag = $('#countryList');
	me.retrieveData_CountryTag = $('#retrieveData_Country');

	me.infoList_SummaryTableTag = $('#infoList_Summary');
	me.infoList_DataSetTableTag = $('#infoList_DataSet');
	me.infoList_EventTableTag = $('#infoList_Event');
	me.infoList_TrackerTableTag = $('#infoList_Tracker');
	me.infoList_OrgUnitGroupTableTag = $('#infoList_OrgUnitGroup');
	me.infoList_UserTableTag = $('#infoList_User');
	
	me.countDownTag = $('#defaultCountdown');

	me.loadingCount = 0;

	me.dataListWithDetail = [];

	// --------------------------------------
	// Methods
	
	me.setupTopSection = function()
	{
		me.settingPopupFormOpenTag.click( function()
		{
			me.settingDataPopupForm.openForm();
		});

	}

	// ---------------------------------------
	// -- Get/Retrieve Methods

	me.getDataElementList = function(dataSetId, loadingTagName, runFunc) {

		var queryStr = "";

		if (dataSetId == me.staticVal_AllDataSet) {
			queryStr = me.queryURL_DataElementListGet;
		} else {
			queryStr = me.queryURL_DataSetDetailGet + dataSetId + '.json';
		}

		// me.queryURL_DataSetDetailGet = apiPath + "dataSets/";

		RESTUtil.getAsynchData(queryStr, function(data) {
			runFunc(DataHelpers.getDataElements(data));
		}, function() {
			alert('Failed to retrieve dataElement list.');
		}, function() {
			QuickLoading.dialogShowAdd(loadingTagName);
		}, function() {
			QuickLoading.dialogShowRemove(loadingTagName);
		});
	}

	me.getDataSetList = function(loadingTagName, runFunc) {
		RESTUtil.getAsynchData(me.queryURL_DataSetListGet, function(data) {
			runFunc(data.dataSets);
		}, function() {
			alert('Failed to retrieve dataset list.');
		}, function() {
			QuickLoading.dialogShowAdd(loadingTagName);
		}, function() {
			QuickLoading.dialogShowRemove(loadingTagName);
		});
	}

	// -- Get/Retrieve Methods
	// ---------------------------------------

	// ---------------------------------------
	// -- Populate Methods

	me.retrieveAndPopulateDataSet = function(dropdownTag, runFunc) {
		me.getDataSetList('dataSetLoading', function(dataSetList) {

			Util.populateSelect(dropdownTag, "DataSet", dataSetList);

			dropdownTag.find('option').eq(1).before(
					$("<option></option>").val(me.staticVal_AllDataSet).html(
							"All DataSet"));

			runFunc(dataSetList);
		});
	}

	me.retrieveAndPopulateData = function(type, json_listData, loadingTagName,
			tbListTag, listDivTag) {

		var queryURL = "";

		if (type == "DE" || type == "DE_DS") {
			queryURL = me.queryURL_DataElementGet;
		} else if (type == "IND") {
			queryURL = me.queryURL_IndicatorGet;
		}

		me.dataListWithDetail = [];

		var deferredArrActions_getData = [];

		$.each(json_listData, function(i_data, item_data) {
			deferredArrActions_getData.push(RESTUtil.getAsynchData(queryURL
					+ item_data.id + ".json?fields=indicatorGroups[id,name],numeratorDescription,denominatorDescription,dataElementGroups[id,name],name,id,valueType,description,categoryCombo[id,displayName]", function(json_dataDetail) {
				me.dataListWithDetail.push(json_dataDetail);
			}, function() {
			}, function() {
				QuickLoading.dialogShowAdd(loadingTagName);
			}, function() {
				QuickLoading.dialogShowRemove(loadingTagName);
			}));

		});

		// Step 3a. Sort the person by name
		$.when.apply($, deferredArrActions_getData)
				.then(
						function() {

							me.dataListWithDetail = Util.sortByKey(
									me.dataListWithDetail, "displayName");

							if (type == "DE_DS" || type == "DE") {
								me.dataElementDataModify(
												me.dataListWithDetail,
												loadingTagName,
												function() {

													me.setUp_DataTable_DataElement(type, tbListTag, me.dataListWithDetail);

													// Display the section.
													listDivTag.show();

													me.setDivOriginalHeights(tbListTag.find('div.limitedView'));

													me.setUpDivToggleAction(tbListTag.find('div.limitedView,div.limitedView_Toggle'));

													me.setUp_TransposedExcelBtn(tbListTag, me.dataListWithDetail);

													if (me.paramOption == "DE") {
														me.setUp_DEAttributeValueExcelBtn(tbListTag,me.dataListWithDetail);
													}
												});
							} else if (type == "IND") {
								me.indicatorDataModify(me.dataListWithDetail);

								me.setUp_DataTable_Indicator(type, tbListTag,
										me.dataListWithDetail);

								// Display the section.
								listDivTag.show();

								me.setDivOriginalHeights(tbListTag
										.find('div.limitedView'));

								me
										.setUpDivToggleAction(tbListTag
												.find('div.limitedView,div.limitedView_Toggle'));

							}

						});
	}

	me.setDivOriginalHeights = function(tags) {
		tags.each(function(index) {
			var tag = $(this);

			var tagHeight = tag.height();
			tag.data(me.origHeightName, tagHeight);

			if (tagHeight > me.descriptionDiv_Height) {
				tag.animate({
					height : me.descriptionDiv_Height
				}, 0);
				me.createIfNotExists_ToggleTag(
						tag.parent('div.limitedView_Container')).show();
				tag.attr('status', 'shorten');
			}
		});
	}

	me.createIfNotExists_ToggleTag = function(parentTag) {
		var toggleTag = parentTag.find('div.limitedView_Toggle');

		if (toggleTag === undefined || toggleTag.length == 0) {
			parentTag
					.append('<div class="limitedView_Toggle" style="display:none;">...... More ......</div>');

			toggleTag = parentTag.find('div.limitedView_Toggle');
		}

		return toggleTag;
	}

	// ---------------------------------------------------------

	me.setUp_DEAttributeValueExcelBtn = function(tbListTag, dataElementList) {
		var divSectionTag = tbListTag.closest("div.section");
		var buttonContainer = divSectionTag.find('div.DTTT_container');
		var buttonIdName = 'DTTT_button_DEAttributeValExcel';
		var tableIdStr = 'deAttributeValDataTable';
		var fileName = 'deAttributeValExcel';

		// If already exists, remove it and recreate it.
		buttonContainer.find('#' + buttonIdName).remove();

		var excelBtnTag = $('<button type="button" style="font-size: 0.88em;" class="DTTT_button" id="'
				+ buttonIdName + '">AttributeExcel</button>');

		buttonContainer.prepend(excelBtnTag);

		excelBtnTag.click(function() {
			// Get data sorted/organized <-- for attributes
			var deWithAttributeInfo = me
					.getDEAttributeInFormat(dataElementList);

			divSectionTag.prepend(me.geDEwithAttributeValExcel_TableOutput(
					deWithAttributeInfo, tableIdStr));

			me.generateFileExcel(tableIdStr, fileName);
		});
	}

	me.getDEAttributeInFormat = function(dataElementList) {
		var deAttributeVals = [];
		var attributeList = {};
		var attributeOrderedList_Temp = [];
		var attributeOrderedList = [];

		// 1. Loop through the data elements attributes and build the unique
		// attribute list
		$
				.each(
						dataElementList,
						function(i_de, item_de) {
							if (item_de.attributeValues !== undefined
									&& item_de.attributeValues.length > 0) {
								$
										.each(
												item_de.attributeValues,
												function(i_av, item_av) {
													if (item_av.attribute !== undefined
															&& attributeList[item_av.attribute.id] === undefined) {
														attributeList[item_av.attribute.id] = item_av.attribute;
													}
												});
							}
						});

		// 2. Get Ordered List
		for ( var propName in attributeList) {
			attributeOrderedList_Temp.push(attributeList[propName]);
		}
		attributeOrderedList = Util
				.sortByKey(attributeOrderedList_Temp, "name");

		// 3. Go through the data elements list and create new data with all
		// attributes
		$
				.each(
						dataElementList,
						function(i_de, item_de) {
							var newObj = {};

							newObj.id = item_de.id;
							newObj.name = item_de.name;
							newObj.code = Util.getNotEmpty(item_de.code);
							newObj.formName = Util
									.getNotEmpty(item_de.formName);
							newObj.valueType = me.getValueDataTypeName(
									item_de.type, item_de);
							newObj.optionSet = (item_de.optionSet !== undefined) ? item_de.optionSet.name
									: "";
							newObj.description = Util
									.getNotEmpty(item_de.description);

							newObj.attributeData = {};

							for ( var propName in attributeList) {
								var attributeId = propName;

								newObj.attributeData[attributeId] = me
										.getAttributeFromDE(
												item_de.attributeValues,
												attributeId);
							}

							deAttributeVals.push(newObj);
						});

		// Combine 2 infomation and return it.
		var deWithAttributeInfo = {
			'deData' : deAttributeVals,
			'attributeList' : attributeList,
			'attributeOrderedList' : attributeOrderedList
		};

		return deWithAttributeInfo;
	}

	me.getAttributeFromDE = function(attributeValues, attributeId) {
		var returnVal = "";

		if (attributeValues !== undefined) {
			$.each(attributeValues, function(i_av, item_av) {
				if (item_av.attribute.id == attributeId) {
					returnVal = item_av.value;
					return false;
				}
			});
		}

		return returnVal;
	}

	me.geDEwithAttributeValExcel_TableOutput = function(deWithAttributeInfo,
			tableIdStr) {

		// var deWithAttributeInfo = { 'deData': deAttributeVals,
		// 'attributeList': attributeList, 'attributeOrderedList':
		// attributeOrderedList };
		var attrList = deWithAttributeInfo.attributeOrderedList;

		// Hide the table in div
		var hiddenDiv = $('<div style="display:none;"></div>');

		// For each Data Elements, add bottom row of Catagory..

		// Table (Or CSV) Setup
		var emptyTdStr = '<td></td>';
		var tableTag = $('<table id="' + tableIdStr + '"></table>');

		hiddenDiv.append(tableTag);

		var trTag_Header = $('<tr></tr>');
		tableTag.append(trTag_Header);

		// Data Element Info
		trTag_Header.append('<td>ID</td>');
		trTag_Header.append('<td>Name</td>');
		trTag_Header.append('<td>Code</td>');
		trTag_Header.append('<td>FormName</td>');
		trTag_Header.append('<td>ValueType</td>');
		trTag_Header.append('<td>OptionSet</td>');
		trTag_Header.append('<td>Desc</td>');

		$.each(attrList, function(i_at, item_at) {
			trTag_Header.append('<td>' + item_at.name + ' [' + item_at.id
					+ ']</td>');
		});

		// SubHeader Name Column

		// list current DE Lists.
		$.each(deWithAttributeInfo.deData, function(i_de, item_de) {
			var trTag_DE = $('<tr></tr>');

			trTag_DE.append('<td>' + item_de.id + '</td>');
			trTag_DE.append('<td>' + item_de.name + '</td>');
			trTag_DE.append('<td>' + item_de.code + '</td>');
			trTag_DE.append('<td>' + item_de.formName + '</td>');
			trTag_DE.append('<td>' + item_de.valueType + '</td>');
			trTag_DE.append('<td>' + item_de.optionSet + '</td>');
			trTag_DE.append('<td>' + item_de.description + '</td>');

			$.each(attrList, function(i_at, item_at) {
				trTag_DE.append('<td>' + item_de.attributeData[item_at.id]
						+ '</td>');
			});

			tableTag.append(trTag_DE);
		});

		return hiddenDiv; // tableTag;
	}

	// ---------------------------------------------------------

	me.setUp_TransposedExcelBtn = function(tbListTag, dataElementList) {
		var divSectionTag = tbListTag.closest("div.section");
		var buttonContainer = divSectionTag.find('div.DTTT_container');
		var buttonIdName = 'DTTT_button_transposeExcel2';
		var tableIdStr = 'transposedExcelDataTable';
		var fileName = 'transposedExcel';

		// If already exists, remove it and recreate it.
		buttonContainer.find('#' + buttonIdName).remove();

		var excelBtnTag = $('<button type="button" style="font-size: 0.88em;" class="DTTT_button" id="'
				+ buttonIdName + '">TransExcel</button>');

		buttonContainer.prepend(excelBtnTag);

		excelBtnTag.click(function() {
			var te_dataElements = me
					.prepareTransposedExcelData(dataElementList);

			divSectionTag.prepend(me.geTransposedExcel_TableOutput(
					te_dataElements, tableIdStr));

			me.generateFileExcel(tableIdStr, fileName);

			// return false;
		});

	}

	me.generateFileExcel = function(tableIdStr, fileName) {
		var link = document.createElement("a");
		// link.href = uri;

		// set the visibility hidden so it will not effect on your web-layout
		link.style = "visibility:hidden";
		link.download = fileName + ".xls";

		ExcellentExport.excel(link, tableIdStr, 'SheetData');

		// this part will append the anchor tag and remove it after automatic
		// click
		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);
	}

	me.generateFile = function(data) {
		// Generate a file name
		var fileName = "transposedExcel";

		// this will remove the blank-spaces from the title and replace it with
		// an underscore
		// fileName += ReportTitle.replace(/ /g,"_");

		// Initialize file format you want csv or xls
		var uri = 'data:text/csv;charset=utf-8,' + escape(data);

		// Now the little tricky part.
		// you can use either>> window.open(uri);
		// but this will not work in some browsers
		// or you will not get the correct file extension

		// this trick will generate a temp <a /> tag
		var link = document.createElement("a");
		link.href = uri;

		// set the visibility hidden so it will not effect on your web-layout
		link.style = "visibility:hidden";
		link.download = fileName + ".csv";

		// this part will append the anchor tag and remove it after automatic
		// click
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	me.prepareTransposedExcelData = function(dataElementList) {
		var te_dataElements = [];

		// list current DE Lists.
		$
				.each(
						dataElementList,
						function(i_de, item_de) {
							var deShortName = (item_de.shortName !== undefined) ? item_de.shortName
									: item_de.name;

							var ts_dataElement = {
								id : item_de.id,
								name : deShortName,
								type : item_de.type,
								categoryCombo : {},
								ccid : item_de.categoryComboId
							};

							item_de.categoryComboName = "";
							item_de.categoryComboId = "";

							// console.log( 'DataElement: ' + item_de.name );

							// Category Combo Related - THIS IS NEVER
							// UNDEFINED!!
							if (item_de.categoryCombo !== undefined) {
								item_de.categoryComboName = item_de.categoryCombo.name;
								item_de.categoryComboId = item_de.categoryCombo.id;

								// console.log( 'CAT: ' +
								// item_de.categoryComboName + ', ' +
								// item_de.categoryComboId );
								// console.log( 'CCO: ' + JSON.stringify(
								// _catComboData[ item_de.categoryComboId ] ) );

								ts_dataElement.categoryCombo = _catComboData[item_de.categoryComboId];

							} else {
								// - THIS IS NEVER UNDEFINED!!
								console.log('CatCombo Undefined Case!!');

								return false;
							}

							te_dataElements.push(ts_dataElement);

						});

		return te_dataElements;
	}

	me.geTransposedExcel_TableOutput = function(te_dataElements, tableIdStr) {
		// Hide the table in div
		var hiddenDiv = $('<div style="display:none;"></div>');
		// var hiddenDiv = $( '<div></div>' );

		// For each Data Elements, add bottom row of Catagory..

		// Table (Or CSV) Setup
		var emptyTdStr = '<td></td>';
		var tableTag = $('<table id="' + tableIdStr + '"></table>');

		hiddenDiv.append(tableTag);

		var trTag_Header = $('<tr></tr>');
		var trTag_DE = $('<tr></tr>');
		var trTag_DEId = $('<tr></tr>');
		var trTag_catOptionCombo = $('<tr></tr>');
		var trTag_catOptionComboId = $('<tr></tr>');
		var trTag_DEDataType = $('<tr></tr>');

		tableTag.append(trTag_Header);
		tableTag.append(trTag_DE);
		tableTag.append(trTag_DEId);
		tableTag.append(trTag_catOptionCombo);
		tableTag.append(trTag_catOptionComboId);
		tableTag.append(trTag_DEDataType);

		// FacilityID/Month/Year column
		trTag_Header.append('<td>Facility ID</td>');
		trTag_Header.append('<td>Month</td>');
		trTag_Header.append('<td>Year</td>');

		for (i = 0; i < 3; i++) {
			trTag_DE.append(emptyTdStr);
			trTag_DEId.append(emptyTdStr);
			trTag_catOptionCombo.append(emptyTdStr);
			trTag_catOptionComboId.append(emptyTdStr);
			trTag_DEDataType.append(emptyTdStr);
		}

		// SubHeader Name Column
		trTag_Header.append('<td></td>');
		trTag_DE.append('<td>DE Short Name</td>');
		trTag_DEId.append('<td>DE ID</td>');
		trTag_catOptionCombo.append('<td>CatOptionCombo</td>');
		trTag_catOptionComboId.append('<td>CatOptionCombo ID</td>');
		trTag_DEDataType.append('<td>DE ValueType</td>');

		// list current DE Lists.
		$
				.each(
						te_dataElements,
						function(i_de, item_de) {
							// console.log( '---- DE ' + item_de.name + '[' +
							// item_de.id + '] ----' ) );

							var deCountNameTdStr = '<td>DE ' + (i_de + 1)
									+ '</td>';
							var deShortNameTdStr = '<td>' + item_de.name
									+ '</td>';
							var deIdTdStr = '<td>' + item_de.id + '</td>';
							var deDataTypeNameTdStr = '<td>'
									+ me.getValueDataTypeName(item_de.type)
									+ '</td>';

							if (item_de.categoryCombo === undefined) {
								console.log('**undefined CatCombo** '
										+ item_de.ccid + ', DE: ' + item_de.id
										+ ' ' + item_de.name);
							} else {
								var catOptonCombos = item_de.categoryCombo.categoryOptionCombos;

								if (catOptonCombos === undefined) {
									console.log('**Undefined CatOptionCombos');
								} else {
									$.each(catOptonCombos, function(i_coc,
											item_coc) {
										trTag_Header.append(deCountNameTdStr);
										trTag_DE.append(deShortNameTdStr);
										trTag_DEId.append(deIdTdStr);
										trTag_catOptionCombo.append('<td>'
												+ item_coc.name + '</td>');
										trTag_catOptionComboId.append('<td>'
												+ item_coc.id + '</td>');
										trTag_DEDataType
												.append(deDataTypeNameTdStr);

										// console.log( '[' + item_coc.id + '] '
										// + item_coc.name );
									});
								}
							}
						});

		return hiddenDiv; // tableTag;
	}

	me.geTransposedExcel_CommaOutput = function(te_dataElements) {

		var emptyTdStr = ",";
		var newLine = '\r\n';

		// For each Data Elements, add bottom row of Catagory..

		// Table (Or CSV) Setup
		var tableTag = "";

		var trTag_Header = "";
		var trTag_DE = "";
		var trTag_DEId = "";
		var trTag_catOptionCombo = "";
		var trTag_catOptionComboId = "";
		var trTag_DEDataType = "";

		// FacilityID/Month/Year column
		trTag_Header += "Facility ID" + emptyTdStr;
		trTag_Header += "Month" + emptyTdStr;
		trTag_Header += "Year" + emptyTdStr;

		for (i = 0; i < 3; i++) {
			trTag_DE += emptyTdStr;
			trTag_DEId += emptyTdStr;
			trTag_catOptionCombo += emptyTdStr;
			trTag_catOptionComboId += emptyTdStr;
			trTag_DEDataType += emptyTdStr;
		}

		// SubHeader Name Column
		trTag_Header += emptyTdStr;
		trTag_DE += 'DE Short Name' + emptyTdStr;
		trTag_DEId += 'DE ID' + emptyTdStr;
		trTag_catOptionCombo += 'CatOptionCombo' + emptyTdStr;
		trTag_catOptionComboId += 'CatOptionCombo ID' + emptyTdStr;
		trTag_DEDataType += 'DE ValueType' + emptyTdStr;

		// list current DE Lists.
		$
				.each(
						te_dataElements,
						function(i_de, item_de) {
							var deCountNameTdStr = 'DE ' + (i_de + 1)
									+ emptyTdStr;
							var deShortNameTdStr = '"' + item_de.name + '"'
									+ emptyTdStr;
							var deIdTdStr = item_de.id + emptyTdStr;
							var deDataTypeNameTdStr = me
									.getValueDataTypeName(item_de.type)
									+ emptyTdStr;

							if (item_de.categoryCombo === undefined) {
								console.log('**undefined CatCombo** '
										+ item_de.ccid + ', DE: ' + item_de.id
										+ ' ' + item_de.name);
							} else {
								var catOptonCombos = item_de.categoryCombo.categoryOptionCombos;

								if (catOptonCombos === undefined) {
									console.log('**Undefined CatOptionCombos');
								} else {
									$
											.each(
													catOptonCombos,
													function(i_coc, item_coc) {
														trTag_Header += deCountNameTdStr;
														trTag_DE += deShortNameTdStr;
														trTag_DEId += deIdTdStr;
														trTag_catOptionCombo += '"'
																+ item_coc.name
																+ '"'
																+ emptyTdStr;
														trTag_catOptionComboId += item_coc.id
																+ emptyTdStr;
														trTag_DEDataType += deDataTypeNameTdStr;
													});
								}
							}
						});

		// Remove last comma
		tableTag += me.removeLastChar(Util.trim(trTag_Header)) + newLine;
		tableTag += me.removeLastChar(Util.trim(trTag_DE)) + newLine;
		tableTag += me.removeLastChar(Util.trim(trTag_DEId)) + newLine;
		tableTag += me.removeLastChar(Util.trim(trTag_catOptionCombo))
				+ newLine;
		tableTag += me.removeLastChar(Util.trim(trTag_catOptionComboId))
				+ newLine;
		tableTag += me.removeLastChar(Util.trim(trTag_DEDataType)) + newLine;

		return tableTag;
	}

	me.removeLastChar = function(input) {
		return input.slice(0, input.length - 1);
	}

	me.setUpDivToggleAction = function(tags) {
		tags.off('click').click(function() {
			var containerTag = $(this).parent('div.limitedView_Container');

			var tag = containerTag.find('div.limitedView');
			var toggleTag = me.createIfNotExists_ToggleTag(containerTag);

			var status = Util.getNotEmpty(tag.attr('status'));

			if (status != "") {
				var originalHeight = tag.data(me.origHeightName);
				var tagHeight = tag.height();

				if (status == 'shorten')
				// if ( tagHeight < originalHeight )
				{
					tag.attr('status', 'full');
					tag.animate({
						height : originalHeight
					});
					toggleTag.hide();
				} else if (status == 'full') {
					tag.attr('status', 'shorten');
					tag.animate({
						height : me.descriptionDiv_Height
					});
					toggleTag.show();
				}
				// alert( tag.data( me.origHeightName ) );

			}
		});
	}

	me.dataElementDataModify = function(dataElementList, loadingTagName,
			runFunc) {
		// use 'retrieveCount' to return only after all the retrieval has been
		// processed.
		var retrieveCount = 0;

		$.each(dataElementList, function(i_de, item_de) {
			var categoryOptions = [];

			var groupNames = "";
			var desc = "";

			item_de.categoryComboName = "";
			item_de.categoryComboId = "";

			// item_de.dimensions = {};

			// Category Option Related
			if (item_de.categoryCombo !== undefined) {
				item_de.categoryComboName = item_de.categoryCombo.name;
				item_de.categoryComboId = item_de.categoryCombo.id;

				// item_de.dimensions.categoryCombo = item_de.categoryCombo;
			}

			// Data Element Group Related
			if (item_de.dataElementGroups !== undefined) {
				$.each(item_de.dataElementGroups,
						function(i_group, item_group) {
							if (groupNames != "")
								groupNames += "<br> ";

							groupNames += item_group.name;

						});
			}

			if (item_de.description !== undefined) {
				desc = item_de.description;
			}

			item_de.dataElementGroupNames = groupNames;
			item_de.description = desc;
		});

		runFunc();

	}

	me.indicatorDataModify = function(indicatorList) {
		$
				.each(
						indicatorList,
						function(i_ind, item_ind) {
							var groupNames = "";

							if (item_ind.indicatorGroups !== undefined) {
								$.each(item_ind.indicatorGroups, function(
										i_group, item_group) {
									if (groupNames != "")
										groupNames += "<br>";

									groupNames += item_group.name;
								});
							}

							item_ind.indicatorGroupNames = groupNames;

							item_ind.description = (item_ind.description !== undefined) ? item_ind.description
									: "";

							item_ind.numeratorDescription = (item_ind.numeratorDescription !== undefined) ? item_ind.numeratorDescription
									: "";

							item_ind.denominatorDescription = (item_ind.denominatorDescription !== undefined) ? item_ind.denominatorDescription
									: "";

						});
	}

	// -- Populate Methods
	// ---------------------------------------

	// ---------------------------------------
	// -- Setup Methods

	me.setup_SearchByDataSet = function(afterFunc) {
		Util.disableTag(me.getDataElementsBtnTag, true);

		me.setUp_DataSetAutoSelection(me.dataSetSearchTag);

		me.setUp_DataSetFullList(me.dataSetFullListTag, me.dataSetSearchTag);

		me.setUp_RunClick_DataSetDataElement(me.getDataElementsBtnTag);

		// Populate data set list
		me.retrieveAndPopulateDataSet(me.dataSetFullListTag, function(
				dataSet_FullList) {
			me.dataSetList_Saved = dataSet_FullList;

			// Set visible of the body content
			me.contentDivTag.show(400);

			afterFunc(dataSet_FullList);
		});
	}

	me.setUp_DataSetAutoSelection = function(searchTag) {
		searchTag.autocomplete({
			source : function(request, response) {

				// Reset orgUnitSelectedId and below section
				delete me.dataSetSelectedId;
				// me.resetSetting_PeriodAndBelowSection();
				me.dataSetFullListTag.val('');
				Util.disableTag(me.getDataElementsBtnTag, true);

				if (Util.trim(request.term).length == 0) {
					me.trDataSetSelectionTag.show(300);
				}

				var dstsSetListFound = new Array();

				if (request.term.length >= 2) {

					if (Util.checkDataExists(me.dataSetList_Saved)) {
						$.each(me.dataSetList_Saved, function(i_dataSet,
								item_dataSet) {

							if (item_dataSet.displayName.search(new RegExp(
									request.term, 'i')) == 0) {
								dstsSetListFound.push({
									"id" : item_dataSet.id,
									"label" : item_dataSet.displayName,
									"value" : item_dataSet.displayName,
									"dataSet" : item_dataSet
								});
							}
						});
					}

					response(dstsSetListFound);

				} else {
					response(dstsSetListFound);
				}
			},
			minLength : 0,
			delay : 500,
			select : function(event, ui) {

				// Set DataSet
				me.selectDataSet(ui.item.id);
			}
		});
	}

	me.selectDataSet = function(dataSetId) {
		// Reset the values..
		delete me.dataSetSelectedId;
		me.dataSetSearchTag.val('');
		me.dataSetFullListTag.val('');
		Util.disableTag(me.getDataElementsBtnTag, true);

		if (dataSetId != "") {
			me.dataSetSelectedId = dataSetId;

			me.dataSetFullListTag.val(dataSetId);
			me.dataSetSearchTag.val(me.dataSetFullListTag.find(
					'option:selected').text());

			Util.disableTag(me.getDataElementsBtnTag, false);
		}
	}

	me.setUp_DataSetFullList = function(listTag, searchTag) {
		listTag.change(function() {
			me.selectDataSet($(this).val());
		});
	}

	me.getGroupIdStr = function(list) {
		var groupIds = "";

		if (list !== undefined) {
			$.each(list, function(i_group, item_group) {
				groupIds += item_group.id + ';';
			});
		}

		return groupIds;
	}

	me.setUp_DataTable_DataElement = function(type, listTag, dataList) {
		var oTable;

		if (type == "DE_DS") {
			oTable = me.oTable_DE_ByDataSet;
		} else if (type == "DE") {
			oTable = me.oTable_DE_ByGroup;
			;
		}

		if (oTable === undefined) {
			oTable = listTag
					.dataTable({
						"data" : dataList,
						"columns" : [
								{
									data : 'dataElementGroupNames',
									"title" : "DE Group",
									"render" : function(data, type, full) {
										return (Util.checkValue(data)) ? data
												: '&lt;not assigned&gt;';
										// return data + '-' + JSON.stringify(
										// full ) ;
									}
								},
								{
									data : 'name',
									"title" : "DE Name",
									"render" : function(data, type, full) {
										return "<a href='' class='datapopup' dataid='"
												+ full.id
												+ "' onclick='return false;'>"
												+ data + "</a>";
									}
								},
								{
									data : 'id',
									"title" : "UID",
									"render" : function(data, type, full) {
										return '<span class="tdSmall">' + data
												+ '</span>';
									}
								},
								{
									data : 'categoryCombo.displayName',
									"title" : "Disaggregation (Cat Combo)"
								},
								{
									data : 'id',
									"title" : "Dimensions",
									"render" : function(data, type, full) {

										var catId = (full.categoryCombo.displayName != ""
												&& full.categoryCombo.displayName != "default" && full.categoryCombo.id != "") ? full.categoryCombo.id
												: "";

										// For 'default', set the catcombo.
										if (full.categoryCombo.displayName == "default")
											me.setCatComboData(
													full.categoryComboId,
													_catComboData);

										var degsids = me
												.getGroupIdStr(full.dataElementGroups);

										// full.dimensions = "test";
										var dimensions = me
												.formatDimensions(full.dimensions);

										// Have a div tag with deid and data??
										return '<div deid="' + full.id
												+ '" catid="' + catId
												+ '" degsids="' + degsids
												+ '" >' + dimensions + '</div>';
									}
								},
								{
									data : 'valueType',
									"title" : "Value Type",
									"render" : function(data, type, full) {
										return me.getValueDataTypeName(data);
									}
								},
								{
									data : 'description',
									"title" : "DE Description",
									"render" : function(data, type, full) {
										return '<div class="limitedView_Container"><div class="limitedView">'
												+ data.replace(/[\n\r\t]/g, "")
												+ '</div></div>';
									}
								}

						],
						"order" : [ [ 0, "asc" ], [ 1, "asc" ] ],
						"aLengthMenu" : [ [ -1, 25, 50, 100 ],
								[ "All", 25, 50, 100 ] ],
						"iDisplayLength" : -1,
						"dom" : 'T<"clear">lfrtip',
						"fnInfoCallback" : function(oSettings, iStart, iEnd,
								iMax, iTotal, sPre) {
							// Each time paging or other things happen that
							// requires refresh, call below again to generate
							// data.

							// For
							// console.log( 'fnInfoCallback Called' );

							me.setDivOriginalHeights(listTag
									.find('div.limitedView'));

							me
									.setUpDivToggleAction(listTag
											.find('div.limitedView,div.limitedView_Toggle'));

							// for each row..
							listTag
									.find('div[deid]')
									.each(
											function(i_div) {

												var divDimension = $(this);

												divDimension
														.append('<div class="hidden" type="CAT" ></div>'
																+ '<div class="hidden loading_CAT" ><img src="images/ui-anim_basic.gif"/></div>'
																+ '<div class="hidden" type="COGS" ></div>'
																+ '<div class="hidden loading_COGS" ><img src="images/ui-anim_basic.gif"/></div>'
																+ '<div class="hidden" type="DEGS" ></div>'
																+ '<div class="hidden loading_DEGS"><img src="images/ui-anim_basic.gif"/></div>');

												var deid = divDimension
														.attr('deid');
												var processed = divDimension
														.attr('processed');
												var catid = divDimension
														.attr('catid');
												var degsids = divDimension
														.attr('degsids');

												// console.log( 'deid: ' + deid
												// + '|' + processed );

												if (processed === undefined) {
													divDimension.attr(
															'processed', 'Y');

													me.populateDEGS(
															divDimension, deid,
															degsids, dataList);

													me
															.populateCAT(
																	divDimension,
																	deid,
																	catid,
																	dataList,
																	function(
																			categoryOptions) {
																		me
																				.populateCOGS(
																						divDimension,
																						deid,
																						categoryOptions,
																						dataList);
																	});
												}
											});

							return iStart + " to " + iEnd;
						},
						"tableTools" : {
							"sSwfPath" : "js/jquery/swf/copy_csv_xls_pdf.swf",
							"aButtons" : [ "copy", "csv", {
								"sExtends" : "xls",
								"sButtonText" : "Excel",
								"sFileName" : "*.xls"
							}, "pdf", "print" ]
						}
					});

			listTag.on('click', 'td', function() {

				var anchorTag = $(this).find('a.datapopup');

				if (anchorTag.length == 1) {
					me.dataElementPopup.form_Open(anchorTag.attr('dataid'));
				}
			});

		} else {
			oTable.fnClearTable();
			oTable.fnAddData(dataList);
			oTable.fnAdjustColumnSizing();
		}

		if (type == "DE_DS") {
			me.oTable_DE_ByDataSet = oTable;
		} else if (type == "DE") {
			me.oTable_DE_ByGroup = oTable;
		}
	}

	me.getValueDataTypeName = function(data, deData) {
		var typeName = "";

//		if (data == 'int')
//			typeName = 'Number';
//		else if (data == 'string') {
//			typeName = (deData !== undefined && deData.textType == "longText") ? "Long Text"
//					: "Text";
//		} else if (data == 'bool')
//			typeName = 'Yes/No';
//		else if (data == 'trueOnly')
//			typeName = 'Yes Only';
//		else if (data == 'date')
//			typeName = 'Date';
//		else if (data == 'username')
//			typeName = 'User Name';

		if (data == 'NUMBER')
			typeName = 'Number';
		else if (data == 'LONG_TEXT')
			typeName = "Long Text"
		else if (data == 'TEXT')
			typeName = "Text";
		else if (data == 'BOOLEAN')
			typeName = 'Yes/No';
		else if (data == 'TRUE_ONLY')
			typeName = 'Yes Only';
		else if (data == 'DATE')
			typeName = 'Date';
		else if (data == 'USERNAME')
			typeName = 'User Name';
		else
			typeName = data

		return typeName;
	}

	me.formatDimensions = function(dimensions) {
		var returnVal = "";

		if (dimensions !== undefined) {
			if (dimensions.DEGS !== undefined) {
				returnVal += dimensions.DEGS;
			}

			if (dimensions.CAT !== undefined) {
				returnVal += dimensions.CAT;
			}

			if (dimensions.COGS !== undefined) {
				returnVal += dimensions.COGS;
			}
		}

		return returnVal;
	}

	me.setData_DataList = function(deid, type, data, dataList) {
		$.each(dataList, function(i, item) {
			if (item.id == deid) {
				if (item.dimensions === undefined)
					item.dimensions = {};

				item.dimensions[type] = data;

				return false;
			}
		});
	}

	me.populateDEGS = function(divDimension, deid, degsids, dataList) {
		var retrieveCount = 0;
		var resultStr = "";

		var divTarget = divDimension.find('div[type="DEGS"]');
		var loadingTag = divDimension.find('.loading_DEGS');

		var idsArr = degsids.split(';');

		$
				.each(
						idsArr,
						function(i_deg, item_deg) {
							if (item_deg != "") {
								RESTUtil
										.getAsynchData(
												apiPath + 'dataElementGroups/'
														+ item_deg
														+ '.json?fields=id,name,dataElementGroupSet[id,name,dataDimension]',
												function(json_dataDetail) {
													if (json_dataDetail.dataElementGroupSet !== undefined
															&& json_dataDetail.dataElementGroupSet.dataDimension) {
														if (resultStr != "")
															resultStr += "<br>";

														resultStr += json_dataDetail.dataElementGroupSet.name
																+ '[DEGS] ';
													}
												}, function() {
												}, function() {
													if (retrieveCount == 0)
														loadingTag.show();

													retrieveCount++;
												}, function() {
													retrieveCount--;
													if (retrieveCount == 0) {
														loadingTag.hide();
														divTarget.show().html(
																resultStr);

														me.setData_DataList(
																deid, "DEGS",
																resultStr,
																dataList);

														// Set to
														// me.dataList[].dimension
													}
												});
							}
						});
	}

	me.populateCAT = function(divDimension, deid, catid, dataList, runFunc) {
		var retrieveCount = 0;
		var resultStr = "";
		var categoryOptions = [];
		var catComboData;

		var divTarget = divDimension.find('div[type="CAT"]');
		var loadingTag = divDimension.find('.loading_CAT');

		// var idStr = Util.getNotEmpty( divTarget.attr( 'id' ) );

		// Category Combo <-- Add to the ///

		if (catid != "") {
			// For Transposed Excel data, make list of unique catCombo List that
			// holds categoryOptionCombos:
			me.setCatComboData(catid, _catComboData);

			RESTUtil
					.getAsynchData(
							apiPath + 'categoryCombos/'
									+ catid
									+ '.json?fields=id,name,categories[id,name,categoryOptions[id,name]]' // ,categoryOptionCombos[id,name]'
							, function(json_dataDetail) {
								// catComboData = { id: catid, name:
								// json_dataDetail.name, catOptionCombos:
								// json_dataDetail.categoryOptionCombos };

								$.each(json_dataDetail.categories, function(
										i_cat, item_cat) {
									var catOptionNames = "";

									$.each(item_cat.categoryOptions, function(
											i_co, item_co) {
										categoryOptions.push({
											id : item_co.id,
											name : item_co.name
										});

										if (catOptionNames != "")
											catOptionNames += ", ";
										catOptionNames += item_co.name;
									});

									if (resultStr != "")
										resultStr += "<br>";

									resultStr += '<span title="'
											+ catOptionNames + '">'
											+ item_cat.name + '[CAT]</span> ';

								});
							}, function() {
							}, function() {
								if (retrieveCount == 0)
									loadingTag.show();

								retrieveCount++;
							}, function() {
								retrieveCount--;
								if (retrieveCount == 0) {
									loadingTag.hide();
									divTarget.show().html(resultStr);

									me.setData_DataList(deid, "CAT", resultStr,
											dataList);

									// Also, save category Combo Data for later
									// use.
									// me.setData_DataList( deid,
									// "catComboData", catComboData, dataList );

									runFunc(categoryOptions);
								}
							});

		}
	}

	// Create unique categoryCombo Data with categoryOptionCombos
	// - Used by Transpose Excel creation.
	me.setCatComboData = function(catid, catComboData) {
		if (catComboData[catid] === undefined) {
			// Set it as not 'undefined' since the request is made once (below)
			catComboData[catid] = {};

			RESTUtil
					.getAsynchData(
							apiPath + 'categoryCombos/'
									+ catid
									+ '.json?fields=id,name,categoryOptionCombos[id,name]',
							function(json_dataDetail) {
								catComboData[catid] = {
									id : catid,
									name : json_dataDetail.name,
									categoryOptionCombos : json_dataDetail.categoryOptionCombos
								};
							});
		}
	}

	me.populateCOGS = function(divDimension, deid, categoryOptions, dataList) {
		var retrieveCount = 0;
		var resultStr = "";

		var divTarget = divDimension.find('div[type="COGS"]');
		var loadingTag = divDimension.find('.loading_COGS');

		// Get cateogry option group set with '[COGS]'
		RESTUtil
				.getAsynchData(
						apiPath + 'categoryOptionGroups.json?paging=false&fields=id,name,categoryOptions[id,name],categoryOptionGroupSet[id,name,dataDimension]',
						function(json_dataDetail) {
							if (json_dataDetail.categoryOptionGroups !== undefined) {
								$
										.each(
												json_dataDetail.categoryOptionGroups,
												function(i_cos, item_cos) {
													// Check if the category has
													// option that matches..
													var matchFound = false;

													$
															.each(
																	item_cos.categoryOptions,
																	function(
																			i_co,
																			item_co) {
																		$
																				.each(
																						categoryOptions,
																						function(
																								i_co_src,
																								item_co_src) {
																							if (item_co_src.id == item_co.id) {
																								matchFound = true;
																								return false;
																							}
																						});

																		if (matchFound)
																			return false;
																	});

													if (matchFound
															&& item_cos.categoryOptionGroupSet !== undefined
															&& item_cos.categoryOptionGroupSet.dataDimension) {
														// Set category Option
														// Group Set
														if (resultStr != "")
															resultStr += "<br> ";

														resultStr += item_cos.categoryOptionGroupSet.name
																+ '[COGS] ';
													}

												});
							}
						}, function() {
						}, function() {
							if (retrieveCount == 0)
								loadingTag.show();

							retrieveCount++;
						}, function() {
							retrieveCount--;
							if (retrieveCount == 0) {
								loadingTag.hide();
								divTarget.show().html(resultStr);

								me.setData_DataList(deid, "COGS", resultStr,
										dataList);
							}
						});
	}

	me.setUp_DataTable_Indicator = function(type, listTag, dataList) {

		if (me.oTable_IND_ByGroup === undefined) {
			me.oTable_IND_ByGroup = listTag
					.dataTable({
						"data" : dataList,
						"columns" : [
								{
									data : 'indicatorGroupNames',
									"title" : "IND Group",
									"render" : function(data, type, full) {
										return (Util.checkValue(data)) ? data
												: '&lt;not assigned&gt;';
									}
								},
								{
									data : 'name',
									"title" : "IND Name",
									"render" : function(data, type, full) {
										return "<a href='' class='datapopup' dataid='"
												+ full.id
												+ "'>"
												+ data
												+ "</a>";
									}
								},
								{
									data : 'id',
									"title" : "UID",
									"render" : function(data, type, full) {
										return '<span class="tdSmall">' + data
												+ '</span>';
									}
								},
								{
									data : 'numeratorDescription',
									"title" : "Numberator Description"
								},
								{
									data : 'denominatorDescription',
									"title" : "Denominator Description"
								},
								{
									data : 'description',
									"title" : "DE Description",
									"render" : function(data, type, full) {
										return '<div class="limitedView">'
												+ data
												+ '</div><div class="limitedView_Toggle">...... More ......</div>';
									}

								} ],
						"order" : [ [ 0, "asc" ], [ 1, "asc" ] ],
						"aLengthMenu" : [ [ 25, 50, 100, -1 ],
								[ 25, 50, 100, "All" ] ],
						"iDisplayLength" : 25,
						"dom" : 'T<"clear">lfrtip',
						"fnInfoCallback" : function(oSettings, iStart, iEnd,
								iMax, iTotal, sPre) {

							me.setDivOriginalHeights(listTag
									.find('div.limitedView'));

							me
									.setUpDivToggleAction(listTag
											.find('div.limitedView,div.limitedView_Toggle'));

							return iStart + " to " + iEnd;
						},
						"tableTools" : {
							"sSwfPath" : "js/jquery/swf/copy_csv_xls_pdf.swf",
							"aButtons" : [ "copy", "csv", {
								"sExtends" : "xls",
								"sButtonText" : "Excel",
								"sFileName" : "*.xls"
							}, "pdf", "print"

							]
						}
					});

		} else {
			me.oTable_IND_ByGroup.fnClearTable();
			me.oTable_IND_ByGroup.fnAddData(dataList);
			me.oTable_IND_ByGroup.fnAdjustColumnSizing();
		}

		listTag.find("a.datapopup").click(function() {
			me.indicatorPopup.form_Open($(this).attr('dataid'));

			return false;
		});

		// return oTable;
	}

	me.setUp_RunClick_DataSetDataElement = function(btnTag) {
		btnTag.click(function() {
			me.dataElementListDivTag.hide();

			me.getDataElementList(me.dataSetSelectedId, 'loadingMsgDiv',
					function(json_deDataList) {
						me.retrieveAndPopulateData('DE_DS', json_deDataList,
								'loadingMsgDiv', me.tbDataElementListTag,
								me.dataElementListDivTag);
					});
		});
	}

	// -- Setup Methods
	// ---------------------------------------


	

	me.getParameters = function() {
		// Get parameters and set as class variable to access later
		me.paramTab = Util.getParameterByName("Tab");
		me.paramSearchValue = Util.getParameterByName("Value");
		me.paramSearchType = Util.getParameterByName("Type");

		me.paramOption = Util.getParameterByName("Option");
	}

	me.setTabByParameter = function() {
		if (me.paramTab != '') {
			var tabIndex = 0;

			tabIndex = tabsMap.indexOf(me.paramTab)
			//We keep country although now it is for any org unit level in general in order to allow old links to keep working
			if (tabIndex == 6) {
				if (me.paramSearchType == 'DE'){
					tabIndex = 6;	
				}
				else{
					tabIndex = 7;
				}
			}

			$("#tabs").tabs();
			$("#tabs").tabs("option", "active", tabIndex);
		}
	}

	me.setParameterAction = function(tabSelection) {
		if (tabSelection == 'Country') {
			me.countryListTag.val(me.paramSearchValue);

			if (me.countryListTag.val() != '') {
				me.countryListTag.change();
				// ( me.countryListTag.val() != "" ) ? Util.disableTag(
				// me.retrieveData_CountryTag, false ) : Util.disableTag(
				// me.retrieveData_CountryTag, true );

				me.retrieveData_CountryTag.click();
			}
		} else if (tabSelection == 'DataSet') {
			// Set DataSet value
			me.dataSetFullListTag.val(me.paramSearchValue);

			if (me.dataSetFullListTag.val() != '') {
				me.dataSetFullListTag.change();
				// me.selectDataSet( me.dataSetFullListTag.val() );

				me.getDataElementsBtnTag.click();
			}
		} else if (tabSelection == 'Group') {
			// Select the type first
			me.groupTypeTag.val(me.paramSearchType);

			me.groupTypeTag.change();

			// Get callback somehow??
			if (me.paramSearchValue != '') {
				me.setGroupParameterSelection = true;
			}
			// Or setup the event?
		}

	}
	
	var getObjectIdFromCreateRequest = function(data, statusText, xhr) { 
		return statusText == "success" && data.response ? data.response.uid : null;
	}
	
	var executeSqlView = function(sqlViewId) {
		return RESTUtil
			.post(apiPath + "sqlViews/" + sqlViewId + "/execute")
			.then(function(data, statusText, xhr) { return statusText == "success" ? sqlViewId : null; })
	}
	
	me.createSqlView = function(sqlView) {
		return RESTUtil.get(apiPath + "sqlViews", {filter: "displayName:eq:" + sqlView.name})
			.then(function(data) {
				if (_.isEmpty(data.sqlViews)) {
					return RESTUtil.post(apiPath + "sqlViews", sqlView)
						.then(getObjectIdFromCreateRequest)
						.then(executeSqlView);
				} else {
					return data.sqlViews[0].id;
				}
			});
	}; 
	
	me.createUserRole = function(userRole) {
		return RESTUtil.get(apiPath + "userRoles", {filter: "name:eq:" + userRole.name})
			.then(function(data) {
				if (_.isEmpty(data.userRoles)) {
					return RESTUtil.post(apiPath + "userRoles", userRole)
						.then(getObjectIdFromCreateRequest);
				} else {
					return data.userRoles[0].id;
				}
			});
	}

	me.setup = function(afterFunc) {
		$.when(
			me.createSqlView(me.sqlViews.dashboard_list),
			me.createSqlView(me.sqlViews.dashboard_join),
			me.createUserRole(me.adminRole)
		).then(function(dashboardListId, dashboardJoinId, adminRoleId) {
			var defaultSettings = _.pick({
				"dashboardList": dashboardListId,
				"dashboardJoin": dashboardJoinId
			}, _.identity);
			afterFunc(defaultSettings);
		});
	} 

	// ---------------------------------------
	// -- Initial Run

	me.initialRun = function(defaultSettings) {
		
		// Parameter Get and Set Tab.
		me.getParameters();
		me.setTabByParameter();

		// Organization Unit TAb 
		setup_SearchByOrgUnit(me);

		// Dataset & Programs Tab
		me.setup_SearchByDataSet(function() {
			if (me.paramTab == 'DataSet')
				me.setParameterAction(me.paramTab);
		});

		$('a[href="#tabs-3"]').click(function(){
			if (!$('#infoList_Analytics').is(":visible")){
				$('#infoList_Analytics').show();
				setup_Analytics(me, function() {});	
			}
		});
		
		me.settingDataPopupForm = new SettingDataPopupForm(me, defaultSettings, function() {
		  // Analytics Tab (as it is quite demanding in terms of js processing it is loaded on tab click)
		  if (me.paramTab == 'Dashboard')
			  $('a[href="#tabs-3"]').trigger( "click" );
		
		  // Data Elements Groups Tab
		  setup_SearchByGroup(me, "DE", $('#tabs-7'), function() {
			  if (me.paramTab == 'Group' && me.paramSearchType == 'DE')
				  me.setParameterAction(me.paramTab);
		  });
		
		  // Indicator Groups Tab
		  setup_SearchByGroup(me, "IND", $('#tabs-8'), function() {
			  if (me.paramTab == 'Group' && me.paramSearchType == 'IND')
				  me.setParameterAction(me.paramTab);
		  });

		  me.setupTopSection();
		});
	}
		
	// -- Initial Run
	// ---------------------------------------
	
	me.setup(me.initialRun);
}

// Return server info. 
// See https://docs.dhis2.org/master/en/developer/html/webapi_system_resource.html
getServerInfo = function(rootPath, onSuccess) {
	RESTUtil.getAsynchData(rootPath + "/api/system/info", onSuccess);
}

// Return the newest version path of the API known to work. Return null if server unsupported.
getApiVersionPath = function(serverVersion) {
	var versionDigits = Util.splitVersionString(serverVersion || "", 2);
	if (versionDigits[0] >= 2 && versionDigits[1] >= 25) {
		return "25";
	} else { 
		return null;
	}
};
