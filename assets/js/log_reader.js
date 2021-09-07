var logs = {};
var characters = {};
var canvas;
var canvasHeight = 500;
var firstTime;
var testvar = false;
// Area stuff
var areaCoord = {};
var areaHeaderY = 10;
var areaHeaderLeftMar = 0;
var areaHeaderSpacing = 100;
var areaHeaderBottom = 0;
var timeColWidth = 100;
var pointSpacing = 4;
var pointX = -(areaHeaderSpacing/2) + pointSpacing;
//SVG stuff
var svgGroup = {};
var g;
var lineg;
var timeScale
var blockHeight = 1;

var namelistWidth = $("#controlPanel").width() + 10;

//var colours = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];
var colours = ["#e57373", "#d91d00", "#7a432f", "#e6bbac", "#8c6246", "#ff0044", "#6e2e8e", "#6c5336", "#c200f2", "#d98d36", "#ffd580", "#f23d9d", "#a6987c", "#e2ace6",  "#566573", "#673973",  "#9979f2", "#7f6600", "#e6f23d", "#7a9900", "#b4e6ac", "#20802d", "#00330e", "#39e667", "#608071", "#755102", "#3df2e6", "#007780", "#132526", "#80e6ff", "#308fbf", "#205380", "#002e73", "#50592d", "#397ee6", "#0041f2","#260a00", "#acbbe6", "#0d1233", "#0e0066", "#26001f", "#7f0044", "#664d53", "#661a24"];



$(document).ready(function(){


  //File reader
  const fileSelector = document.getElementById('file-selector');
  fileSelector.addEventListener('change', (event) => {
      const fileList = event.target.files;
      for (let i = 0; i < fileList.length; i++) {
          logs[fileList[i].name.split(".log")[0]] = {}
          logs[fileList[i].name.split(".log")[0]]["file"] = fileList[i]
          //logs[fileList[i].name.split(".log")[0]]["color"] = colours[Object.keys(logs).length-1]
          //$("#nameList").append( "<li><font color='" + colours[Object.keys(logs).length-1] +"'>" + fileList[i].name.split(".log")[0] + "</font></li>" );
        }
  });

  $("#readbtn").click(function() {
    $(".roomName").remove();
    $(".name").remove();
    $(".vl").remove();
    $("#timeline").svg('destroy');
    $("#timeline").height(0);
    $("#timeline").width(0);
    $("#timeline").svg({onLoad: drawInitial});
    pointX = -(areaHeaderSpacing/2) + pointSpacing
    firstTime = null;
    characters = {};
    areaCoord = {};
    areaHeaderY = 10;
    areaHeaderBottom = 10;
    createTimeline()
  });

  $('#timeline').svg({onLoad: drawInitial});

  $("#timeline").height(500);
  $("#timeline svg").attr("height", $("#timeline").height());
})

