const house_price_colour = "steelblue"
const recorded_income_colour = "red"

//legend
var legend = d3.select("#legend")
var keys = ["Average House Price", "Average Recorded Income"]
var legend_color = d3.scaleOrdinal().domain(keys).range([house_price_colour,recorded_income_colour])
// Add one dot in the legend for each name.
var size = 20
legend.selectAll("mydots")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", 100)
    .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return legend_color(d)})

// Add one dot in the legend for each name.
legend.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 100 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return legend_color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 840 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#line-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Function to convert quarterly time-period
function convert_year_quarter_to_date(quarter,year) {
    quarter_number = Number(quarter.replace("Q", ""))
    quarter_month = (quarter_number -1) * 3 + 1
    return `${year}-${quarter_month}-01`
}

//Read the data
d3.csv("https://raw.githubusercontent.com/allenforjaz/sdv-assignment/main/data/house_prices_recorded_income_data.csv",
  // Format data
  function(d){
    converted_date = convert_year_quarter_to_date(d.quarter,d.year);
    converted_house_price = parseFloat(d.avg_house_price.replace(',',''));
    converted_recorded_income = parseFloat(d.avg_recorded_income.replace(',',''));
    const dateParser = d3.timeParse("%Y-%m-%d");
    return { date : dateParser(converted_date), house_price : converted_house_price, recorded_income : converted_recorded_income };
  },
  // Now I can use this dataset:
  function(data) {
    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.house_price; })])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .call(d3.axisLeft(y));

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
    .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable: where both the line and the brush take place
    var line = svg.append('g')
      .attr("clip-path", "url(#clip)")
    
    // Add the line
    line.append("path")
      .datum(data)
      .attr("class","line_houseprice")
      .attr("fill", "none")
      .attr("stroke", house_price_colour)
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.house_price) })
        )

    line.append("path")
      .datum(data)
      .attr("class","line_recordedincome")
      .attr("fill", "none")         //ATTR CAN BE PUT INTO CSS
      .attr("stroke", recorded_income_colour)            
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.recorded_income) })
        )   

    // Add the brushing
    line
    .append("g")
      .attr("class", "brush")
      .call(brush);

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      extent = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      line
          .select('.line_houseprice')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.house_price) })
          )
      line  
          .select('.line_recordedincome')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.recorded_income) })
          )
    }

    // If user double click, reinitialize the chart
    svg.on("dblclick",function(){
      x.domain(d3.extent(data, function(d) { return d.date; }))
      xAxis.transition().call(d3.axisBottom(x))
      line
        .select('.line_houseprice')
        .transition()
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d.house_price) })
      )
      line
        .select('.line_recordedincome')
        .transition()
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d.recorded_income) })
      )
    });
})