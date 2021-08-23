var logs = {};
var canvas;
var canvasHeight = 500;
// Area stuff
var areaCoord = {};
var areaHeaderY = 10;
var areaHeaderLeftMar = 0;
var areaHeaderSpacing = 60;
var areaHeaderBottom = 0;
//SVG stuff
var svgGroup = {};
var g;
var lineg;
var blockHeight = 0.3;

var colours = ['mediumturquoise', 'mediumpurple', 'orange', 'yellow', 'lime', 'green', 'olive', 'tan', 'salmon', 'mintcream', 'tomato', 'gray', 'violet', 'beige', 'cyan'];

$(document).ready(function(){

  $("#btn1").hover(function(){
      $("p").hide();
  },
  function(){
      $("p").show();
  });
  $("#btn2").on("click", function(){
      $("p").show();
  });

  //File reader
  const fileSelector = document.getElementById('file-selector');
  fileSelector.addEventListener('change', (event) => {
      const fileList = event.target.files;
      for (let i = 0; i < fileList.length; i++) {
          logs[fileList[i].name.split(".log")[0]] = {}
          logs[fileList[i].name.split(".log")[0]]["file"] = fileList[i]
          logs[fileList[i].name.split(".log")[0]]["color"] = colours[Object.keys(logs).length-1]
          $("#nameList").append( "<li><font color='" + colours[Object.keys(logs).length-1] +"'>" + fileList[i].name.split(".log")[0] + "</font></li>" );
        }
      console.log(logs)
  });

  $("#readbtn").click(function() {
    $('#timeline').svg('destroy');
    $('#timeline').svg({onLoad: drawInitial});
    areaCoord = {};
    areaHeaderY = 10;
    areaHeaderBottom = 0;
    createTimeline()
    //readByLine(logs[$("#name").val()])
    //var time = [$("#fromHour").val(), $("#fromMinute").val(), $("#fromSecond").val()]
    //let now = new Date();
    //var wantedTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
    //console.log(wantedTime.toLocaleTimeString('en-UK'));
    //readLine(logs[names[0]], $("#name").val())
  });

  
  //$("#timeline").height(500);

  $('#timeline').svg({onLoad: drawInitial});

  $("#timeline").height(500);
  $("#timeline svg").attr("height", $("#timeline").height());
})

function random(range) {
	return Math.floor(Math.random() * range);
}

function drawInitial(svg) {
  canvas = svg;
  g = svg.group({stroke: 'black'}); 
  lineg = svg.group({stroke: 'black', strokeWidth: 2});
  travelLines = svg.group({stroke: "blue", transform: 'translate(0,0)', id: "travelLines"}); 
  //testPoly = canvas.polyline(travelLines, [[450,250], 
  //  [475,250],[475,220],[500,220],[500,250]], 
  //  {fill: 'none', stroke: 'blue', strokeWidth: 5, id: "polyTest"});
  //svgGroup["header"] = headerGroup;
	//canvas.circle(75, 75, 50, {fill: 'none', stroke: 'red', strokeWidth: 3});
	//var g = svg.group({stroke: 'black', strokeWidth: 2});
	//svg.line(g, 15, 75, 135, 75);
	//svg.line(g, 75, 15, 75, 135);
  //svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  //svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  //svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  //svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  //canvas.text(52, 76, 'SVG');
  
}

jQuery.fn.getCoord = function()
{
  var elem = $(this);
  var x = elem.offset().left;
  var y = elem.offset().top;

  return {
      "x" : x,
      "y" : y
  };
};

