// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
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
    converted_date = convert_year_quarter_to_date(d.quarter,d.year)
    converted_house_price = parseFloat(d.avg_house_price.replace(',',''));
    converted_recorded_income = parseFloat(d.avg_recorded_income.replace(',',''));
    const dateParser = d3.timeParse("%Y-%m-%d")
    console.log(dateParser(converted_date))
    return { date : dateParser(converted_date), house_price : converted_house_price, recorded_income : converted_recorded_income }
  },

  // Now I can use this dataset:
  function(data) {

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.house_price; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.house_price) })
        )

})