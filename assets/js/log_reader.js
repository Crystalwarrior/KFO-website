var logs = {}
var names = []

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
          logs[fileList[i].name.split(".log")[0]] = fileList[i]
          $("#nameList").append( "<li>" + fileList[i].name.split(".log")[0] + "</li>" );
          names.push(fileList[i].name.split(".log")[0])
        }
      console.log(logs)
      console.log(names)
  });

  $("#readbtn").click(function() {
    //readByLine(logs[$("#name").val()])
    var time = [$("#hour").val(), $("#minute").val(), $("#second").val()]
    let now = new Date();
    var wantedTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
    console.log(wantedTime.toLocaleTimeString('en-UK'));
    //readLine(logs[names[0]], $("#name").val())
  });

  console.log($("#name").getCoord().y)
  
  //$("#timeline").height(500);

  $('#timeline').svg({onLoad: drawInitial});

  $("#timeline").height(500);
  $("#timeline svg").attr("height", $("#timeline").height());
})

var colours = ['purple', 'red', 'orange', 'yellow', 'lime', 'green', 'blue', 'navy', 'black'];

function random(range) {
	return Math.floor(Math.random() * range);
}

function drawInitial(svg) {
	svg.circle(75, 75, 50, {fill: 'none', stroke: 'red', strokeWidth: 3});
	var g = svg.group({stroke: 'black', strokeWidth: 2});
	svg.line(g, 15, 75, 135, 75);
	svg.line(g, 75, 15, 75, 135);
  svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  svg.rect(random(1200), random(500), random(100) + 100, random(100) + 100, {fill: colours[random(9)], stroke: colours[random(9)], strokeWidth: random(5) + 1});
  svg.text(52, 76, 'SVG');
  
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

function readingFile(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(){
    // By lines
    var lines = this.result.split('\n');
    for(var line = 0; line < lines.length-1; line++){
      console.log(line + " --> "+ lines[line]);
    }
  }
}

function getLineTime(file, line) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(){
    if (lines[line].split(" GMT] ").length > 1){
      var timeResult = lines[line].split(" GMT] ")
      timeResult = timeResult[0].split(" ")
      let now = new Date();
      timeResult = new Date(timeResult["time"][timeResult["time"].length - 1], now.getMonth(), timeResult["time"][timeResult["time"].length - 3], ...time);
      return timeResult.toLocaleTimeString('en-UK')
    } else {
      return -1;
    }
  }
}

function readLine(file, line) { //Check if message is an IC message and return time, character and the message, or if a movement message and return area
  var reader = new FileReader();
  var lineResult = {};
  reader.readAsText(file);
  reader.onload = function(){
    // By lines
    var lines = this.result.split('\n');
    console.log(lines[line]);
    // Check if the line a timestamped message
    if (lines[line].split(" GMT] ").length > 1){
      // Check if message is an IC message
      if (lines[line].split(" GMT] ")[0].search("[OOC]") == -1) {
        var firstSplit = lines[line].split(" GMT] ")
        lineResult["time"] = firstSplit[0].split(" ")
        time = lineResult["time"][lineResult["time"].length - 2].split(':');
        let now = new Date();
        lineResult["time"] = new Date(lineResult["time"][lineResult["time"].length - 1], now.getMonth(), lineResult["time"][lineResult["time"].length - 3], ...time);
        lineResult["character"] = firstSplit[1].split(": ")[0]
        lineResult["message"] = firstSplit[1].split(": ")[1]
        console.log(lineResult["time"]);
        console.log(lineResult["time"].toLocaleTimeString('en-UK'));
        console.log(lineResult["character"]);
        console.log(lineResult["message"]);
        return lineResult;
      } else {
        //Check if server sent the message
        if (lines[line].split(" GMT] ")[1].split(": ")[0] == "$H") {
          //Check if it's a movement message
          if (lines[line].search("Changed to area:") != -1 || lines[line].search("Following") != -1) {
            lineResult["area"] = lines[line].split("] ")[lines[line].split("] ").length - 1];
            console.log(lineResult["area"]);
            return lineResult;
          } else {
            return -1;
          }
        } else {
          return -1;
        }
      }
    }
  };
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