function drawInitial(svg) {
  canvas = svg;
  timeScale = null;
  g = null;
  linegtwo = null;
  lineg = null;
  travelLines = null;
  timeScale = canvas.group({id: "timeScale", stroke: 'black', transform: "translate(" + namelistWidth + ",0 )"});
  g = svg.group({id: "g", stroke: 'black'}); 
  linegtwo = svg.group({id: "linegtwo", stroke: 'black', strokeWidth: 2, transform: "translate("+ ((namelistWidth + areaHeaderSpacing/2) + timeColWidth) +",0)"});
  lineg = svg.group({id: "lineg", stroke: 'black', strokeWidth: 2, transform: "translate("+ ((namelistWidth + areaHeaderSpacing/2) + timeColWidth) +",0)"});
  travelLines = svg.group(lineg, {id: "travelLines", stroke: "blue"}); 
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

function createTimeline() {
  var time = [$("#fromHour").val(), $("#fromMinute").val(), $("#fromSecond").val()]
  let now = new Date();
  var fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
  time = [$("#toHour").val(), $("#toMinute").val(), $("#toSecond").val()]
  var toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
  $("#travelLines").attr("transform", "translate("+ 0 +","+ areaHeaderBottom +")")
  var Ypos = 0; 
  for (const [key, value] of Object.entries(logs)) {
    var reader = new FileReader();
    reader.readAsText(logs[key]["file"]);
    reader.onload = function(){
      var lines = this.result.split('\n');
      var prevMoveDate = -1;
      for(var line = 0; line < lines.length-1; line++){
        var lineTime = getLineTime(lines[line]);
        var lineDate = getLineDate(lines[line]);
        // Check if line have timestampt and if it's between the requested timeframe
        if (lineTime >= fromDate.toLocaleTimeString('en-UK') && getLineTime(lines[line]) <= toDate.toLocaleTimeString('en-UK')) {
          var lineData = readLine(lines[line]);
          if (lineData != -1) {

            if ("area" in lineData) { // If it's a movement line
              if (firstTime == null) {
                firstTime = getLineTime(lines[line]);
                drawTimescale()
              };
              if ("ID" in lineData) {
                if (lineData["ID"] in characters == false) { //Character is not in the list
                  characters[lineData["ID"]] = {};
                  characters[lineData["ID"]]["name"] = lineData["character"];
                  characters[lineData["ID"]]["Xpos"] = pointX;
                  pointX += pointSpacing;
                  characters[lineData["ID"]]["prevArea"] = -1;
                  characters[lineData["ID"]]["color"] = colours[Object.keys(characters).length-1];
                  $("#nameList").append( "<li class='name'><button id=" + lineData["ID"] + "vis class='far fa-eye'></button><font id= '" + lineData["ID"] + "' color='" + characters[lineData["ID"]]["color"] +"'>[" + lineData["ID"] + "]" + lineData["character"] + "</font></li>" );
                  canvas.polyline($("#travelLines"), [], {fill: 'none', stroke: characters[lineData["ID"]]["color"], strokeWidth: 2, id: lineData["ID"] + "line"});
                  $("#"+lineData["ID"]+"vis").on("click", function(){
                    console.log($(this));
                    var number = $(this).attr("id").split("vis")[0];
                    if($(this).attr("class") == "far fa-eye") {
                      $(this).attr("class", "fas fa-eye-slash");
                      $("#"+number+"line").attr("style", "visibility: hidden;");
                      $("."+number+"point").attr("style", "visibility: hidden;");
                    }else{
                      $(this).attr("class", "far fa-eye");
                      $("#"+number+"line").attr("style", "visibility: visible;");
                      $("."+number+"point").attr("style", "visibility: visible;");
                    }
                  });
                }
                // If a new name belong to that ID and it doesn't contain custom, change to that
                //if (characters[lineData["ID"]]["name"] != lineData["character"] && characters[lineData["ID"]]["name"].search("Custom") == -1) {
                //  characters[lineData["ID"]]["name"] == lineData["character"];
                //  $("#nameList #" + lineData["ID"]).html("["+ lineData["ID"] + "]" + lineData["character"]);
                //};
              }
              if (lineData["area"] in areaCoord == false) { // Area not yet have a collumn
                areaCoord[lineData["area"]] = ((Object.keys(areaCoord).length) * areaHeaderSpacing);
                var lineX = areaCoord[lineData["area"]] - (areaHeaderSpacing/2) + ((Object.keys(areaCoord).length) * 0.15)
                canvas.line(linegtwo, lineX, 0, lineX, 50000, {stroke: "black"});
                $("#graphHeader").append('<div id ="' + lineData["area"] + '" class="roomName sticky">' + formatString(lineData["area"]) + '</div><div class="vl"></div>');
                document.getElementById(lineData["area"]).style.margin = (areaHeaderSpacing/2)-1.45 + "px";
                if (Object.keys(areaCoord).length == 1) {
                  document.getElementById(lineData["area"]).style.marginLeft = ((areaHeaderSpacing/2) + timeColWidth + namelistWidth) + "px";
                };
                if ($("#timeline").width != $("#graphHeader").width() + namelistWidth) { // Check if we don't run out of space, if yes, make the canvas wider
                  var canvasWidth = $("#timeline").width();
                  $("#timeline").width( namelistWidth + $("#graphHeader").width() - namelistWidth);
                  $("#timeline svg").attr("width", $("#timeline").width());

                }
              }
              // Place new point
              if (prevMoveDate != -1) {
                var dateDiff = Math.abs(lineDate - prevMoveDate);
                Ypos += Math.ceil(dateDiff / (1000)) * blockHeight;
              }
              if ($("#" + lineData["ID"] + "line").attr('points') == undefined) {
                $("#" + lineData["ID"] + "line").attr("points"," " + (areaCoord[lineData["area"]] + characters[lineData["ID"]]["Xpos"]) + ", " + Ypos);
              } else {
                $("#" + lineData["ID"] + "line").attr("points", $("#" + lineData["ID"] + "line").attr('points') + " " + (characters[lineData["ID"]]["prevArea"] + characters[lineData["ID"]]["Xpos"]) + ", " + Ypos);
                $("#" + lineData["ID"] + "line").attr("points", $("#" + lineData["ID"] + "line").attr('points') + " " + (areaCoord[lineData["area"]] + characters[lineData["ID"]]["Xpos"]) + ", " + Ypos);
              }
              canvas.circle($("#travelLines"), (areaCoord[lineData["area"]] + characters[lineData["ID"]]["Xpos"]), Ypos, 3, {fill: 'red', 
              stroke: $("#" + lineData["ID"] + "line").attr("stroke"), strokeWidth: 2,class: lineData["ID"] + "point"});
              if (areaHeaderBottom + Ypos > $("#timeline").height()) { //If we run out of vertical space, add to height
                $("#timeline").height(areaHeaderBottom + Ypos + 100);
                $("#timeline svg").attr("height", $("#timeline").height());
                $("#content").height($("#timeline").height());
              }
              characters[lineData["ID"]]["prevArea"] = areaCoord[lineData["area"]]
              prevMoveDate = lineDate;
            } else { // If it's a message line

            }
          }
        }
      }
    }
  }
  canvas.line(g, 0, areaHeaderBottom, $("#timeline svg").attr("width"), areaHeaderBottom, {strokeWidth: 5});
}

function drawTimescale() {
  console.log("I'M DOING IT MR. KRAB!")
  var time = firstTime.split(":");
  var Hour = time[0]
  var Minute = time[1]
  var Yoffset = (60 - time[2]) * blockHeight;
  if (Yoffset == 60) {Yoffset = 0} else {Minute++};
  for (let i = 0; i < 400; i++) {
    var lineY = areaHeaderBottom + Yoffset + (i* (60 * blockHeight));
    canvas.line(timeScale, timeColWidth/2+30, lineY, 50000, lineY);
    //canvas.text(timeScale, (timeColWidth/2)-100, lineY, Hour + ":" + Minute, {fontSize: "5"});
    canvas.text(timeScale,(timeColWidth/2)-50, lineY+10, Hour + ":" + Minute ,{fontFamily: 'Verdana', fontSize: '0.2em', fill: 'black'});
    Minute++;
    if (Minute == 60) {
      Hour++;
      Minute = 0;
    }
  }
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
        if (line.search("leaves to") != -1 || line.search("moves from") != -1 || line.search("Attempting to kick") != -1) {
          lineResult["area"] = line.split("] ")[line.split("] ").length - 1].split(".")[0];
          //[OOC][V aug. 22 18:24:06 2021 GMT] $H: [27] Chadwick leaves to [20] [20] Town.
          if (line.search("leaves to") != -1) {
            if (line.search("leaves to") != -1) {
              lineResult["character"] = line.split("]")[3].split(" leaves")[0]
              lineResult["ID"] = line.split("]")[2].split("[")[1];
            }
          }
          if (line.search("moves from") != -1) {
            lineResult["character"] = line.split("]")[3].split(" moves")[0];
            lineResult["ID"] = line.split("]")[2].split("[")[1];
          }
          if (line.search("Attempting to kick") != -1) {
            lineResult["character"] = line.split("]")[3].split(" [")[0];
            lineResult["ID"] = line.split("]")[2].split("[")[1];
          }
          return lineResult;
        } else {
          return -1;
        };
      } else {
        return -1;
      };
    }
  }
}
 function formatString(theString) {
  if (theString.lastIndexOf(" ") == theString.length-1) {
    theString = theString.substr(0, theString.length-1);
  }
  return theString.replace(/ /g, "_");
}