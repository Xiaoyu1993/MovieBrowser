// Example adapted from Mike Bostock: https://bl.ocks.org/mbostock/3885304
// Modified to work with d3.v5
// https://blog.csdn.net/qq_34414916/article/details/80026029
console.log('Hello from main.js');

// some margins for our graph (so it fits our SVG viewport nicely)
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 80
};

// create our SVG canvas and give it the height and width we want
var body = d3.select("body");
/*var svg = body.append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight);*/

// height and width of our chart
var width = window.innerWidth - margin.left - margin.right;
var height = window.innerHeight - margin.top - margin.bottom;

// x and y scales, the input domain is our data and the output range
// is a position value within the visualization's viewport
var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
var y = d3.scaleLinear().rangeRound([height, 0]);
/*
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);*/

// define a group for our visualization
// this is good practice (to keep things clustered into their relevant groups),
// and lets you manipulate the entire group
/*var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');*/

// select which file you want to load in our CSV file
var dataSrc = {};
//var facility = [];
var keywordsList = [];
var titleList = []
var dscrpList = []
var tagList = []
//d3.csv('Mobile_Food_Facility_Permit.csv').then(function(data) {
d3.csv('tmdb_5000_movies.csv').then(function(data) {
    // we have our data in here now
    count = 0
    //For each data entry
    //This is where you will modify the data before storing it
    data.forEach(function(datum) {
      dataSrc[count] = datum
      //facility.push(datum)
      keywordsList.push(JSON.parse(datum.keywords))
      titleList.push(datum.title)
      dscrpList.push(datum.overview)
      tagList.push(datum.tagline)
      count += 1
    });

    

    console.log(keywordsList)

    curIndex = 20;

    var p = body.selectAll("#title");
    console.log(p)
    p.text(titleList[curIndex]);

    var p1 = body.selectAll("#description");
    console.log(p)
    p1.text(dscrpList[curIndex]);

    var p2 = body.selectAll("#tag");
    console.log(p)
    p2.text(tagList[curIndex]);

    var keywords=[];
    keywordsList[curIndex].forEach(function(keyword){
      keywords.push({
        "text": keyword.name,
        "size": 8 + Math.random() * 30
      })
    })

    var color = d3.scaleLinear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    d3.layout.cloud().size([500, 300])
            .words(keywords)
            .rotate(0)
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();

    function draw(words) {
        d3.select("#wordcloud").append("svg")
                .attr("width", 550)
                .attr("height", 350)
                .attr("class", "wordcloud")
                .append("g")
                // without the transform, words words would get cutoff to the left and top, they would
                // appear outside of the SVG area
                .attr("transform", "translate(320,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
    }
});

/*
// Encapsulate the word cloud functionality
/function wordCloud(selector) {

  var fill = d3.scaleOrdinal(d3.schemeCategory20);

  //Construct the word cloud's SVG element
  var svg = d3.select(selector).append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .append("g")
      .attr("transform", "translate(250,250)");


  //Draw the word cloud
  function draw(words) {
      var cloud = svg.selectAll("g text")
                      .data(words, function(d) { return d.text; })

      //Entering words
      cloud.enter()
          .append("text")
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr('font-size', 1)
          .text(function(d) { return d.text; });

      //Entering and existing words
      cloud
          .transition()
              .duration(600)
              .style("font-size", function(d) { return d.size + "px"; })
              .attr("transform", function(d) {
                  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .style("fill-opacity", 1);

      //Exiting words
      cloud.exit()
          .transition()
              .duration(200)
              .style('fill-opacity', 1e-6)
              .attr('font-size', 1)
              .remove();
  }


  //Use the module pattern to encapsulate the visualisation code. We'll
  // expose only the parts that need to be public.
  return {

      //Recompute the word cloud for a new set of words. This method will
      // asycnhronously call draw when the layout has been computed.
      //The outside world will need to call this function, so make it part
      // of the wordCloud return value.
      update: function(words) {
          d3.layout.cloud().size([500, 500])
              .words(words)
              .padding(5)
              .rotate(function() { return ~~(Math.random() * 2) * 90; })
              .font("Impact")
              .fontSize(function(d) { return d.size; })
              .on("end", draw)
              .start();
      }
  }

}

//Some sample data - http://en.wikiquote.org/wiki/Opening_lines
var words = [
  "You don't know about me without you have read a book called The Adventures of Tom Sawyer but that ain't no matter.",
  "The boy with fair hair lowered himself down the last few feet of rock and began to pick his way toward the lagoon.",
  "When Mr. Bilbo Baggins of Bag End announced that he would shortly be celebrating his eleventy-first birthday with a party of special magnificence, there was much talk and excitement in Hobbiton.",
  "It was inevitable: the scent of bitter almonds always reminded him of the fate of unrequited love."
]

//Prepare one of the sample sentences by removing punctuation,
// creating an array of words and computing a random size attribute.
function getWords(i) {
  return words[i]
          .replace(/[!\.,:;\?]/g, '')
          .split(' ')
          .map(function(d) {
              return {text: d, size: 10 + Math.random() * 60};
          })
}

//This method tells the word cloud to redraw with a new set of words.
//In reality the new words would probably come from a server request,
// user input or some other source.
function showNewWords(vis, i) {
  i = i || 0;

  vis.update(getWords(i ++ % words.length))
  setTimeout(function() { showNewWords(vis, i + 1)}, 2000)
}

//Create a new instance of the word cloud visualisation.
var myWordCloud = wordCloud('body');

//Start cycling through the demo data
showNewWords(myWordCloud);
*/

/*
var years = d3.nest()
  .key(d => d.date.getFullYear())
  .entries(data)
  .reverse();

var svg = d3.select(DOM.svg(width, height * years.length))
    .style("font", "10px sans-serif")
    .style("width", "100%")
    .style("height", "auto");

var year = svg.selectAll("g")
  .data(years)
  .enter().append("g")
    .attr("transform", (d, i) => `translate(40,${height * i + cellSize * 1.5})`);

year.append("text")
    .attr("x", -5)
    .attr("y", -5)
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(d => d.key);

year.append("g")
    .attr("text-anchor", "end")
  .selectAll("text")
  .data((weekday === "weekday" ? d3.range(2, 7) : d3.range(7)).map(i => new Date(1995, 0, i)))
  .enter().append("text")
    .attr("x", -5)
    .attr("y", d => (countDay(d) + 0.5) * cellSize)
    .attr("dy", "0.31em")
    .text(formatDay);

year.append("g")
  .selectAll("rect")
  .data(d => d.values)
  .enter().append("rect")
    .attr("width", cellSize - 1)
    .attr("height", cellSize - 1)
    .attr("x", d => timeWeek.count(d3.timeYear(d.date), d.date) * cellSize + 0.5)
    .attr("y", d => countDay(d.date) * cellSize + 0.5)
    .attr("fill", d => color(d.value))
  .append("title")
    .text(d => `${formatDate(d.date)}: ${format(d.value)}`);

const month = year.append("g")
  .selectAll("g")
  .data(d => d3.timeMonths(d3.timeMonth(d.values[0].date), d.values[d.values.length - 1].date))
  .enter().append("g");

month.filter((d, i) => i).append("path")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("d", pathMonth);

month.append("text")
    .attr("x", d => timeWeek.count(d3.timeYear(d), timeWeek.ceil(d)) * cellSize + 2)
    .attr("y", -5)
    .text(formatMonth);
*/

//var p = body.selectAll("p");
//p.text("Hello World");

/*       
var width = 960;
var height = 500;

var svg = d3.select("svg")

var projection = d3.geoMercator()
  .translate([427200 + width / 2, 142600 + height / 2])
  //.scale(width / 2 / Math.PI)
  .scale(200000)
  
var path = d3.geoPath()
  .projection(projection);

console.log(projection)

var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
// console.log(url)

//d3.json(url).then(function(geojson) {
d3.json("SanFrancisco.json").then(function(geojson) {
  console.log(geojson.features);
  svg.append("path")
    .attr("d", path(geojson))
  console.log(svg)
  });
*/

/*
var width = 500,
height = 400;
var color = d3.scaleOrdinal()
.domain([1,2,3,4,5,6,7,8,9])
.range( colorbrewer.Oranges[9]);

//var projection = d3.geoMercator()
//.scale(800)
//.translate([-500,600]);

//var projection = d3.geoMercator().scale(1100).translate([-1000,800]);
var projection = d3.geoMercator()
  //.scale(width / 2 / Math.PI)
  .scale(150000)
  .translate([320550 + width / 2, 106880 + height / 2])

var path = d3.geoPath()
.projection(projection);

var svg = d3.select("#map").append("svg")

.attr("viewBox", "0 0 500 400")
.attr("preserveAspectRatio", "xMidYMid meet");
var data;

var infoText = "";
//d3.json("test.json").then(function(sf) {
  //var cantons = topojson.feature(sf, sf.objects.india);
d3.json("SanFrancisco.topojson").then(function(sf) {
  var cantons = topojson.feature(sf, sf.objects.SanFrancisco);

  //svg.call(tip);
  var group=svg.selectAll("g")
  .data(cantons.features)
  .enter()
  .append("g");
  //.on('mouseover', tip.show)
  //.on('mouseout', tip.hide)

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .style("left", "300px")
    .style("top", "400px")
    .html(function(d) {
      return (d.Applicant);
    })
    
  svg.call(tip);

  var dotSize = 4;
  var link = null;;
  svg.selectAll(".pin")
    .data(facility)
    .attr("xlink:href", function(d) {
      console.log(p.Schedule);
      return p.Schedule;
    })
    .enter().append("circle", ".pin")
    .attr("r", dotSize)
    .attr("fill", function(d){
      if(d.Status == "EXPIRED")
        return "red"
      else if(d.Status == "SUSPEND" || d.Status == "REQUESTED") 
        return "#fff00b"
      return "#009C21"
    })
    .attr("stroke", "gray")
    .attr("transform", function(d) {
    return "translate(" + projection([
      parseFloat(d.Longitude),
      parseFloat(d.Latitude),
    ]) + ")";
    })
    .on('mouseover', function(d){
      tip.show(d);
      var info = body.select("#info");
      info.text("\n\n\n" 
      + "\nID: " + d.locationid 
      + "\nApplicant: " + d.Applicant
      + "\nFacilityType: " + d.FacilityType 
      + "\nAddress: " + d.Address
      + "\nFoodItems: " + d.FoodItems
      + "\nStatus: " + d.Status
      );
    })
    .on('click', function(p, i){
      window.open(p.Schedule);
    });

    console.log(svg)

  //var projection = d3.geo.mercator().scale(900).translate([-600,700]);
  

  var areas= group.append("path")
  .attr("d", path)
  .attr("class", "area")
  .attr("fill","#f5f8f8")
  .attr("stroke", "#0063b0")
  .attr("stroke-width", "2");
});

var centered = null;

function clicked(d) {
  var x, y, k;

  console.log(d)
  
  if (d && centered !== d) {
    var centroid = path.centroid(d);
    console.log(centered)
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}*/