var apiPath = "../../dhis/api/";
//var apiPath = "http://james.psi-mis.org/api/"


var _queryURL_getOrgUnit = apiPath + "organisationUnits";

var _dataManager;
var _catComboData = {};

// ======================================================
// Document Ready Run

$(document).ready(function() {

	$("#tabs").tabs();

	_dataManager = new DataManager();

});

// -------------------------------------------
// -- Data Element Manager Class

function DataManager() {
	var me = this;

	me.queryURL_DataElementGet = apiPath + "dataElements/";
	me.queryURL_IndicatorGet = apiPath + "indicators/";
	me.queryURL_DataElementListGet = apiPath + "dataElements.json?paging=false";
	me.queryURL_DataSetListGet = apiPath + "dataSets.json?paging=false";
	me.queryURL_DataSetDetailGet = apiPath + "dataSets/";

	me.queryURL_getCountries = apiPath + "organisationUnits.json?level=3";

	me.dataElementPopup = new DataElementPopup();
	me.indicatorPopup = new IndicatorPopup();

	me.contentDivTag = $('#content');
	me.trDataSetSelectionTag = $('#trDataSetSelection');
	me.dataSetFullListTag = $('#dataSetFullList');
	me.dataSetSearchTag = $('#dataSetSearch');

	me.getDataElementsBtnTag = $('#getDataElementsBtn');

	me.tbDataElementListTag = $('#tbDataElementList');
	me.dataElementListDivTag = $('#dataElementList');

	// 
	me.dataListDEDiv_byGroupTag = $('#dataListDE_byGroup');
	me.tbDataListDE_byGroupTag = $('#tbDataListDE_byGroup');
	me.dataListINDDiv_byGroupTag = $('#dataListIND_byGroup');
	me.tbDataListIND_byGroupTag = $('#tbDataListIND_byGroup');

	// Group related tags
	me.groupTypeTag = $('#groupType');
	me.divGroupListTag = $('#divGroupList');
	me.divGroupLoadingTag = $('#divGroupLoading');
	me.divRetrieveData_byGroupTag = $('#divRetrieveData_byGroup');

	me.groupListTag = $('#groupList');
	me.retrieveData_byGroupTag = $('#retrieveData_byGroup');

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
	
//	me.infoList_ProgramTableTag = $('#infoList_Program');

	me.countDownTag = $('#defaultCountdown');

	me.loadingCount = 0;

	me.dataListWithDetail = [];

	// --------------------------------------
	// Methods

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
			runFunc(data.dataElements);
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
					+ item_data.id + ".json", function(json_dataDetail) {
				me.dataListWithDetail.push(json_dataDetail);
			}, function() {
			}, function() {
				QuickLoading.dialogShowAdd(loadingTagName);
			}, function() {
				QuickLoading.dialogShowRemove(loadingTagName);
			}));

		});

		// Step 3a. Sort the person by name
		$.when
				.apply($, deferredArrActions_getData)
				.then(
						function() {

							me.dataListWithDetail = Util.sortByKey(
									me.dataListWithDetail, "name");

							if (type == "DE_DS" || type == "DE") {
								me
										.dataElementDataModify(
												me.dataListWithDetail,
												loadingTagName,
												function() {

													me
															.setUp_DataTable_DataElement(
																	type,
																	tbListTag,
																	me.dataListWithDetail);

													// Display the section.
													listDivTag.show();

													me
															.setDivOriginalHeights(tbListTag
																	.find('div.limitedView'));

													me
															.setUpDivToggleAction(tbListTag
																	.find('div.limitedView,div.limitedView_Toggle'));

													me
															.setUp_TransposedExcelBtn(
																	tbListTag,
																	me.dataListWithDetail);

													if (me.paramOption == "DE") {
														me
																.setUp_DEAttributeValueExcelBtn(
																		tbListTag,
																		me.dataListWithDetail);
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

							if (item_dataSet.name.search(new RegExp(
									request.term, 'i')) == 0) {
								dstsSetListFound.push({
									"id" : item_dataSet.id,
									"label" : item_dataSet.name,
									"value" : item_dataSet.name,
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
									data : 'categoryComboName',
									"title" : "Disaggregation (Cat Combo)"
								},
								{
									data : 'id',
									"title" : "Dimensions",
									"render" : function(data, type, full) {

										var catId = (full.categoryComboName != ""
												&& full.categoryComboName != "default" && full.categoryComboId != "") ? full.categoryComboId
												: "";

										// For 'default', set the catcombo.
										if (full.categoryComboName == "default")
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
									data : 'type',
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

		if (data == 'int')
			typeName = 'Number';
		else if (data == 'string') {
			typeName = (deData !== undefined && deData.textType == "longText") ? "Long Text"
					: "Text";
		} else if (data == 'bool')
			typeName = 'Yes/No';
		else if (data == 'trueOnly')
			typeName = 'Yes Only';
		else if (data == 'date')
			typeName = 'Date';
		else if (data == 'username')
			typeName = 'User Name';

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
							"sSwfPath" : "js/query/swf/copy_csv_xls_pdf.swf",
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

	// ---------------------------------------
	// -- 'Search by Country' related

	me.populateCountryList = function(listTag, loadingTagName, afterFunc) {
		listTag.empty();

		RESTUtil.getAsynchData(me.queryURL_getCountries, function(json_Data) {
			var json_DataOrdered = Util.sortByKey(json_Data.organisationUnits,
					"name");

			Util.populateSelect(listTag, "Country", json_DataOrdered);

			afterFunc();
		}, function() {
			alert('Failed to load country list.');
		}, function() {
			QuickLoading.dialogShowAdd(loadingTagName);
		}, function() {
			QuickLoading.dialogShowRemove(loadingTagName);
		});

	}

	me.setup_SearchByCountry = function(afterFunc) {

		// Populate Country List
		me.populateCountryList(me.countryListTag, 'countriesLoading',
						afterFunc);

		// Set up the events
		me.countryListTag.change(function() {
			($(this).val() != "") ? Util.disableTag(me.retrieveData_CountryTag,
					false) : Util.disableTag(me.retrieveData_CountryTag, true);
		});

		me.retrieveData_CountryTag
				.click(function() {
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
					//me.infoList_SummaryTableTag.find('tr.data').remove();
					me.infoList_DataSetTableTag.find('tr.data').remove();
					me.infoList_EventTableTag.find('tr.data').remove();
					me.infoList_TrackerTableTag.find('tr.data').remove();
					me.infoList_OrgUnitGroupTableTag.find('tr.data').remove();
					me.infoList_UserTableTag.find('tr.data').remove();
					
					//Summary Variables
					me.summary = {numberOfDatasets: 0, numberOfEvents: 0, numberOfTrackers: 0, orgUnitGroups: new Array(), users: 0};

					var requestUrl_OrgUnits = apiPath + 'organisationUnits/' + me.countryListTag.val() + '.json?includeDescendants=true&fields=id,organisationUnitGroups[id],users[id,name]';

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
																		+ '.json?fields=id,name,,description,dataSetType,dataElements[id],organisationUnits[id,level]';

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
																							me.summary.numberOfDatasets++;
																							
																							var organizationUnitByLevel = "";
																							for (var level in foundOrgUnits){
																								organizationUnitByLevel += "L" + level + ": " + foundOrgUnits[level] + "</br>";
																							}
																							
																							var isCustomDataset = (json_dataSet.dataSetType == 'custom')?'Y':'N';
																							
																							var contentText = '<tr class="data">'
																									+ '<td><a href="" class="dataSetLink" dsid="'
																									+ json_dataSet.id
																									+ '">'
																									+ '<b>' + json_dataSet.name + '</b></br>'
																									+ Util.getNotEmpty(json_dataSet.description)
																									+ '</a></td>'
																									+ '<td class="tdCenter">'
//																									+ foundCount
																									+ organizationUnitByLevel
																									+ '</td>'
																									+ '<td class="tdCenter">'
																									+ json_dataSet.dataElements.length
																									+ '</td>'
																									+ '<td class="tdCenter">'
																									+ isCustomDataset
																									+ '</td>'
																									+ '<td class="tdCenter notReady">'
																									+ 'not implemented yet'
																									+ '</td>'
																									+ '</tr>';

																							me.infoList_DataSetTableTag
																									.append(contentText);

																							// Add event to this row.
																							me.SetDataSetLinkAction(me.infoList_DataSetTableTag);

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
																						me.checkRequestCount(requestCount);
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
												
												var contentText = '<tr class="data">'
													+ '<td>'
													+ item_countryUsers.name
													+ '</td>'
													+ '</tr>';

												me.infoList_UserTableTag.append(contentText);
											});
											
											$.each(item_countryOU.organisationUnitGroups,
													function(i_countryOUG,item_countryOUG) {
											
												if(me.summary.orgUnitGroups.indexOf(item_countryOUG.id) == -1){
													//Update organization unit groups summary
													me.summary.orgUnitGroups.push(item_countryOUG.id);
													
												
													var requestUrl_orgUnitGroupsLists = apiPath + 'organisationUnitGroups/' + item_countryOUG.id + '.json?fields=id,name,lastUpdated,organisationUnitGroupSet[id],organisationUnits';
													RESTUtil.getAsynchData(requestUrl_orgUnitGroupsLists,	
														function(json_ougList) {
															var belongsToGroupSet = (json_ougList.organisationUnitGroupSet.id == undefined)?'N':'Y';
														
															var lastUpdatedDate = new Date(json_ougList.lastUpdated);
															var lastUpdatedDateFormatted = $.format.date(lastUpdatedDate, "dd-MM-yyyy" );

															var contentText = '<tr class="data">'
																	+ '<td>'
																	+ '<b>' + json_ougList.name + '</b></br>'
																	+ Util.getNotEmpty(json_ougList.description)
																	+ '</a></td>'
																	+ '<td class="tdCenter">'
																	+ json_ougList.organisationUnits.length
																	+ '</td>'
																	+ '<td class="tdCenter">'
																	+ belongsToGroupSet
																	+ '</td>'
																	+ '<td class="tdCenter">'
																	+ lastUpdatedDateFormatted
																	+ '</td>'
																	+ '</tr>';
				
															me.infoList_OrgUnitGroupTableTag.append(contentText);
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
															me.checkRequestCount(requestCount);
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
																				
																				var contentText = '<tr class="data">'
																					+ '<td>'
																					+ '<b>' + item_program.name + '</b></br>'
																					+ Util.getNotEmpty(item_program.description)
																					+ '</td>'
																					+ '<td class="tdCenter">'
																					+ organizationUnitByLevel
																					+ '</td>'
																					+ '<td class="tdCenter">'
																					+ deCount
																					+ '</td>' // item_program.dataElements.length
																					+ '<td class="tdCenter">'
																					+ isCustomEvent
																					+ '</td>'
																					+ '<td class="tdCenter notReady">'
																					+ 'not currently possible'
																					+ '</td>'
																					+ '</tr>';
																				
																				me.infoList_EventTableTag.append(contentText);
																				me.summary.numberOfEvents++;
																			} else if (item_program.type == 1) {
																				var contentText = '<tr class="data">'
																					+ '<td>'
																					+ '<b>' + item_program.name + '</b></br>'
																					+ Util.getNotEmpty(item_program.description)
																					+ '</td>'
																					+ '<td class="tdCenter">'
																					+ organizationUnitByLevel
																					+ '</td>'
																					+ '<td class="tdCenter">'
																					+ deCount
																					+ '</td>' // item_program.dataElements.length
																					+ '<td class="tdCenter">'
																					+ 'not implemented yet'
																					+ '</td>'
																					+ '<td class="tdCenter notReady">'
																					+ 'not currently possible'
																					+ '</td>'
																					+ '</tr>';
																				
																				me.infoList_TrackerTableTag.append(contentText);
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
															me.checkRequestCount(requestCount);

														});

										// Remove one for middle stopping case.
										QuickLoading.dialogShowRemove(loadingTagName);
//										requestCount--;
//										me.checkRequestCount(requestCount);

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
										me.checkRequestCount(requestCount);
									});

					// me.checkRequestCount( requestCount );
					
					

				});
	}

	me.checkRequestCount = function(requestCount) {
		if (requestCount == 0) {
			me.infoList_SummaryTableTag.find("#dataSets_InfoList_Summary").text(me.summary.numberOfDatasets);
			me.infoList_SummaryTableTag.find("#trackers_InfoList_Summary").text(me.summary.numberOfTrackers);
			me.infoList_SummaryTableTag.find("#events_InfoList_Summary").text(me.summary.numberOfEvents);
			me.infoList_SummaryTableTag.find("#orgUnitGroups_InfoList_Summary").text(me.summary.orgUnitGroups.length);
			me.infoList_SummaryTableTag.find("#users_InfoList_Summary").text(me.summary.users);
			
			me.countDownTag.countdown('pause');
			$('#defaultCountdownSpan').text('Time it Took: ');
		}
	}

	me.SetDataSetLinkAction = function(tableTag) {
		var trCurrent = tableTag.find('tr:last');

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

	// ---------------------------------------
	// -- 'Search by Group' related

	// 'dataElement Groups' list
	me.populateGroupList = function(groupType, listTag, loadingTag, execFunc) {
		listTag.empty();

		var groupTypeName = "";
		var urlName = "";

		if (groupType == "DE") {
			groupTypeName = "DataElement";
			urlName = "dataElementGroups";
		} else if (groupType == "IND") {
			groupTypeName = "Indicator";
			urlName = "indicatorGroups";
		}

		RESTUtil
				.getAsynchData(
						apiPath + urlName
								+ '.json?paging=false&fields=id,name',
						function(json_Data) {
							var json_DataList = (groupType == "IND") ? json_Data.indicatorGroups
									: json_Data.dataElementGroups;

							var json_DataOrdered = Util.sortByKey(
									json_DataList, "name");

							Util.populateSelect(listTag, groupTypeName
									+ " Group", json_DataOrdered);

							execFunc();
						}, function() {
							alert('Failed to load ' + groupTypeName
									+ ' group list.');
						}, function() {
							loadingTag.show();
						}, function() {
							loadingTag.hide();
						});

	}

	me.setup_SearchByGroup = function(tabTag, afterFunc) {
		var speed = 400;

		me.groupTypeTag.change(function() {
			var selectTag = $(this);

			// Hide everything and clean the data
			me.divGroupListTag.hide(speed);
			me.divGroupLoadingTag.hide(speed);
			me.divRetrieveData_byGroupTag.hide(speed);
			me.groupListTag.empty();

			if (selectTag.val() != "") {
				me.populateGroupList(selectTag.val(), me.groupListTag,
						me.divGroupLoadingTag, function() {
							me.divGroupListTag.show(speed);

							// If parameter value was set, call this once
							if (me.setGroupParameterSelection) {
								me.setGroupParameterSelection = false;

								// select the groupListTag
								me.groupListTag.val(me.paramSearchValue);

								if (me.groupListTag.val() != '') {
									me.groupListTag.change();

									me.retrieveData_byGroupTag.click();
								}
							}

						});
			}
		});

		me.groupListTag.change(function() {
			var selectTag = $(this);

			if (selectTag.val() == "") {
				me.divRetrieveData_byGroupTag.hide(speed);
			} else {
				me.divRetrieveData_byGroupTag.show(speed);
			}
		});

		me.retrieveData_byGroupTag.click(function() {
			var groupType = me.groupTypeTag.val();

			me.dataListDEDiv_byGroupTag.hide();
			me.dataListINDDiv_byGroupTag.hide();

			me.getDataList_byGroup(groupType, me.groupListTag.val(),
					'loadingMsgDiv_byGroup', function(json_dataList) {
						if (groupType == "DE") {
							me.retrieveAndPopulateData(groupType,
									json_dataList, 'loadingMsgDiv_byGroup',
									me.tbDataListDE_byGroupTag,
									me.dataListDEDiv_byGroupTag);
						} else if (groupType == "IND") {
							me.retrieveAndPopulateData(groupType,
									json_dataList, 'loadingMsgDiv_byGroup',
									me.tbDataListIND_byGroupTag,
									me.dataListINDDiv_byGroupTag);
						}

					});
		});

		afterFunc();

	}

	me.getGroupTypeData = function(typeId, dataType, data) {
		if (typeId == "DE") {
			if (dataType == "queryUrl") {
				return "dataElementGroups"
			} else if (dataType == "data") {
				return data.dataElements;
			} else if (dataType == "name") {
				return "dataElement";
			}

		} else if (typeId == "IND") {
			if (dataType == "queryUrl") {
				return "indicatorGroups"
			} else if (dataType == "data") {
				return data.indicators;
			} else if (dataType == "name") {
				return "indicator";
			}

		}
	}

	me.getDataList_byGroup = function(groupType, groupId, loadingTagName,
			runFunc) {
		RESTUtil.getAsynchData(apiPath
				+ me.getGroupTypeData(groupType, "queryUrl") + '/' + groupId
				+ '.json', function(data) {
			runFunc(me.getGroupTypeData(groupType, "data", data));
		}, function() {
			alert('Failed to retrieve '
					+ me.getGroupTypeData(groupType, "name") + ' list.');
		}, function() {
			QuickLoading.dialogShowAdd(loadingTagName);
		}, function() {
			QuickLoading.dialogShowRemove(loadingTagName);
		});
	}

	// -- 'Search by Group' related
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

			if (me.paramTab == 'DataSet') {
				tabIndex = 0;
			} else if (me.paramTab == 'Country') {
				tabIndex = 1;
			} else if (me.paramTab == 'Group') {
				tabIndex = 2;
			}

			$("#tabs").tabs();
			$("#tabs").tabs("option", "active", tabIndex);

		}
	}

	me.setParameterAction = function(tabSelection) {
		if (tabSelection == 'DataSet') {
			// Set DataSet value
			me.dataSetFullListTag.val(me.paramSearchValue);

			if (me.dataSetFullListTag.val() != '') {
				me.dataSetFullListTag.change();
				// me.selectDataSet( me.dataSetFullListTag.val() );

				me.getDataElementsBtnTag.click();
			}
		} else if (tabSelection == 'Country') {
			me.countryListTag.val(me.paramSearchValue);

			if (me.countryListTag.val() != '') {
				me.countryListTag.change();
				// ( me.countryListTag.val() != "" ) ? Util.disableTag(
				// me.retrieveData_CountryTag, false ) : Util.disableTag(
				// me.retrieveData_CountryTag, true );

				me.retrieveData_CountryTag.click();
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

	// ---------------------------------------
	// -- Initial Run

	me.initialRun = function() {

		// Parameter Get and Set Tab.
		me.getParameters();
		me.setTabByParameter();

		me.setup_SearchByDataSet(function() {
			if (me.paramTab == 'DataSet')
				me.setParameterAction(me.paramTab);
		});

		me.setup_SearchByCountry(function() {
			if (me.paramTab == 'Country')
				me.setParameterAction(me.paramTab);
		});

		me.setup_SearchByGroup($('#tabs-3'), function() {
			if (me.paramTab == 'Group')
				me.setParameterAction(me.paramTab);
		});

	}

	// -- Initial Run
	// ---------------------------------------

	// Methods
	// --------------------------

	// Initial Run Call
	me.initialRun();

}

// -- Data Element Manager Class
// -------------------------------------------



// =========================================================
// Static Classes


