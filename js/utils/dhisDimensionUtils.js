/* NOTE: This file contains the functions related with the dimension field 
extracted verbatim from js/index.js, it needs a complete refactor. */
 
DhisDimensionUtils = {};

(function(me) {
	me.setupDimensions = function(listTag, dataList) {
		// for each row..
		listTag
				.find('div[deid]')
				.each(
						function(i_div) {

							var divDimension = $(this);

							divDimension
									.append('<div class="hidden" type="CAT" ></div>'
											+ '<div class="hidden loading_CAT" ><img src="images/ui-anim_basic.gif"/></div>'
											+ '<div class="hidden" type="COGS" ></div>'
											+ '<div class="hidden loading_COGS" ><img src="images/ui-anim_basic.gif"/></div>'
											+ '<div class="hidden" type="DEGS" ></div>'
											+ '<div class="hidden loading_DEGS"><img src="images/ui-anim_basic.gif"/></div>');

							var deid = divDimension
									.attr('deid');
							var processed = divDimension
									.attr('processed');
							var catid = divDimension
									.attr('catid');
							var degsids = divDimension
									.attr('degsids');

							// console.log( 'deid: ' + deid
							// + '|' + processed );

							if (processed === undefined) {
								divDimension.attr(
										'processed', 'Y');

								me.populateDEGS(
										divDimension, deid,
										degsids, dataList);

								me
										.populateCAT(
												divDimension,
												deid,
												catid,
												dataList,
												function(
														categoryOptions) {
													me
															.populateCOGS(
																	divDimension,
																	deid,
																	categoryOptions,
																	dataList);
												});
							}
						});
	};

	me.populateDEGS = function(divDimension, deid, degsids, dataList) {
		var retrieveCount = 0;
		var resultStr = "";

		var divTarget = divDimension.find('div[type="DEGS"]');
		var loadingTag = divDimension.find('.loading_DEGS');

		var idsArr = degsids.split(';');

		$
				.each(
						idsArr,
						function(i_deg, item_deg) {
							if (item_deg != "") {
								RESTUtil
										.getAsynchData(
												apiPath + 'dataElementGroups/'
														+ item_deg
														+ '.json?fields=id,name,dataElementGroupSet[id,name,dataDimension]',
												function(json_dataDetail) {
													if (json_dataDetail.dataElementGroupSet !== undefined
															&& json_dataDetail.dataElementGroupSet.dataDimension) {
														if (resultStr != "")
															resultStr += "<br>";

														resultStr += json_dataDetail.dataElementGroupSet.name
																+ '[DEGS] ';
													}
												}, function() {
												}, function() {
													if (retrieveCount == 0)
														loadingTag.show();

													retrieveCount++;
												}, function() {
													retrieveCount--;
													if (retrieveCount == 0) {
														loadingTag.hide();
														divTarget.show().html(
																resultStr);

														me.setData_DataList(
																deid, "DEGS",
																resultStr,
																dataList);

														// Set to
														// me.dataList[].dimension
													}
												});
							}
						});
	};

	me.populateCAT = function(divDimension, deid, catid, dataList, runFunc) {
		var retrieveCount = 0;
		var resultStr = "";
		var categoryOptions = [];
		var catComboData;

		var divTarget = divDimension.find('div[type="CAT"]');
		var loadingTag = divDimension.find('.loading_CAT');

		// var idStr = Util.getNotEmpty( divTarget.attr( 'id' ) );

		// Category Combo <-- Add to the ///

		if (catid != "") {
			// For Transposed Excel data, make list of unique catCombo List that
			// holds categoryOptionCombos:
			me.setCatComboData(catid, _catComboData);

			RESTUtil
					.getAsynchData(
							apiPath + 'categoryCombos/'
									+ catid
									+ '.json?fields=id,name,categories[id,name,categoryOptions[id,name]]' // ,categoryOptionCombos[id,name]'
							, function(json_dataDetail) {
								// catComboData = { id: catid, name:
								// json_dataDetail.name, catOptionCombos:
								// json_dataDetail.categoryOptionCombos };

								$.each(json_dataDetail.categories, function(
										i_cat, item_cat) {
									var catOptionNames = "";

									$.each(item_cat.categoryOptions, function(
											i_co, item_co) {
										categoryOptions.push({
											id : item_co.id,
											name : item_co.name
										});

										if (catOptionNames != "")
											catOptionNames += ", ";
										catOptionNames += item_co.name;
									});

									if (resultStr != "")
										resultStr += "<br>";

									resultStr += '<span title="'
											+ catOptionNames + '">'
											+ item_cat.name + '[CAT]</span> ';

								});
							}, function() {
							}, function() {
								if (retrieveCount == 0)
									loadingTag.show();

								retrieveCount++;
							}, function() {
								retrieveCount--;
								if (retrieveCount == 0) {
									loadingTag.hide();
									divTarget.show().html(resultStr);

									me.setData_DataList(deid, "CAT", resultStr,
											dataList);

									// Also, save category Combo Data for later
									// use.
									// me.setData_DataList( deid,
									// "catComboData", catComboData, dataList );

									runFunc(categoryOptions);
								}
							});

		}
	};

	me.setData_DataList = function(deid, type, data, dataList) {
		$.each(dataList, function(i, item) {
			if (item.id == deid) {
				if (item.dimensions === undefined)
					item.dimensions = {};

				item.dimensions[type] = data;

				return false;
			}
		});
	};

	me.populateCOGS = function(divDimension, deid, categoryOptions, dataList) {
		var retrieveCount = 0;
		var resultStr = "";

		var divTarget = divDimension.find('div[type="COGS"]');
		var loadingTag = divDimension.find('.loading_COGS');

		// Get cateogry option group set with '[COGS]'
		RESTUtil
				.getAsynchData(
						apiPath + 'categoryOptionGroups.json?paging=false&fields=id,name,categoryOptions[id,name],categoryOptionGroupSet[id,name,dataDimension]',
						function(json_dataDetail) {
							if (json_dataDetail.categoryOptionGroups !== undefined) {
								$
										.each(
												json_dataDetail.categoryOptionGroups,
												function(i_cos, item_cos) {
													// Check if the category has
													// option that matches..
													var matchFound = false;

													$
															.each(
																	item_cos.categoryOptions,
																	function(
																			i_co,
																			item_co) {
																		$
																				.each(
																						categoryOptions,
																						function(
																								i_co_src,
																								item_co_src) {
																							if (item_co_src.id == item_co.id) {
																								matchFound = true;
																								return false;
																							}
																						});

																		if (matchFound)
																			return false;
																	});

													if (matchFound
															&& item_cos.categoryOptionGroupSet !== undefined
															&& item_cos.categoryOptionGroupSet.dataDimension) {
														// Set category Option
														// Group Set
														if (resultStr != "")
															resultStr += "<br> ";

														resultStr += item_cos.categoryOptionGroupSet.name
																+ '[COGS] ';
													}

												});
							}
						}, function() {
						}, function() {
							if (retrieveCount == 0)
								loadingTag.show();

							retrieveCount++;
						}, function() {
							retrieveCount--;
							if (retrieveCount == 0) {
								loadingTag.hide();
								divTarget.show().html(resultStr);

								me.setData_DataList(deid, "COGS", resultStr,
										dataList);
							}
						});
	};

	me.dimensionsRenderer = function(data, type, full) {
		var catId = (full.categoryCombo.displayName != ""
				&& full.categoryCombo.displayName != "default" && full.categoryCombo.id != "") ? full.categoryCombo.id
				: "";

		// For 'default', set the catcombo.
		if (full.categoryCombo.displayName == "default")
			me.setCatComboData(
					full.categoryCombo.id,
					_catComboData);

		var degsids = me
				.getGroupIdStr(full.dataElementGroups);

		// full.dimensions = "test";
		var dimensions = me
				.formatDimensions(full.dimensions);

		// Have a div tag with deid and data??
		return '<div deid="' + full.id
				+ '" catid="' + catId
				+ '" degsids="' + degsids
				+ '" >' + dimensions + '</div>';
	};

	// Create unique categoryCombo Data with categoryOptionCombos
	// - Used by Transpose Excel creation.
	me.setCatComboData = function(catid, catComboData) {
		if (catComboData[catid] === undefined) {
			// Set it as not 'undefined' since the request is made once (below)
			catComboData[catid] = {};

			RESTUtil
					.getAsynchData(
							apiPath + 'categoryCombos/'
									+ catid
									+ '.j?fields=id,name,categoryOptionCombos[id,name]',
							function(json_dataDetail) {
								catComboData[catid] = {
									id : catid,
									name : json_dataDetail.name,
									categoryOptionCombos : json_dataDetail.categoryOptionCombos
								};
							});
		}
	};

	me.getGroupIdStr = function(list) {
		var groupIds = "";

		if (list !== undefined) {
			$.each(list, function(i_group, item_group) {
				groupIds += item_group.id + ';';
			});
		}

		return groupIds;
	};

	me.formatDimensions = function(dimensions) {
		var returnVal = "";

		if (dimensions !== undefined) {
			if (dimensions.DEGS !== undefined) {
				returnVal += dimensions.DEGS;
			}

			if (dimensions.CAT !== undefined) {
				returnVal += dimensions.CAT;
			}

			if (dimensions.COGS !== undefined) {
				returnVal += dimensions.COGS;
			}
		}

		return returnVal;
	};
})(DhisDimensionUtils);