function readFile(file) {
  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function() {
    console.log(reader.result);
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
}

function createTimeline() {
  var time = [$("#fromHour").val(), $("#fromMinute").val(), $("#fromSecond").val()]
  let now = new Date();
  var fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
  time = [$("#toHour").val(), $("#toMinute").val(), $("#toSecond").val()]
  var toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
  var areaHeaderLine = canvas.line(g, 0, areaHeaderBottom, $("#timeline svg").attr("width"), areaHeaderBottom, {strokeWidth: 5});
  var charX = 20; 
  for (const [key, value] of Object.entries(logs)) {
    logs[key+"Y"] = 0;
    logs[key+"X"] = charX;
    charX += 5;
    canvas.polyline($("#travelLines"), [], {fill: 'none', stroke: logs[key]["color"], strokeWidth: 2, id: key + "line"});
    var reader = new FileReader();
    reader.readAsText(logs[key]["file"]);
    reader.onload = function(){
      //Search for the line where to log from
      var lines = this.result.split('\n');
      var prevMoveDate = -1;
      for(var line = 0; line < lines.length-1; line++){
        var lineTime = getLineTime(lines[line]);
        var lineDate = getLineDate(lines[line]);
        //Check if line have timestampt and if it's between the requested timeframe
        if (lineTime >= fromDate.toLocaleTimeString('en-UK') && getLineTime(lines[line]) <= toDate.toLocaleTimeString('en-UK')) {
          var lineData = readLine(lines[line]);
          //Check if the line is an IC message or movement
          if (lineData != -1) {

            if ("area" in lineData) { // If it's a movement line
              //console.log(lines[line]);
              if (lineData["area"] in areaCoord == false) { // Area not yet have a collumn
                areaCoord[lineData["area"]] = Object.keys(areaCoord).length * areaHeaderSpacing + 20;
                if (areaCoord[lineData["area"]] > $("#timeline").width()) {
                  var canvasWidth = $("#timeline").width();
                  $("#timeline").width(canvasWidth + 80);
                  $("#timeline svg").attr("width", $("#timeline").width());

                }
                var currentText = canvas.text(0, 0, lineData["area"]);
                canvas.configure(currentText, {transform: "translate(" + (areaCoord[lineData["area"]] + areaHeaderLeftMar) + ", " + areaHeaderY +") rotate(90)"}, false);
                canvas.line(lineg, (areaCoord[lineData["area"]] + 47), 0, (areaCoord[lineData["area"]] + 47), 50000);
                if (areaHeaderY + currentText.getBBox().width > areaHeaderBottom) {
                  areaHeaderBottom = 10 + areaHeaderY + currentText.getBBox().width;
                  canvas.configure(areaHeaderLine, {transform: "translate(0,"+ areaHeaderBottom +")"});
                  $("#travelLines").attr("transform", "translate(0,"+ areaHeaderBottom +")")
                }
              }
              // Place new point
              if (prevMoveDate != -1) {
                var dateDiff = Math.abs(lineDate - prevMoveDate);
                logs[key+"Y"] += Math.ceil(dateDiff / (1000)) * blockHeight;
              }
              if ($("#" + key + "line").attr('points') == undefined) {
                $("#" + key + "line").attr("points"," " + ((areaCoord[lineData["area"]] - (areaHeaderSpacing/2)) + logs[key+"X"]) + ", " + logs[key+"Y"]);
              } else {
                $("#" + key + "line").attr("points", $("#" + key + "line").attr('points') + " " + ((areaCoord[lineData["area"]] - (areaHeaderSpacing/2)) + logs[key+"X"]) + ", " + logs[key+"Y"]);
              }
              canvas.circle($("#travelLines"), ((areaCoord[lineData["area"]] - (areaHeaderSpacing/2)) + logs[key+"X"]), logs[key+"Y"], 3, {fill: 'red', 
              stroke: $("#" + key + "line").attr("stroke"), strokeWidth: 2});
              logs[key+"Y"] += blockHeight;
              if (areaHeaderBottom + logs[key+"Y"] + 80 > $("#timeline").height()) {
                canvasHeight += 50;
                $("#timeline").height(canvasHeight);
                $("#timeline svg").attr("height", $("#timeline").height());
              }
              //$("#polyTest").attr("points", $("#polyTest").attr("points") + " 100, 300 " + (areaCoord[lineData["area"]] + 25) + ", 350");
              prevMoveDate = lineDate;
            } else { // If it's a message line

            }
          }
        }
      }
    }
  }
  canvas.line(g, 0, areaHeaderBottom, $("#timeline svg").attr("width"), areaHeaderBottom, {strokeWidth: 5});
  //canvas.line(g, 450, 120, 550, 20, {strokeWidth: 5});
}

function getLineDate(line) {
  if (line.split(" GMT] ").length > 1){
    var timeResult = line.split(" GMT] ")
    timeResult = timeResult[0].split(" ")
    var time = timeResult[timeResult.length - 2].split(':');
    let now = new Date();
    timeResult = new Date(timeResult[timeResult.length - 1], now.getMonth(), timeResult[timeResult.length - 3], ...time);
    return timeResult;
  } else {
    return -1;
  }
}

function getLineTime(line) {
  if (line.split(" GMT] ").length > 1){
    var timeResult = line.split(" GMT] ")
    timeResult = timeResult[0].split(" ")
    var time = timeResult[timeResult.length - 2].split(':');
    let now = new Date();
    timeResult = new Date(timeResult[timeResult.length - 1], now.getMonth(), timeResult[timeResult.length - 3], ...time);
    return timeResult.toLocaleTimeString('en-UK');
  } else {
    return -1;
  }
}

function readLine(line) { //Check if message is an IC message and return time, character and the message, or if a movement message and return area
  var lineResult = {};
  // By lines
  // Check if the line a timestamped message
  if (line.split(" GMT] ").length > 1){
    // Check if message is an IC message
    if (line.split(" GMT] ")[0].search("[OOC]") == -1) {
      var firstSplit = line.split(" GMT] ")
      lineResult["time"] = firstSplit[0].split(" ")
      time = lineResult["time"][lineResult["time"].length - 2].split(':');
      let now = new Date();
      lineResult["time"] = new Date(lineResult["time"][lineResult["time"].length - 1], now.getMonth(), lineResult["time"][lineResult["time"].length - 3], ...time);
      lineResult["character"] = firstSplit[1].split(": ")[0]
      lineResult["message"] = firstSplit[1].split(": ")[1]
      return lineResult;
    } else {
      //Check if server sent the message
      if (line.split(" GMT] ")[1].split(": ")[0] == "$H") {
        //Check if it's a movement message
        if (line.search("Changed to area:") != -1) {
          lineResult["area"] = line.split("] ")[line.split("] ").length - 1].split(".")[0];
          return lineResult;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    }
  }
}

function drawIntro(svg) { 
  svg.circle(75, 75, 50, 
      {fill: 'none', stroke: 'red', strokeWidth: 3}); 
  var g = svg.group({stroke: 'black', strokeWidth: 2}); 
  svg.line(g, 15, 75, 135, 75); 
  svg.line(g, 75, 15, 75, 135); 
}

function readLogs() {

}