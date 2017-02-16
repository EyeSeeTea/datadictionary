DataHelpers = function() {};

DataHelpers.getDataElements = function(json) {
	if (json.dataElements) {
		return json.dataElements;
	} else if (json.dataSetElements) {
		return _.pluck(json.dataSetElements, "dataElement");
	} else {
		return "Data does not contain dataElements";
	}
};
