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

curIndex = 1;

/************************* Overview *****************************/
function DrawOverview(index) {
  var element = document.getElementById("overview");
  var overviewNode, wordcloudNode;
  if(element != null){
    overviewNode = d3.select("#overview");
    wordcloudNode = d3.select("#wordcloud")
  }
  else{
    overviewNode = d3.select("body").append("div")	
                    .attr("id", "overview")
                    .attr("class", "row");
    var profile = overviewNode.append("div")	
                    .attr("class", "leftcolumn");
    profile.append("h2")	
          .attr("id", "title")
          .text(dataList[index].title);
    profile.append("p")	
          .attr("id", "tag")
          .text(dataList[index].tag);
    profile.append("p")	
          .attr("id", "description")
          .text(dataList[index].overview);
    wordcloudNode = overviewNode.append("div")	
                .attr("id", "wordcloud")
                .attr("class", "leftcolumn");
  }

  var keywords=[];
  dataList[index].keywords.forEach(function(keyword){
    keywords.push({
      "text": keyword.name,
      "size": 12 + Math.random() * 30
    })
  })

  var color = d3.scaleLinear()
                .domain([0,1,2,3,4,5,6,10,15,20,100])
                .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

  d3.layout.cloud().size([500, 400])
          .words(keywords)
          .rotate(0)
          .fontSize(function(d) { return d.size; })
          .on("end", draw)
          .start();

  function draw(words) {
    var element = document.getElementById("word");
    if(element == null){
    wordcloudNode.append("svg")
        .attr("width", 500)
        .attr("height", 400)
        .attr("id", "word")
        .append("g")
        // without the transform, words words would get cutoff to the left and top, they would
        // appear outside of the SVG area
        .attr("transform", "translate(150,200)")
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
  }
}

function RemoveOverview(){
  var element = document.getElementById("overview");
  if(element != null)
    element.parentNode.removeChild(element);
}
/************************* calendar *****************************/
function DrawCalendar(data) {
  var width = 960,
  height = 136,
  cellSize = 17; // cell size

  var percent = d3.format(".1%"),
      format = d3.timeFormat("%Y-%m-%d");

  var color = d3.scaleQuantize()
      .domain([0.0, 10.0])
      .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

  var element = document.getElementById("calendar");
  var calendarNode;
  if(element != null){
    calendarNode = d3.select("#canlendar");
  }
  else{
    calendarNode = d3.select("body").append("div")	
    .attr("id", "calendar");
  }

  var svg_calendar = calendarNode.selectAll("svg")
      .data(d3.range(2000, 2018))
      .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn")
      .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    svg_calendar.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

  var rect = svg_calendar.selectAll(".day")
      .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d),d) * cellSize; })
      .attr("y", function(d) { return d.getDay() * cellSize; })
      .datum(format);

  rect.append("title")
      .text(function(d) { return d; });

  svg_calendar.selectAll(".month")
      .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);

  var calendarData = d3.nest()
    .key(function(d) { return d.release_date; })
    .rollup(function (d) {
        //return (d[0].Close - d[0].Open) / d[0].Open;
        //return 0.3;
        return{
          vote: d[0].vote_average,
          title: d[0].title
        };
        //return d[0].vote_average;
    })
    .map(data);

  console.log(calendarData);

  rect.filter(function (d) {return calendarData.has(d); })
      .attr("class", function (d) {return "day " + color(calendarData.get(d).vote); })
      .select("title")
      .text(function (d) {return calendarData.get(d).title + "\nVote average: " + calendarData.get(d).vote; });
  
  //console.log(rect)

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0),t0),
      d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1),t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
  }
}

