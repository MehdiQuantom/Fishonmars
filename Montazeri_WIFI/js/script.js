function coolal(type, title, text) {
  //Create the alert
  var alert = $("body").append(
    "<div id='coolal' class=" + type + "><h1 class='coolal-title'>" + 
    title +
    "</h1><p class='coolal-text'>" +
    text +
    "</p></div>"   
  );
  
  var coolal = $("#coolal");
  
  //Check what type of alert is being used 
  if ( type == "alert") {
    $("#coolal").append(      
      "<div id='coolal-btnWrapper'><a id='coolal-btn' class='coolal-alert' href='#'>OK</a></div>"
    );

    var coolalAlert = $(".coolal-alert");

    coolalAlert.click(function(){
      coolal.animate({
        "opacity":"0",
        "top":"70%" 
      }, 200);

      setTimeout(function() {
        coolal.remove();
      }, 500);
    });
  }
  
  if ( type == "yes-no" ) {
    $("#coolal").append(      
      "<div id='coolal-btnWrapper'><a id='coolal-btn' class='coolal-yes-no coolal-yes' href='http://mehdiquantom.hyperphp.com/'>Yes</a><a id='coolal-btn' class='coolal-yes-no coolal-no' href='#'>No</a></div>"
    );

    var yesNo = $(".coolal-yes-no");
    var yes = $(".coolal-yes");
    var no = $(".coolal-no");

    no.click(function(){
      coolal.animate({
        "opacity":"0",
        "top":"70%"
      }, 200);

      setTimeout(function() {
        coolal.remove();
      }, 500);
    });
  } 
  
  //Resize the alert windows to fit the content
  var titleHeight = $(".coolal-title").innerHeight();
  var textHeight = $(".coolal-text").innerHeight();
  var btnWrapperHeight = $("#coolal-btn").height();
 
  if ( type != "" ) {
    $("#coolal").css("height", titleHeight + textHeight + btnWrapperHeight);
  } else { 
    $("#coolal").css("height", titleHeight + textHeight); 
  }  
   
  $("#coolal").animate({
    "opacity":"1",
    "top":"0" 
  }, 200); 
} 

//////////////////////////////////////////////////
$(document).ready(function() { 
  setTimeout(function() {
    coolal("alert"/*Change this value to "alert" or "yes-no"*/, "Mehdi Quantom", "<br /> Press Submit{تایید}");
  }, 1000)
});