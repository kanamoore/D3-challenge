// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// // function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, circlesGroup) {
//   var label;

//   if (chosenXAxis === "poverty") {
//     label = "poverty:";
//   }

//   else {
//     label = "age:";
//   }

// var toolTip = d3
//   .tip()
//   .attr("class", "tooltip")
//   .offset([80, -60])
//   .html(function(d) {
//     return `${d.poverty}`;
//     // return `${d.poverty}<br>${label} ${d[chosenXAxis]}`;
//   });

//   circlesGroup.call(toolTip);

//   circlesGroup
//     .on("mouseover", function(data) {
//       toolTip.show(data);
//     })
//     // onmouseout event
//     .on("mouseout", function(data, index) {
//       toolTip.hide(data);
//     });

//   return circlesGroup;
// }

// Load data from data.csv
d3.csv("assets/data/data.csv")
  .then(function(stateData) {
    console.log(stateData);

    // Convert each value to a number
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    if (chosenXAxis === "poverty") {
      var yLinearScale = d3
        .scaleLinear()
        .domain([0, d3.max(stateData, d => d.healthcare)])
        .range([chartHeight, 0]);
    } else {
      var yLinearScale = d3
        .scaleLinear()
        .domain([0, d3.max(stateData, d => d.smokes)])
        .range([chartHeight, 0]);
    }

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g").call(leftAxis);

    /*Create the circle group for each state */
    var circles = chartGroup.selectAll("g circle").data(stateData);

    var r = 10;
    var circlesGroup = circles
      .enter()
      .append("g")
      .attr("id", "circlesGroup");

    // Generate circle
    circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", r)
      .classed("stateCircle", true);

    // Add text to circle
    circlesGroup
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.healthcare))
      .classed("stateText", true)
      .text(d => d.abbr)
      .attr("font-size", r * 0.9);

    var labelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty");

    var ageLabel = labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("active", true)
      .text("Age");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -10 - margin.left / 2)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Lacks Healthcare(%)");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Smoke");

    // updateToolTip function above csv import
    // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
        } else {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
        }
      }
    });
  })
  .catch(function(error) {
    console.log(error);
  });
