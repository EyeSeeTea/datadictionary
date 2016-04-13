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
	selectObj.append( '<option value="">Select ' + selectName + '</option>' );

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


// -- Utility Class/Methods
// -------------------------------------------
