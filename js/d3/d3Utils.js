function getLabel(d) {
	if (d.shortName){
		return d.shortName;
	}else if (d.name){
		return d.name;
	}else{
		return d.id;
	}
}

//function getFiles(childrenPointers){
//	var children =  [];
//	if (childrenPointers){
//		for (var i=0; i < childrenPointers.length; i++) {
//			$.ajax({
//			  url: path + childrenPointers[i].id + ".json",
//			  async: false,
//			  dataType: 'json',
//			  success: function (response) {
//			  	children.push(response);
//			  }
//			});
//		};
//	}
//	if (children.length == 0) children = null;
//	return children;
//}

function getChildren(node){
	var children = null;
	if (node._children != undefined){
		children = node._children;
	}
	else{
		children=getFiles(node.childNodes);
		if (children == null){
			node.isAFinalNode = true;
			showTip(node);
		}
	}
	return children;
}

//Toggle children on click.
function collapsibleTreeClick(d) {
  if (!d3.event.defaultPrevented) {
    if (d.isAFinalNode == undefined || d.isAFinalNode == false){
	  if (d.children) {
	    d._children = d.children;
	    d.children = null;
      } else {
	    //d.children = getChildren(d);
    	if (d.childNodes == null){
  			node.isAFinalNode = true;
  			showTip(d);
  		}
    	else{
	    	d.children = d.childNodes;
		    d._children = null;
    	}
	  }
	  update();
	}
  }
}

function showTip(d){
//	if (d.isAFinalNode){
		tip.show(d);
//	}	
}

function getTipContent(d) {
	var content = "";
	if (d.numberDataValues != undefined){
		content += "<p>Number of DataValues: <span style='color:red'>" + d.numberDataValues + "</span></p>";
	}
	if (d.description != undefined){
		content += "<p>Description: <span style='color:red'>" + d.description + "</span></p>";
	}
	if (d.lastUpdated != undefined){
		content += "<p>Last Updated: <span style='color:red'>" + d.lastUpdated + "</span></p>";
	}
	if (d.aggregationOperator != undefined){
		content += "<p>Aggregation Operator: <span style='color:red'>" + d.aggregationOperator + "</span></p>";
	}
	if (d.type != undefined){
		content += "<p>Type: <span style='color:red'>" + d.type + "</span></p>";
	}
	if (content == ""){
		content += "<span style='color:red'>Node:</span> " + getLabel(d);
	}
	
	return content;
}

function calculateTextPosition(d){
	return calculateRadius(d) + 8;
}

function calculateRadius(d) {
	//return Math.sqrt(d.numberDataValues) / 20 || 4.5;
	return Math.sqrt(d.numberDataValues) / 2 || 0;
}

//Color leaf nodes orange, and packages white or blue.
function color(d) {
	var color;
	if (d.isAFinalNode){
		color = "#fd8d3c";
	}
	else if ((d._children != undefined && d._children != null) || (d._children === undefined && d.children === undefined)){
		color = "#3182bd";
	}
	else if (d.children != undefined && d.children != null){
		color = "#c6dbef";
	}
	return color;
}
