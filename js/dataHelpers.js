DataHelpers = function() {};

DataHelpers.getDataElements = function(json) {
    return _.map(json.dataSetElements, function(dse) { return dse.dataElement });
};
