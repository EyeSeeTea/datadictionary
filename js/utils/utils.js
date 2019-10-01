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
// -- Utility Class/Methods

function Util() {}

Util.populateSelect = function( selectObj, selectName, json_Data )
{
	if (selectName !== undefined && selectName !== null) {
		selectObj.append( '<option value="">Select ' + selectName + '</option>' );
	}


	$.each( json_Data, function( i, item ) {
		selectObj.append( $( '<option></option>' ).attr( "value", item.id ).text( item.displayName ) );
	});
}

Util.populateSelectDefault = function( selectObj, selectNoneName, json_Data )
{
	selectObj.empty();

	selectObj.append( '<option value="">' + selectNoneName + '</option>' );

	if ( json_Data !== undefined )
	{
		$.each( json_Data, function( i, item ) 
		{
			var option = $( '<option></option>' );

			option.attr( "value", item.id ).text( item.name );
				
			selectObj.append( option );
		});
	}
}

Util.selectValueIfExists = function( selectTag, value )
{
	selectTag.find( 'option' ).each( function()
	{
		console.log( 'sel opt: ' + $( this ).val() );
	});

	console.log( 'option find: ' + value + selectTag + ' - ' + selectTag.find( "option[value='" + value + "']" ).length );

	if ( selectTag !== undefined && selectTag.find( "option[value='" + value + "']" ).length > 0 )
	{
		console.log( 'Select found the value from list' + value );
		selectTag.val( value );
	}
}

Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
}

Util.getNotEmpty = function( input ) {

	if( input !== undefined && input != null ) return input;
	else return "";
}


Util.disableTag = function( tag, isDisable )
{
	tag.prop('disabled', isDisable);
}

Util.trim = function( input )
{
	return input.replace( /^\s+|\s+$/gm, '' );
}

Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
}

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
}

Util.checkContent = function( input ) {

	return Util.checkValue( input );
}

Util.getMatchData = function( settingData, matchSet )
{
	var returnData = new Array();
	
	$.each( settingData, function( i, item )
	{
		var match = true;

		for ( var propName in matchSet )
		{
			if ( matchSet[ propName ] != item[ propName ] ) 
			{
				match = false;
				break;
			}
		}

		if ( match )
		{
			returnData.push( item );
		}
	});

	return returnData;
}


Util.getFirst = function( inputList ) 
{
	var returnVal;

	if( inputList !== undefined && inputList != null && inputList.length > 0 )
	{
		returnVal = inputList[0];
	}
	
	return returnVal;
}


Util.findItemFromList = function( listData, searchProperty, searchValue )
{
	var foundData;

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			foundData = item;
			return false;
		}
	});

	return foundData;
}


Util.findItemsFromList = function( listData, searchProperty, searchValue )
{
	var list = new Array();

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			list.push( item );
		}
	});

	return list;
}


Util.getParameterByName = function( name ) 
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

Util.checkDataExists = function(obj) {
  return (obj != null && typeof obj[Symbol.iterator] === 'function');
}

// -- Utility Class/Methods
// -------------------------------------------

Util.formatBoolean = function(value) {
  if (value === true) {
    return "Yes";
  } else if (value === false) {
    return "No";
  } else {
    return "-";
  }
};

Util.formatDate = function(date) {
  return $.format.date(date, "yyyy-MM-dd hh:mm a");
};

/* DataTables helpers */

Util.getExportButtons = function() {
  var onlyVisibleColumns = {columns: ':visible'};
  
  return [
    {extend: "copy", exportOptions: onlyVisibleColumns},
    {extend: "csv", exportOptions: onlyVisibleColumns},
    {extend: "excel", exportOptions: onlyVisibleColumns},
    {extend: "pdf", exportOptions: onlyVisibleColumns, customize: function(doc) {
      doc.defaultStyle.fontSize = 8; 
    }},
    {extend: "print", exportOptions: onlyVisibleColumns}
  ];
}
						
Util.getDataTableRenderer = function(rendererName) {
  var renderFun = Util.dataTableRenderers[rendererName || "string"];
   
	return function(data, type, full) {
	  return renderFun(data, type);
	}
};
				
Util.dataTableRenderers = {
  string: function(data, type) {
    return data === undefined || data === null ? "-" : data.toString();
  },
  boolean: function(data, type) {
    return Util.formatBoolean(data);
  },
  date: function(data, type) {
    return Util.formatDate(data);
  }
};

Util.getChangeGroupRenderer = function (me, groupType) {
	var groupName = (groupType == "IND") ? "indicatorGroups" : "dataElementGroups";

	return function (id, type, full) {
		var container = $('<div>');
		var select = $('<select multiple>');
		$(me[groupName]).each(function () {
			var groupId = this.id;
			select
				.attr("id", "select-" + id)
				.append($("<option>")
					.attr("value", groupId)
					.attr("selected", full[groupName].find(function (element) {
						return element.id == groupId;
					})
				)
				.text(this.displayName));
		});
		var button = $('<button>') 
			.attr("onclick", "Util.updateGroups('" + groupType + "', ['" + id + "'], '" + "#select-" + id + "')")
			.text("Update groups");
		return container.append(select, button).html();
	}
};

Util.updateGroups = function (groupType, ids, selector) {
	var groupName = (groupType == "IND") ? "indicatorGroups" : "dataElementGroups";
	var plural = (groupType == "IND") ? "indicators" : "dataElements";
	
	var options = $(selector + " > option");
	var selectedOptions = [];
	var groupsToUpdate = $.map(options, function (option) {
		if (option.selected) selectedOptions.push(option.value);
		return option.value;
	});

	$.ajax({
		type: "GET",
		dataType: "json",
		url: apiPath + "metadata.json?fields=:owner&filter=id:in:[" + groupsToUpdate.toString() + "]",
		async: true,
		success: function (data) {
			var metadata = {};
			metadata[groupName] = data[groupName].map(function (group) {
				ids.forEach(function (id) {
					group[plural] = group[plural].filter(function (element) {
						return element.id != id;
					});
					if (selectedOptions.includes(group.id)) group[plural].push({ id: id })
				});
				return group;
			});

			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: apiPath + "metadata",
				data: JSON.stringify(metadata),
				async: true,
				success: function () {
					location.reload();
				},
				error: function () {
					alert("Error updating groups")
				}
			});
		},
		error: function () {
			alert("Error updating groups")
		}
	});
}
