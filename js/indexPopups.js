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
// -------------------------------------------
// Data Element (Detail) Popup Class
function DataElementPopup() {
	var me = this;

	me.queryURL_DataElements = apiPath + "dataElements";
	me.queryURL_Attributes = apiPath + "attributes.json?paging=false&filter=dataElementAttribute:eq:true&fields=id,name";

	me.dialogFormTag = $("#dataElementPopupForm");
	me.tableTag = $('#dataElementDetailTable');

	me.tagId = '#dataElementDetailDiv';
	me.tag = $(me.tagId);
	me.tagIdFront = me.tagId + ' ';

	me.width = 700;
	me.height = 600;

	me.formPopupSetup = function() {
		// -- Set up the form -------------------
		me.dialogFormTag.dialog({
			autoOpen : false,
			width : me.width,
			height : me.height,
			modal : true
		});
	}

	me.form_Open = function(deId, user, section) {

		me.tableTag.find('tr').remove();

		me.tableSettings = new TableSettings(user, section + "-popup", 
					me.tableTag.closest(".ui-dialog"), null);

		// Load the Data Element Information
		me.load_DEData(deId, function(json_Data) {
			me.populateTable(json_Data, function() {
				me.tableSettings.setup();
				me.tableSettings.loadState(null);
			});
		});

		me.dialogFormTag.dialog("open");
	}

	me.load_DEData = function(id, execFunc) {
		RESTUtil.getAsynchData(me.queryURL_DataElements + '/' + id + '.json?fields=id,code,displayName,displayShortName,description,valueType,zeroIsSignificant,aggregationType,categoryCombo[id,name],lastUpdated,dataElementGroups[id,name],attributeValues[value,attribute[id,name]]',
				function(data) {
					execFunc(data);
				}, function(msg) {
					console.log('DataElement retrieval was unsuccessful.');
				});
	}

	me.loadAttributeData = function(execFunc) {
		RESTUtil.getAsynchData(me.queryURL_Attributes, function(data) {
			execFunc(data.attributes);
		}, function(msg) {
			console.log('Attributes retrieval was unsuccessful.');
		});
	}

	me.populateTable = function(jsonData, afterFun) {
		var table = me.tableTag;
		table.hide();

		table.append(me.getRowFormated("UID", me.formatJsonData(jsonData.id)));
		table.append(me
				.getRowFormated("Code", me.formatJsonData(jsonData.code)));
		table.append(me
				.getRowFormated("Name", me.formatJsonData(jsonData.displayName)));
		table.append(me.getRowFormated("Short name", me
				.formatJsonData(jsonData.displayShortName)));
		table.append(me.getRowFormated("Description", me
				.formatJsonData(jsonData.description),
				"height: 70px; vertical-align:top;"));
		table.append(me.getRowFormated("Value Type", me.formatValueType(me
				.formatJsonData(jsonData.valueType))));
		table.append(me.getRowFormated("Store Zero Data Value",
				me.formatBooleanVal(me
						.formatJsonData(jsonData.zeroIsSignificant))));
		table.append(me.getRowFormated("Aggregation Type", me
				.formatJsonData(jsonData.aggregationType)));
		table.append(me.getRowFormated("Disaggregation (Cat Combos)",
				jsonData.categoryCombo.name));
		// empty is not selected
		// table.append( me.getRowFormated( "Option set", getObjectName(
		// jsonData.optionSet ) ) );

		me.loadAttributeData(function(attributeList) {
			$.each(attributeList || [], function(i, item) {
				table.append(
					me.getRowFormated(item.name, me.getAttributeValue(item.id, jsonData.attributeValues),
					"background-color: #eee;")
				);
			});
			afterFun();
		});

		// table.append( me.getRowFormated( "Attributes", formatAttributes(
		// jsonData.attributes ) ) );
		table.append(me.getRowFormated("Data Element Groups", me
				.formatGroups(jsonData.dataElementGroups)));

		table.append(me.getRowFormated("Last Updated On", $.format.date(
				new Date(jsonData.lastUpdated), "yyyy-MM-dd hh:mm a")));

		var dateNow = new Date("2014-05-21T01:50:39.385+0000");

		// $( '#msgInfo' ).text( getFormattedDate2( dateNow ) );
		me.dialogFormTag.find('#msgInfo').text(
				$.format.date(dateNow, "yyyy-MM-dd "));
	}

	me.getObjectName = function(valueObj) {
		var returnVal = "";

		if (valueObj !== undefined && valueObj != null && valueObj != "null"
				&& valueObj.name !== undefined) {
			returnVal = valueObj.name;
		}

		return returnVal;
	}

	me.formatValueType = function(value) {
		if (value == "string")
			value = "Text";
		else if (value == "int")
			value = "Number";
		else if (value == "trueOnly")
			value = "Yes Only";
		else if (value == "bool")
			value = "Yes/No";
		else if (value == "date")
			value = "Date";
		else if (value == "username")
			value = "User Name";

		return value;
	}

	me.formatBooleanVal = function(value) {
		var returnVal = "";

		if (value) {
			returnVal = "Yes";
		} else {
			returnVal = "No";
		}

		return returnVal;
	}

	me.formatAggregation = function(valueObj) {
		var returnVal = "";

		if (valueObj === undefined) {
			returnVal = "not selected";
		} else {
			returnVal = "selected"; // : " + JSON.stringify( valueObj );
		}

		return returnVal;
	}

	me.formatAnchor = function(url) {
		var returnVal = "";

		if (url.length > 0) {
			returnVal = "<a href='" + url + "' target='_blank'>" + url + "</a>";
		}

		return returnVal;
	}

	me.getAttributeValue = function(attributeId, attributes) {
		var returnVal = "";

		if (attributes !== undefined) {
			$.each(attributes, function(i, item) {

				if (item.attribute.id == attributeId) {
					returnVal = item.value;
				}
			});
		}

		return returnVal;
	}

	me.formatAttributes = function(jsonData) {
		var returnVal = "";

		if (jsonData !== undefined) {
			$.each(jsonData, function(i, item) {

				returnVal += item.attribute.name + ": " + item.value + "<br>";
			});
		}

		return returnVal;
	}

	me.formatGroups = function(jsonData) {
		var returnVal = "";

		if (jsonData !== undefined) {
			$.each(jsonData, function(i, item) {

				returnVal += item.name + "<br>";
			});
		}

		return returnVal;
	}

	me.formatJsonData = function(data) {
		if (data !== undefined) {
			return data;
		} else {
			return "";
		}
	}

	me.getRowFormated = function(title, content, style) {
		if (style === undefined) {
			style = '';
		}

		if (content === undefined) {
			content = '';
		}

		return '<tr style="' + style + '">'
				+ '<td class="title" width="140px">' + title + '</td>'
				+ '<td class="content">' + content + '</td>' + '</tr>';
	}

	// Initial Setup Call
	me.initialSetup = function() {
		me.formPopupSetup();
	}

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();
}

