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

function setup_SearchByGroup(me, tabTag, afterFunc) {
	var speed = 400;

	me.groupTypeTag.change(function() {
		var selectTag = $(this);

		// Hide everything and clean the data
		me.divGroupListTag.hide(speed);
		me.divGroupLoadingTag.hide(speed);
		me.divRetrieveData_byGroupTag.hide(speed);
		me.groupListTag.empty();

		if (selectTag.val() != "") {
			populateGroupList(me, selectTag.val(), me.groupListTag,
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

		getDataList_byGroup(me, groupType, me.groupListTag.val(),
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

function getDataList_byGroup(me, groupType, groupId, loadingTagName,
		runFunc) {
	RESTUtil.getAsynchData(apiPath
			+ getGroupTypeData(me, groupType, "queryUrl") + '/' + groupId
			+ '.json', function(data) {
		runFunc(getGroupTypeData(me, groupType, "data", data));
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