// ---------------------------------------
// -- 'Search by Group' related

// 'dataElement Groups' list

function populateGroupList(me, groupType, listTag, loadingTag, execFunc) {
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

	RESTUtil.getAsynchData(
					apiPath + urlName	+ '.json?paging=false&fields=id,name',
					function(json_Data) {
						var json_DataList = (groupType == "IND") ? json_Data.indicatorGroups
								: json_Data.dataElementGroups;

						var json_DataOrdered = Util.sortByKey(json_DataList, "name");

						Util.populateSelect(listTag, groupTypeName	+ " Group", json_DataOrdered);

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

function setup_SearchByGroup(me, groupType, tabTag, afterFunc) {
	var speed = 400;
	
	var listTag;
	if (groupType == "DE") {
		listTag = me.groupListTag;
	} else if (groupType == "IND") {
		listTag =  me.indicatorListTag;
	}
	
	populateGroupList(me, groupType, listTag,
			me.divGroupLoadingTag, function() {

				// If parameter value was set, call this once
				if (me.setGroupParameterSelection) {
					me.setGroupParameterSelection = false;

					// select the listTag
					listTag.val(me.paramSearchValue);

					if (listTag.val() != '') {
						listTag.change();

						me.retrieveData_byGroupTag.click();
					}
				}

			});
	
	listTag.change(function() {
		var selectTag = $(this);

//		me.divRetrieveData_byGroupTag.show(speed);
		
//		me.dataListDEDiv_byGroupTag.hide();
//		me.dataListINDDiv_byGroupTag.hide();

		getDataList_byGroup(me, groupType, listTag.val(),
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

function getGroupTypeData(me, typeId, dataType, data) {
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

function getDataList_byGroup(me, groupType, groupId, loadingTagName, runFunc) {
	if (groupId != ''){
		RESTUtil.getAsynchData(apiPath
				+ getGroupTypeData(me, groupType, "queryUrl") + '/' + groupId
				+ '.json', function(data) {
			runFunc(getGroupTypeData(me, groupType, "data", data));
		}, function() {
			alert('Failed to retrieve '
					+ getGroupTypeData(me, groupType, "name") + ' list.');
		}, function() {
			QuickLoading.dialogShowAdd(loadingTagName);
		}, function() {
			QuickLoading.dialogShowRemove(loadingTagName);
		});
	}
}

// -- 'Search by Group' related
// ---------------------------------------