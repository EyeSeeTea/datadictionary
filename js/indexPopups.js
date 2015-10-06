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

	me.form_Open = function(deId) {

		me.tableTag.find('tr').remove();

		// Load the Data Element Information
		me.load_DEData(deId, function(json_Data) {
			me.populateTable(json_Data);
		});

		me.dialogFormTag.dialog("open");
	}

	me.load_DEData = function(id, execFunc) {
		RESTUtil.getAsynchData(me.queryURL_DataElements + '/' + id + '.json',
				function(data) {
					execFunc(data);
				}, function(msg) {
					console.log('DataElement retrieval was unsuccessful.');
				});
	}

	me.loadAttributData = function(execFunc) {
		RESTUtil.getAsynchData(me.queryURL_Attributes, function(data) {
			execFunc(data.attributes);
		}, function(msg) {
			console.log('Attributes retrieval was unsuccessful.');
		});
	}

	me.populateTable = function(jsonData) {
		var table = me.tableTag;

		table.append(me.getRowFormated("UID", me.formatJsonData(jsonData.id)));
		table.append(me
				.getRowFormated("Code", me.formatJsonData(jsonData.code)));
		table.append(me
				.getRowFormated("Name", me.formatJsonData(jsonData.name)));
		table.append(me.getRowFormated("Short name", me
				.formatJsonData(jsonData.shortName)));
		table.append(me.getRowFormated("Description", me
				.formatJsonData(jsonData.description),
				"height: 70px; vertical-align:top;"));
		table.append(me.getRowFormated("Value Type", me.formatValueType(me
				.formatJsonData(jsonData.type))));
		table.append(me.getRowFormated("Store Zero Data Value",
				me.formatBooleanVal(me
						.formatJsonData(jsonData.zeroIsSignificant))));
		table.append(me.getRowFormated("Aggregation operator", me
				.formatJsonData(jsonData.aggregationOperator)));
		table.append(me.getRowFormated("Disaggregation (Cat Combos)",
				jsonData.categoryCombo.name));
		// empty is not selected
		// table.append( me.getRowFormated( "Option set", getObjectName(
		// jsonData.optionSet ) ) );

		me.loadAttributData(function(attributeList) {
			if (attributeList !== undefined) {
				$.each(attributeList, function(i, item) {

					// if ( item.dataElementAttribute !== undefined &&
					// item.dataElementAttribute )
					table.append(me.getRowFormated(item.name, me
							.getAttributeValue(item.id,
									jsonData.attributeValues),
							"background-color: #eee;"));

				});
			}

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

	me.form_Open = function(id) {

		me.tableTag.find('tr').remove();

		// Load the Data Element Information
		me.load_Data(id, function(json_Data) {
			me.populateTable(json_Data);
		});

		me.dialogFormTag.dialog("open");
	}

	me.load_Data = function(id, execFunc) {
		RESTUtil.getAsynchData(me.queryURL_Indicators + '/' + id + '.json',
				function(data) {
					execFunc(data);
				}, function(msg) {
					console.log('Indicator retrieval was unsuccessful.');
				});
	}

	me.populateTable = function(jsonData) {

		var table = me.tableTag;

		table.append(me.getRowFormated("UID", me.formatJsonData(jsonData.id)));
		// table.append( me.getRowFormated( "Code", me.formatJsonData(
		// jsonData.code ) ) );
		table.append(me
				.getRowFormated("Name", me.formatJsonData(jsonData.name)));
		table.append(me.getRowFormated("Short name", me
				.formatJsonData(jsonData.shortName)));
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