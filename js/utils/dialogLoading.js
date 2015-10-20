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
// -- Data Loading Message Util Class/Methods

var _dialogLoadingMsg_Initial = "";
var _dialogOpenCount = 0;
var _dialogCountClean = "countClean";

function DialogLoading() {}

DialogLoading.getDialog = function()
{
	return $( "#dialog-loading" );			
}

DialogLoading.initialSetup = function()
{
	var dialogTag = DialogLoading.getDialog();

	dialogTag.dialog({
		  autoOpen: false,
		  dialogClass: "noTitleStuff",
		  height: 100,
		  modal: true,
		  position: { at: "center top+20%" }
		});
	
	dialogTag.find( '#forceClose' ).click( function() {

		DialogLoading.close();
		return false;
	});

	_dialogLoadingMsg_Initial = dialogTag.find( '#loadingMsg' ).text();
}

DialogLoading.open = function( loadingMsg )
{
	var dialogTag = DialogLoading.getDialog();

	if ( loadingMsg !== undefined )
	{
		dialogTag.find( '#loadingMsg' ).text( loadingMsg );
	}
	else
	{
		dialogTag.find( '#loadingMsg' ).text( _dialogLoadingMsg_Initial );
	}

	_dialogOpenCount++;


	dialogTag.dialog( "open" );
}

DialogLoading.openWithCallback = function( callback )
{
	DialogLoading.open();

	// Due to use of Synchronized calls & chrome browser optimization, 
	// Use setTimeout to delay things a bit. 
	setTimeout( callback, 50 );
}

DialogLoading.close = function( option )
{
	_dialogOpenCount--;

	if ( option !== undefined && option == _dialogCountClean )
	{
		_dialogOpenCount = 0;
	}

	if ( _dialogOpenCount <= 0)
	{
		_dialogOpenCount = 0;
		DialogLoading.getDialog().dialog( "close" );
	}
}

// -- Data Loading Message Util Class/Methods
// -------------------------------------------


// -------------------------------------------
// -- Quick Loading Message Util Class/Methods

// Sample loading message format
//<div id='orgUnitLoading' style='display:none'>
//	<img src='images/ui-anim_basic.gif'/> retrieving..
//</div>

var _quickLoadingCountObj = {};

function QuickLoading() {}

QuickLoading.getLoadingCountObj = function( loadingTagName )
{
	// if property exists, return the object
	// otherwise, create the property with 0 and return
	if ( !_quickLoadingCountObj.hasOwnProperty( loadingTagName ) ) 
	{
		_quickLoadingCountObj[ loadingTagName ] = { "count": 0 };
	}

	return _quickLoadingCountObj[ loadingTagName ];
}

QuickLoading.dialogShowAdd = function( loadingTagName )
{
	var loadingCountObj = QuickLoading.getLoadingCountObj( loadingTagName );

	if ( loadingCountObj.count <= 0 )
	{
		loadingCountObj.count = 0;
		$( '#' + loadingTagName ).show();
	}

	loadingCountObj.count++;
}

QuickLoading.dialogShowRemove = function( loadingTagName )
{
	var loadingCountObj = QuickLoading.getLoadingCountObj( loadingTagName );

	loadingCountObj.count--;

	if ( loadingCountObj.count <= 0 )
	{
		loadingCountObj.count = 0;
		$( '#' + loadingTagName ).hide();
	}
}

// -- Quick Loading Message Util Class/Methods
// -------------------------------------------
