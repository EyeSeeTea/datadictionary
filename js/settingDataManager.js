

var _sectionName_General = "General";


// -------------------------------------------
// Class - SettingPopupForm
//		- Used for popup Setting Form

function SettingDataPopupForm(settingDialogDiv)
{
	var me = this;

	me.width = 700;
	me.height = 200;


	me.orgUnitList = $( '#orgUnitList' );
	me.orgUnitRow = $( '#orgUnitRow' );
	
	//Not being used at the moment
	//me.dataLoadingTemplateMain = '<div class="dataLoading main" style="display:none;"><img src="img/ui-anim_basic.gif"/></div>';
	

	me.dialogFormTag = $( '#settingDialogForm' );
	


	me.retrieveAndSetValueSelection = function( type, value, selectTag, loadingTag)
	{

		if ( value === undefined ) value = "";

		var queryURL = apiPath + "organisationUnitLevels.json?paging=false&fields=level,name,id";
		
		RESTUtil.getAsynchData( queryURL, function( json_Data )
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

				selectTag.val( value );
			}
		}
		, function() {}
		, function() { loadingTag.show(); }
		, function() { loadingTag.hide(); }
		);
		

	}




	me.retrieveAndPopulate = function( returnFunc )
	{
		me.retrieveAndSetValueSelection("", "", me.orgUnitList, me.orgUnitRow.find('div.dataLoading'));
		
		if ( returnFunc !== undefined ) returnFunc();
	}

	me.resetDisplay = function()
	{
		
	}


	// -----------------------------------------


	me.FormPopupSetup = function()
	{
		// -- Set up the form -------------------
		me.dialogFormTag.dialog( {
		autoOpen: false
		// ,dialogClass: "noTitleStuff"
		,width: me.width
		,height: me.height				  
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


	me.openForm = function( status )
	{
		me.dialogFormTag.show();

		me.resetDisplay();


		// Retrieve and Populate Data to HTML
		me.retrieveAndPopulate( function()
		{
			me.dialogFormTag.dialog( "open" );

			me.orgUnitList.focus();
		});
	}


	// Initial Setup Call
	me.initialSetup = function()
	{				
		// Initially block the div.
		//me.formBlock( true );


		me.FormPopupSetup();


		me.resetDisplay();

		// advanced Setup allow
//		me.setUp_SettingDataEdit();

		// Set up Event Handlers
//		me.setup_Events();


	}

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();

}
