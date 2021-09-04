//const showdown = require("assets/js/showdown.min.js");

$(document).ready(function(){
    var rawText;

    const URL = 'https://raw.githubusercontent.com/Crystalwarrior/KFO-Server/master/docs/commands.md';
    fetch(URL)
    .then(res => res.text())
    .then(text => {
        console.log(text);
        generateCommands(text);
    })
    .catch(err => console.log(err));

});

function generateCommands(text) {
    // break the textblock into an array of lines
    var lines = text.split('\n');
    // remove one line, starting at the first position
    lines.splice(0,2);
    // join the array back into a single string
    text = lines.join('\n');
    //text = text.replace(/</g, "&#60;")
    var converter = new showdown.Converter();
    var html = converter.makeHtml(text);
    $("#center").append(html);
    addID();
    generateSidebar();
};

function addID() {
    var strongList = document.getElementsByTagName("strong");

    for (let element = 0; element < strongList.length; element++) {
        //console.log(strongList[element]);
        strongList[element].setAttribute("id", strongList[element].innerHTML);
        
    }
};

function generateSidebar() {
    var titleArray = document.getElementsByTagName("h2");
    for (let title = 0; title < titleArray.length; title++) {
        if (titleArray[title].innerHTML != "Disclaimer" && titleArray[title].innerHTML != "Privacy Notice") {
            $("#stillsidebar").append("<button id=" + titleArray[title].innerHTML.replace(" ", "_") + " class='collapsible'>" + titleArray[title].innerHTML + "</button>");
            $("#stillsidebar").append("<div id=" + titleArray[title].innerHTML.replace(" ", "_") + "div class='content' ></div>")
            $("#"+titleArray[title].innerHTML.replace(" ", "_")+"div").append("<ul style='list-style-type:none'></ul>")
            var listElements = titleArray[title].nextElementSibling.getElementsByTagName("strong")
            for (let element = 0; element < listElements.length; element++) {
                $("#"+titleArray[title].innerHTML.replace(" ", "_")+"div ul").append("<li><a href='#"+ listElements[element].innerHTML +"'>" + listElements[element].innerHTML + "</a></li>");
            }
        }
        sideButtonAddEvent();
    }
};

function sideButtonAddEvent() {
    var coll = document.getElementsByClassName("collapsible");
	
	for (var i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function() {
		this.classList.toggle("active");
		var content = this.nextElementSibling;
		if (content.style.maxHeight){
		  content.style.maxHeight = null;
		} else {
		  content.style.maxHeight = content.scrollHeight + "px";
		} 
	  });
	}
}