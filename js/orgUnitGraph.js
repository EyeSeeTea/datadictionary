
$(function(){
margin = {top: 20, right: 120, bottom: 20, left: 140};
originalWidth = 850;
originalHeight = 850;
width = originalWidth - margin.right - margin.left;
height = originalHeight - margin.top - margin.bottom;

maxNumberDataValues = 0
maxNumberDataElements = 0;

var root,
duration = 750,
i = 0;

tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(getTipContent);

tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });	

var svg = d3.select(".graphContent").append("svg")
//.attr("width", width + margin.right + margin.left)
.attr("width", '100%')
.attr("height", height + margin.top + margin.bottom)
//.attr("height", '100%')
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

initGraph = function (json){
	maxNumber = json.numberDataValues;
	
	root = json;
	root.x0 = height /2;
	root.y0 = 0;
	update();
}


update = function (){
	
  // Compute the new tree layout.
   var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.groups")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "groups")
      .attr("transform", function(d) { return "translate(" + root.y0 + "," + root.x0 + ")"; })
      .on("click", collapsibleTreeClick)
      .on("mouseover", showTip)
      .on("mouseout", tip.hide)
      .style("fill", color);

  nodeEnter.append("circle")
  	  .attr("class", "node")
  	  .attr("stroke", color)
      .attr("r", calculateRadius);

  nodeEnter.append("text")
//      .attr("x", function(d) { return d.children || d._children ? (-1 * calculateTextPosition(d)) : calculateTextPosition(d); })
  	  .attr("x", function(d) {return d.children || d.moveLabelToLeft ? (-1 * calculateTextPosition(d)) : calculateTextPosition(d); })
      .attr("y", "9")
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) {return d.children || d.moveLabelToLeft ? "end" : "start"; })
      .text(getLabel)
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", calculateRadius)
      .attr("stroke", color)
      .style("fill", color);

  nodeUpdate.select("text")
      .style("fill-opacity", function(d){ return d.hideLabel && d.children ? 1e-6 : 1;})
      .attr("x", function(d) { return d.children || d.moveLabelToLeft ? (-1 * calculateTextPosition(d)) : calculateTextPosition(d); })
      .attr("text-anchor", function(d) { return d.children || d.moveLabelToLeft ? "end" : "start"; })
      .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + root.y + "," + root.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", calculateRadius);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: root.x0, y: root.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: root.x, y: root.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

});