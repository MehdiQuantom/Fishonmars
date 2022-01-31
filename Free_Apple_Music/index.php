<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8" http-equiv="refresh" content="7;url=https://www.shazam.com/applemusic" />
  <title>Mehdi Quantom</title>
  <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./style1.css">

  <link href="https://fonts.googleapis.com/css?family=Aldrich" rel="stylesheet" type="text/css">
<style>
 #typing-text {
     color: #FFFFFF;
     border: solid 5px #000000;
     font-weight: bold;
     text-align: center;
     font-family: Aldrich;
     overflow: auto;
     background-color: #000000;
     font-size: 40px;
     height: 100px;
     width: 739px;
     transform: rotateX(10deg);
     transform-origin: 50% 50% 0px;
     outline: none;
     resize: none;
     box-sizing: border-box;
}

</style>
</head>
<body>
<div class="type_box" style="perspective:200px;-webkit-perspective:200px;">
   <textarea id="typing-text" aria-label="typing text" readonly></textarea>
</div>
</head>
<body>



<div class="circles" id="circles">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    
    <aside class="warning">
        <span>Only Chrome, Firefox or Safari Are Supported !</span>
    </aside>
</div>
  
  <script>
(function () {
   var CharacterPos = 0;
   var MsgBuffer = "";
   var TypeDelay = 30; 
   var NxtMsgDelay = 1000;
   var MsgIndex = 0;
   var delay;
   var MsgArray = ["5 Months Free Of Apple Music ;)","Mehdi Quantom","Redirecting In 5 Seconds..."];

   function StartTyping() {
      var id = document.getElementById("typing-text");
      if (CharacterPos != MsgArray[MsgIndex].length) {
         MsgBuffer  = MsgBuffer + MsgArray[MsgIndex].charAt(CharacterPos);
         id.value = MsgBuffer+"_";
         delay = TypeDelay;
         id.scrollTop = id.scrollHeight; 
      } else {
         delay = NxtMsgDelay;
         MsgBuffer   = "";
         CharacterPos = -1;
         if (MsgIndex!=MsgArray.length-1){
           MsgIndex++;
         }else {
           MsgIndex = 0;
         }
       }
       CharacterPos++;
       setTimeout(StartTyping,delay);
   }
StartTyping();
})();
</script>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script><script  src="./script.js"></script>
</body>
</html>