// -------------------------------------------
// Data Element (Detail) Popup Class

// -------------------------------------------
// Indicator (Detail) Popup Class
function IndicatorPopup() {
	var me = this;

	me.queryURL_Indicators = apiPath + "indicators";
	me.queryURL_Attributes = apiPath + "attributes.json?paging=false&filter=indicatorAttribute:eq:true&fields=id,name";

	me.dialogFormTag = $("#indicatorPopupForm");
	me.tableTag = $('#indicatorDetailTable');

	me.tagId = '#indicatorDetailDiv';
	me.tag = $(me.tagId);
	me.tagIdFront = me.tagId + ' ';

	me.width = 700;
	me.height = 600;

	me.formPopupSetup = function() {
		// -- Set up the form -------------------
		me.dialogFormTag.dialog({
			autoOpen : false,
			width : me.width,
			height : me.height,
			modal : true
		});
	}

	me.form_Open = function(id, user, section) {

		me.tableTag.find('tr').remove();

		me.tableSettings = new TableSettings(user, section + "-popup", 
			me.tableTag.closest(".ui-dialog"), null);

		// Load the Data Element Information
		me.load_Data(id, function(json_Data) {
			me.populateTable(json_Data, function() {
				me.tableSettings.setup();
				me.tableSettings.loadState(null);
			});
		});

		me.dialogFormTag.dialog("open");
	}

	me.load_Data = function(id, execFunc) {
		RESTUtil.getAsynchData(me.queryURL_Indicators + '/' + id + '.json?fields=id,code,displayName,displayShortName,description,annualized,numerator,denominator,numeratorDescription,denominatorDescription,categoryCombo[id,name],lastUpdated,indicatorGroups[id,name],indicatorType[id,name],dataSets[id,name],attributeValues[value,attribute[id,name]]',
				function(data) {
					execFunc(data);
				}, function(msg) {
					console.log('Indicator retrieval was unsuccessful.');
				});
	}

	me.loadAttributeData = function(execFunc) {
		RESTUtil.getAsynchData(me.queryURL_Attributes, function(data) {
			execFunc(data.attributes);
		}, function(msg) {
			console.log('Attributes retrieval was unsuccessful.');
		});
	};

	me.populateTable = function(jsonData, afterFun) {

		var table = me.tableTag;
		table.hide();

		table.append(me.getRowFormated("UID", me.formatJsonData(jsonData.id)));
		// table.append( me.getRowFormated( "Code", me.formatJsonData(
		// jsonData.code ) ) );
		table.append(me
				.getRowFormated("Name", me.formatJsonData(jsonData.name)));
		table.append(me.getRowFormated("Short name", me
				.formatJsonData(jsonData.displayShortName)));
		table.append(me.getRowFormated("Display name", me
				.formatJsonData(jsonData.displayName)));
		table.append(me.getRowFormated("Description", me
				.formatJsonData(jsonData.description),
				"height: 70px; vertical-align:top;"));

		table.append(me.getRowFormated("Denominator Description", me
				.formatJsonData(jsonData.denominatorDescription)));
		table.append(me.getRowFormated("Numerator Description", me
				.formatJsonData(jsonData.numeratorDescription)));
		table.append(me.getRowFormated("Denominator", me
				.formatJsonData(jsonData.denominator)));
		table.append(me.getRowFormated("Numerator", me
				.formatJsonData(jsonData.numerator)));

		table.append(me.getRowFormated("Annualized", me.formatBooleanVal(me
				.formatJsonData(jsonData.annualized))));

		table.append(me.getRowFormated("Indicator Type", me
				.getObjectName(jsonData.indicatorType)));

		table.append(me.getRowFormated("Indicator Groups", me
				.formatGroups(jsonData.indicatorGroups)));

		table.append(me.getRowFormated("DataSets", me
				.formatGroups(jsonData.dataSets)));

		table.append(me.getRowFormated("Last Updated On", $.format.date(
				new Date(jsonData.lastUpdated), "yyyy-MM-dd hh:mm a")));

		var dateNow = new Date("2014-05-21T01:50:39.385+0000");

		// $( '#msgInfo' ).text( getFormattedDate2( dateNow ) );
		me.dialogFormTag.find('#msgInfo').text(
				$.format.date(dateNow, "yyyy-MM-dd "));

		me.loadAttributeData(function(attributeList) {
			$.each(attributeList || [], function(i, item) {
				table.append(
					me.getRowFormated(item.name, me.getAttributeValue(item.id, jsonData.attributeValues),
					"background-color: #eee;")
				);
			});
			afterFun();
		});
	}

	me.getObjectName = function(valueObj) {
		var returnVal = "";

		if (valueObj !== undefined && valueObj != null && valueObj != "null"
				&& valueObj.name !== undefined) {
			returnVal = valueObj.name;
		}

		return returnVal;
	}

	me.formatValueType = function(value) {
		if (value == "string")
			value = "Text";
		else if (value == "int")
			value = "Number";
		else if (value == "trueOnly")
			value = "Yes Only";
		else if (value == "bool")
			value = "Yes/No";
		else if (value == "date")
			value = "Date";
		else if (value == "username")
			value = "User Name";

		return value;
	}

	me.formatBooleanVal = function(value) {
		var returnVal = "";

		if (value) {
			returnVal = "Yes";
		} else {
			returnVal = "No";
		}

		return returnVal;
	}

	me.formatAnchor = function(url) {
		var returnVal = "";

		if (url.length > 0) {
			returnVal = "<a href='" + url + "' target='_blank'>" + url + "</a>";
		}

		return returnVal;
	}

	me.getAttributeValue = function(attributeId, attributes) {
		var returnVal = "";

		if (attributes !== undefined) {
			$.each(attributes, function(i, item) {

				if (item.attribute.id == attributeId) {
					returnVal = item.value;
				}
			});
		}

		return returnVal;
	}

	me.formatGroups = function(jsonData) {
		var returnVal = "";

		if (jsonData !== undefined) {
			$.each(jsonData, function(i, item) {

				returnVal += item.name + "<br>";
			});
		}

		return returnVal;
	}

	me.formatJsonData = function(data) {
		if (data !== undefined) {
			return data;
		} else {
			return "";
		}
	}

	me.getRowFormated = function(title, content, style) {
		if (style === undefined) {
			style = '';
		}

		if (content === undefined) {
			content = '';
		}

		return '<tr style="' + style + '">'
				+ '<td class="title" width="140px">' + title + '</td>'
				+ '<td class="content">' + content + '</td>' + '</tr>';
	}

	// Initial Setup Call
	me.initialSetup = function() {
		me.formPopupSetup();
	}

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();
}

// -------------------------------------------
// Indicator (Detail) Popup Class
