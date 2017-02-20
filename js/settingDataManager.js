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
var _sectionName_General = "General";


// -------------------------------------------
// Class - SettingPopupForm
//		- Used for popup Setting Form

function SettingDataPopupForm(me, settings, afterSetup)
{
//	var that = this;

	var width = 700;
	var height = 200;
	
	var dataStoreSettingsKey = "datadictionary/settings"
	
	var defaultOrgUnitLevel = "3";
	
	var defaultSettings = _.defaults(settings, {orgUnitLevel: defaultOrgUnitLevel});
	
	var orgUnitLabel = $('#orgUnitLabel');
	
	me.orgUnitList = $('#orgUnitList');
	
	var orgUnitRow = $('#orgUnitRow');
	
	var sqlViewSettings = $('#sqlViewSettings');
	
	var sqlViewEditSettings = $('#sqlViewEditSettings');

	//Not being used at the moment
	//me.dataLoadingTemplateMain = '<div class="dataLoading main" style="display:none;"><img src="img/ui-anim_basic.gif"/></div>';
	
	var dialogFormTag = $( '#settingDialogForm' );
	
	function get(url, onsuccess) {
		var loadingTag = $("#settingDialogForm div.dataLoading");
		
		return RESTUtil.getAsynchData(
			url, 
			onsuccess,
			function() { },
			function() { loadingTag.show(); },
			function() { loadingTag.hide(); }
		);
	}

	function getSettingsPath() {
		return apiPath + "dataStore/" + dataStoreSettingsKey;	
	}

	function updateSettings(data, method) {
		var loadingTag = $("#settingDialogForm div.dataLoading");
		
		return RESTUtil.getAsynchData(
			getSettingsPath(), 
			function() { setup_Analytics(me, function() {}); },
			function(xhr) {
				// First try to update the existing settings (PUT), otherwise create them (POST)
				if (method == "PUT" && xhr.status == 404) {
					 updateSettings(data, "POST");
				} else {
					alert("Error saving settings");
				}
			},
			function() { loadingTag.show(); },
			function() { loadingTag.hide(); },
			{type: method, contentType: 'application/json', data: JSON.stringify(data)}
		);
	};
	
	function retrieveAndSetValueSelection(type, value, selectTag)
	{

		if ( value === undefined ) value = "";

		var queryURL = apiPath + "organisationUnitLevels.json?paging=false&fields=level,name,id";
		
		return get( queryURL, function( json_Data )
		{
			if ( json_Data !== undefined && json_Data.organisationUnitLevels !== undefined )
			{

				var orgUnitLevels = Util.sortByKey( json_Data.organisationUnitLevels, "level" );

				// new list
				var orgUnitLvlNew = [];

				// reorder the data
				$.each( orgUnitLevels, function( i_oul, item_oul )
				{
					orgUnitLvlNew.push( { id: item_oul.level, name: item_oul.name } );
				});

				Util.populateSelectDefault( selectTag, 'Not Selected', orgUnitLvlNew );

				selectTag.change(function(){refreshUI()});
				selectTag.val( value );
				refreshUI();
				
				var sqlViewSettingsHasChanged;
				sqlViewSettings.keyup(function () { 
					sqlViewSettingsHasChanged = true; });
				sqlViewSettings.blur(function(){
					if (typeof me.infoList_DataSet_Analytics != "undefined" && sqlViewSettingsHasChanged){
						me.infoList_DataSet_Analytics.clear().draw();
						setup_Analytics(me, function() {
							if (me.paramTab == 'Analytics')
								me.setParameterAction(me.paramTab);
						});
					}
					
				});
				
			}
		});
	}
	
	function updateView(settings) {
		me.orgUnitList.val(settings.orgUnitLevel);
		sqlViewSettings.val(settings.dashboardList);
		sqlViewEditSettings.val(settings.dashboardJoin);
	}
	
	function loadSettings() {
		return get(getSettingsPath(), function(dbSettings) {
		  updateView(_.defaults(dbSettings, defaultSettings));
		}).error(function(xhr) {
		  if (xhr.status === 404) {
			  updateView(defaultSettings);
			} else {
			  alert("Cannot get settings");
			}
		}).always(function(xhr) {
			if (afterSetup) 
				afterSetup();
		});
	}
	
	function onSettingChange(ev) {
		var settings = {
			"orgUnitLevel": me.orgUnitList.val(),
			"dashboardList": sqlViewSettings.val(),
			"dashboardJoin": sqlViewEditSettings.val()
		}; 
		updateSettings(settings, "PUT");
	}
	
	function setupSettingsSaveCallbacks() {
		me.orgUnitList.change(onSettingChange);
		sqlViewSettings.change(onSettingChange);
		sqlViewEditSettings.change(onSettingChange);
	}

	function refreshUI(){
		orgUnitLabel.text(me.orgUnitList.find("option:selected").text());
		
		// Populate Country List
		populateCountryList(me, 'countriesLoading', function() {
			if (me.paramTab == 'Country')
				me.setParameterAction(me.paramTab);
			});
	}


	function retrieveAndPopulate( returnFunc )
	{
		retrieveAndSetValueSelection("", defaultOrgUnitLevel, me.orgUnitList).always(loadSettings);
		
		if ( returnFunc !== undefined ) returnFunc();
	}

	function resetDisplay()
	{
		
	}


	// -----------------------------------------


	function FormPopupSetup()
	{
		// -- Set up the form -------------------
		dialogFormTag.dialog( {
		autoOpen: false
		// ,dialogClass: "noTitleStuff"
		,width: width
		,height: height
		,modal: true
		,title: "Settings"
		,close: function( event, ui ) 
		{

//			me.getSectionList( function( sectionNetworkList )
//			{
//				me.providerNetworkObj.populateNetworkList( sectionNetworkList );
//
//				me.providerNetworkObj.sectionNetworkListTag.change();
//			});

			$( this ).dialog( "close" );

		}
		});		
	}


	this.openForm = function (status)
	{
		dialogFormTag.show();
		
		dialogFormTag.dialog( "open" );

		orgUnitList.focus();
	}


	// Initial Setup Call
	function initialSetup()
	{				
		// Initially block the div.
		//me.formBlock( true );

		FormPopupSetup();
		resetDisplay();
		
		// Retrieve and Populate Data to HTML
		retrieveAndPopulate();
		setupSettingsSaveCallbacks();

		// advanced Setup allow
//		me.setUp_SettingDataEdit();

		// Set up Event Handlers
//		me.setup_Events();
	}

	// --------------------------
	// Run methods

	// Initial Run Call
	initialSetup();

}