function RemoveCalendar(){
  var element = document.getElementById("calendar");
  if(element != null)
    element.parentNode.removeChild(element);
}
/************************* bubble chart *****************************/
function DrawBubble() {
  var element = document.getElementById("bubble");
  var bubbleNode, div;
  if(element != null){
    bubbleNode = d3.select("#bubble");
    div = d3.select("#bubbletooltip");
  }
  else{
    bubbleNode = d3.select("body").append("div")	
    .attr("id", "bubble");
    // Define the div for the tooltip
    div = d3.select("body").append("div")	
    .attr("id", "bubbletooltip")
    .attr("class", "tooltip")				
    .style("opacity", 0);
  }

  var svg_bubble = bubbleNode.append('svg')
            .attr('width', window.innerWidth)
            .attr('height', window.innerHeight);

  // title
  /*svg_bubble.append("text")
  .attr("x", 10)   
  .attr("y", 10 )
  .attr("dy", "3.5em" )
  .attr("text-anchor", "start")  
  .style("font-size", "20px")  
  .style("font-weight", "bold")
  .text("category")*/

  var pack = d3.pack()
  .size([width-150, height*2-300])
  .padding(1.5);

  var color = d3.scaleOrdinal()
      //.domain(genreData)
      .range(['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6',
      '#ffe9a8','#b9bfe3','#fddaec','#cccccc']);

  var root = d3.hierarchy({children: genreData})
    .sum(function(d) { return d.value; })

  //console.log(root);

  var node = svg_bubble.selectAll(".node")
  .data(pack(root).leaves())
  .enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("circle")
  .attr("id", function(d) { return d.id; })
  .attr("r", function(d) { return d.r; })
  .style("fill", function(d) { return color(d.value); })
  .on("mouseover", function(d) {		
  div.transition()		
  .duration(200)		
  .style("opacity", .9);	
  var duration = 300;
  genreMap.forEach(function(d, i) {
  node.transition()
  .duration(duration)
  .delay(i * duration)
  .attr("r", d.value);
  });

  div.html(d.data.name + ": <br>"+d.value  )	
  .style("left", (d3.event.pageX) + "px")		
  .style("top", (d3.event.pageY - 28) + "px");	
  })					
  .on("mouseout", function(d) {		
  div.transition()		
  .duration(500)		
  .style("opacity", 0);	
  })
  .on("click", function(d){
  console.log(d.data.name);
  var filter = dataList.filter(function(movie) {
  flag = false;
  movie.genres.forEach(function(genre){
  if(genre.name == d.data.name)
    flag = true;
  })
  //console.log(movie.title)
  return flag;
  });
  filter.forEach(function(movie){
      //console.log(movie);
      bubbleNode.append("a")	
            .attr("class", "recommend")
            .attr("onclick", "main:LoadOverview("+movie.id+")")
            .text(movie.title);
      bubbleNode.append("p");
    })
  });

  console.log(dataList);

  node.append("text")
  .text(function(d) {
  if (d.value > 300){
  return d.data.name;
  }
  return "";});

  //console.log(node);

  /*var legend = svg.selectAll(".legend")
  .data(genreData).enter()
  .append("g")
  .attr("class","legend")
  .attr("transform", "translate(" + 780 + "," + 120+ ")");

  legend.append("rect")
  .attr("x", 0) 
  .attr("y", function(d, i) { return 20 * i; })
  .attr("width", 15)
  .attr("height", 15)
  .style("fill", function(d) { return color(d.name)});

  legend.append("text")
  .attr("x", 25) 
  .attr("text-anchor", "start")
  .attr("dy", "1em") 
  .attr("y", function(d, i) { return 20 * i; })
  .text(function(d) {return d.name;})
  .attr("font-size", "12px"); 

  legend.append("text")
  .attr("x",31) 
  .attr("dy", "-.2em")
  .attr("y",-10)
  .text("Call Type")
  .attr("font-size", "17px"); */
}

function RemoveBubble(){
  var element = document.getElementById("bubble");
  if(element != null)
    element.parentNode.removeChild(element);
  element = document.getElementById("bubbletooltip");
    if(element != null)
      element.parentNode.removeChild(element);  
}
/*var svg = body.append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight);*/

/************************* choose view ****************************/
function LoadBubbleView(){
  RemoveOverview();
  RemoveCalendar();
  DrawBubble();
}

function LoadCalendarView(){
  RemoveOverview();
  RemoveBubble();
  DrawCalendar(fullData);
}

function LoadOverview(index=1){
  RemoveCalendar();
  RemoveBubble();
  if(curIndex != index)
    curIndex = index;
  DrawOverview(curIndex);
}
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
var fullData;
var dataSrc = {};
var dataList = [];
var genreList = [];
//d3.csv('Mobile_Food_Facility_Permit.csv').then(function(data) {
d3.csv('tmdb_5000_movies.csv').then(function(data) {
    // we have our data in here now
    fullData = data;
    count = 0
    //For each data entry
    //This is where you will modify the data before storing it
    data.forEach(function(datum) {
      dataSrc[count] = datum
      var dataItem = {
        keywords: JSON.parse(datum.keywords),
        title: datum.title,
        overview: datum.overview,
        tag: datum.tagline,
        genres: JSON.parse(datum.genres),
        id: count
      };
      dataList.push(dataItem);
      dataItem.genres.forEach(function(genre){genreList.push(genre.name)});
      count += 1
    });

    // construct map for bubble chart
    genreMap = genreList.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map())
    tempArr = Array.from(genreMap.keys())
    Array.from(genreMap.values())
    //genreMap.get(tempArr[0])
    console.log(genreMap)

    genreData = [];
    genreMap.forEach(function(v, key){
      //console.log(key + ":" + v)
      var item = {
        name: key,
        value: v
      };
      genreData.push(item);
    });

    //DrawOverview(curIndex);
    RemoveOverview();

    DrawCalendar(data);
    //RemoveCalendar()
    
    //DrawBubble();
    RemoveBubble();
  });