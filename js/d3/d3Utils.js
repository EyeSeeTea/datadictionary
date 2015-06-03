function getLabel(d) {
//	console.log(d);
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

//function getChildren(node){
//	var children = null;
//	if (node._children != undefined){
//		children = node._children;
//	}
//	else{
//		children=getFiles(node.childNodes);
//		if (children == null){
//			node.isAFinalNode = true;
//			showTip(node);
//		}
//	}
//	return children;
//}

//Calculate tree dimensions
function calculateTreeDimensions(numberOfNodes){
	var realHeight = numberOfNodes * 20;
	if (realHeight > originalHeight){
		height = realHeight - margin.top - margin.bottom;
	}
	else{
		height = originalHeight - margin.top - margin.bottom;
	}
	tree.size([height, width]);
	$("svg").attr("height",height + margin.top + margin.bottom)
}

//Toggle children on click.
function collapsibleTreeClick(d) {
  if (!d3.event.defaultPrevented) {
	  if (d.children) {
	    d._children = d.children;
	    d.children = null;
	    
	  //Recalculate tree height and shift labels to the right
	   if (typeof d.parent != 'undefined'){
		   calculateTreeDimensions(d.parent.children.length);
		   
		   for (var i in d.parent.children){
	    		d.parent.children[i]["moveLabelToLeft"] = false;
		    }
		    d.parent["hideLabel"] = false;
	    }
      } else if (d._children != null){
    	d.children = d._children;
	    d._children = null;
	    
	    //Recalculate tree height
	    if (typeof d.parent == 'undefined' || d.children.length > d.parent.children.length){
	    	calculateTreeDimensions(d.children.length);
	    }
	    
	    //Collapse the other nodes and shift labels to the left
	    if (typeof d.parent != 'undefined'){

	    	for (var i in d.parent.children){
		    	if (d.parent.children[i].id != d.id && d.parent.children[i].children != null){
		    		d.parent.children[i]._children = d.parent.children[i].children;
		    		d.parent.children[i].children = null;
		    	}
		    	d.parent.children[i]["moveLabelToLeft"] = true;
		    }
		    d.parent["hideLabel"] = true;
	    }
	  }
	  update();
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
	if (d.numberDataElements != undefined){
		content += "<p>Number of DataElements: <span style='color:red'>" + d.numberDataElements + "</span></p>";
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

	return (d[$('#graphSelector').val()] / maxNumber) * 50|| 0;
//	return Math.sqrt(d.numberDataValues) / 2 || 0;
}

//Color leaf nodes orange, and packages white or blue.
function color(d) {
	var nodeColor;
	
	if (d.type == "Dataset"){
		nodeColor = "#f45e00";
	}
	else if (d.type == "Organization Unit"){
		nodeColor = "#bfbfbf";
	}
	else{
		//It is a data element
		nodeColor = color(d.parent);
	}

	return nodeColor;
}
