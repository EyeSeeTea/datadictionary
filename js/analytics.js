function setup_Analytics(me, afterFunc) {
	me.infoList_DataSet_DataTable = $("#infoList_Analytics").DataTable({"aLengthMenu" : [ [ -1, 25, 50, 100 ], [ "All", 25, 50, 100 ] ]});
	
	afterFunc();
}