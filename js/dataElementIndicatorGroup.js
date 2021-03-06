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
// ---------------------------------------
// -- 'Search by Group' related

// 'dataElement Groups' list

function populateGroupList(me, groupType, listTag, loadingTag, execFunc) {
	listTag.empty();

	var groupTypeName = "";
	var urlName = "";
	var table;
	var groupChangeList;
	var groupChangeAction;

	if (groupType == "DE") {
		groupTypeName = "DataElement";
		urlName = "dataElementGroups";
		table = me.tbDataListDE_byGroupTag;
		groupChangeList = me.dataElementGroupChangeList;
		groupChangeAction = me.dataElementGroupChangeAction;
	} else if (groupType == "IND") {
		groupTypeName = "Indicator";
		urlName = "indicatorGroups";
		table = me.tbDataListIND_byGroupTag;
		groupChangeList = me.indicatorGroupChangeList;
		groupChangeAction = me.indicatorGroupChangeAction;
	}

	groupChangeAction.on('click', function () {
		var selected = Array.from(table.DataTable().column(0).checkboxes.selected());
		if (selected.length == 0) {
			alert("You have not selected any row!");
		} else {
			Util.updateGroups(groupType, selected, "#" + groupChangeList.attr('id'));
		}
	});

	RESTUtil.getAsynchData(
					apiPath + urlName	+ '.json?paging=false&fields=id,displayName',
					function(json_Data) {
						var json_DataList = (groupType == "IND") ? json_Data.indicatorGroups
								: json_Data.dataElementGroups;

						var json_DataOrdered = Util.sortByKey(json_DataList, "displayName");

						Util.populateSelect(groupChangeList, null, json_DataOrdered);

						var options = [{
							id: "NONE",
							displayName: "Not assigned to any group",
						}].concat(json_DataOrdered);

						Util.populateSelect(listTag, groupTypeName + " Group", options);

						if (groupType == me.paramSearchType) {
							execFunc();
						}
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
		listTag = me.indicatorListTag;
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

						// Commenting it out as it looks it is not being used
						//me.retrieveData_byGroupTag.click();
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
		if (dataType == "groupProperty") {
			return "dataElementGroups"
		} else if (dataType == "data") {
			return data.dataElements;
		} else if (dataType == "name") {
			return "dataElement";
		} else if (dataType == "plural") {
			return "dataElements";
		}

	} else if (typeId == "IND") {
		if (dataType == "groupProperty") {
			return "indicatorGroups"
		} else if (dataType == "data") {
			return data.indicators != undefined ? data.indicators : [];
		} else if (dataType == "name") {
			return "indicator";
		} else if (dataType == "plural") {
			return "indicators";
		}

	}
}

function getDataList_byGroup(me, groupType, groupId, loadingTagName, runFunc) {
	var url;
	if (groupId == '' || groupId == null) {
		runFunc([]);
		return;
	} else if (groupId == 'NONE') {
		url = apiPath + 'metadata.json?'
			+ getGroupTypeData(me, groupType, "plural") + ':filter='
			+ getGroupTypeData(me, groupType, "groupProperty") + ':empty&fields=id';
	} else {
		url = apiPath
			+ getGroupTypeData(me, groupType, "groupProperty") + '/' + groupId
			+ '.json';
	}
	
	RESTUtil.getAsynchData(url, function(data) {
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

// -- 'Search by Group' related
// ---------------------------------------
