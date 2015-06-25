function getLabel(d) {
	if (d.shortName){
		return d.shortName;
	}else if (d.name){
		return d.name;
	}else{
		return d.id;
	}
}

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
	content += "<p><b>" + getLabel(d) + "</b></p>";
	if (d.numberDataValues != undefined){
		content += "<p>Number of DataValues: <span style='color:red'>" + d.numberDataValues + "</span></p>";
	}
	if (d.numberTrackerInstances != undefined){
		content += "<p>Number of Tracker Instances: <span style='color:red'>" + d.numberTrackerInstances + "</span></p>";
	}
	if (d.numberEventInstances != undefined){
		content += "<p>Number of Event Instances: <span style='color:red'>" + d.numberEventInstances + "</span></p>";
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
	if ($('#graphSelector').val() in d){
//		if (d.type == "Organization Unit" && $('#graphSelector').val() == 'numberDataValues'){
//			return ((d[$('#graphSelector').val()] + d["numberTrackerInstances"] + d["numberEventInstances"])/ maxNumber) * 50|| 0;
//		}
//		else{
			return (d[$('#graphSelector').val()] / maxNumber) * 50|| 0;
//		}
	}
	else if ("numberTrackerInstances" in d){
		return (d["numberTrackerInstances"] / maxNumber) * 50|| 0;
	}
	else{
		return (d["numberEventInstances"] / maxNumber) * 50|| 0;
	}
	
//	return Math.sqrt(d.numberDataValues) / 2 || 0;
}

function calculateMaxNumber(tree, selectedRadius){
	if (typeof selectedRadius == 'undefined' || selectedRadius == 'numberDataValues'){
		if (tree.numberTrackerInstances > tree.numberEventInstances && tree.numberTrackerInstances > tree.numberDataValues){
			maxNumber = tree.numberTrackerInstances;	
		}
		else if (tree.numberEventInstances > tree.numberDataValues){
			maxNumber = tree.numberEventInstances;
		}
		else{
			maxNumber = tree.numberDataValues
		}
	}
	else{
		maxNumber = tree.numberDataElements
	}
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
	else if (d.type == "Event"){
		nodeColor = "#467e4a";
	}
	else if (d.type == "Tracker"){
		nodeColor = "#53a93f";
	}
	else{
		//It is a data element
		nodeColor = color(d.parent);
	}

	return nodeColor;
}
