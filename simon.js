$(document).ready(function () {
  var WIN = 20;
  var sequence = [];
  var player_sequence = [];
  var strict = false;
  var on = false;
  var looping = false;
  var listening = false;
  var count = "---";
  var last_click = "";
  
  
  /** plays the sound corresponding to the color given as a param **/
  function audio (color) { 
    var num;
    var audio = document.createElement("audio");
    switch(color) {
      case "yellow" : num = 1; break;
      case "green" : num = 2; break;
      case "red" : num = 3; break;
        default : num = 4;
    }
    
    audio.src = "https://s3.amazonaws.com/freecodecamp/simonSound" + num + ".mp3";
       audio.play();
  }
  
  
  /** Makes a button flash and calls audio() tp play the corresponding sound **/
  function play (color) {
    if (on) {
    audio(color);
    $("." + color).addClass(color + "-flash");
    var unflash = function () {
      $("."+color).removeClass(color +"-flash");
    }
    
    window.setTimeout(unflash,500);
    }
  }

  /** returns the current sequence as an array of color names, rather than numbers **/
  function decryptSequence () {
    var decrypted = sequence.map(function (val) {
      switch(val) {
        case 0 : return "yellow";
        case 1 : return "green";
        case 2 : return "red";
        default : return "blue";
      }
    });
    return decrypted;
  }
  
  /**playSequence PLAYS THE PATTERN FOR THE PLAYER TO MIMIC-- THEN SETS "LISTENING" 
  equal to true, so that pressing the outer/musical buttons is enabled
  **/
  function playSequence(decrypted) {
    if (on) {
    var tempo;
    if (sequence.length < 5) tempo = 1400;
    else if (sequence.length < 9) tempo = 1000;
    else if (sequence.length < 13) tempo = 800;
    else tempo = 500;
    play(decrypted.shift());
    if (decrypted.length > 0) setTimeout(function() {playSequence(decrypted)}, tempo);
    else listening = true; 
    }
  }
  
  /** adds one random button press to the sequence, then updates the counter to 
  reflect the new length of the sequence. **/
  function addToSequence () {
    var next = Math.floor(Math.random() * 4);
    sequence.push(next);
    $("#cnt-p").text(sequence.length);
  }
  
  /** sets sequence variable to an empty array **/
  function clearSequence () {
    sequence = [];
  }
  
  /** Plays a buzzer sound, displays "!!" in the counter to signify that the last move 
  was incorrect, then, if in strict mode restarts the game. If not in strict mode 
  replays the current sequence. **/
  function play_incorrect () {
    listening = false;
    player_sequence = [];
    
     var audio = document.createElement("audio");
    audio.src = "http://esopp.github.io/Beep.mp3";
    audio.play();
    $("#cnt-p").text("!!");
    setTimeout(function () {
      $("#cnt-p").text("");
    }, 200);
    setTimeout(function () {
      $("#cnt-p").text("!!");
    }, 300);
    setTimeout(function () {
      $("#cnt-p").text("");
    }, 500);
    setTimeout(function () {
      $("#cnt-p").text("!!");
    }, 600);
    
    setTimeout(function () {
      if (strict) {
          clearSequence();
          addToSequence();
      }
      $("#cnt-p").text(sequence.length);
      playSequence(decryptSequence());
    }, 1000);   
  }

  //DISPLAYS "WIN" IN COUNTER 
  //play sound effect
  function play_win() {
    listening = false;
    var audio = document.createElement("audio");
    audio.src = "http://esopp.github.io/Ta-Da.mp3";
    audio.play();
    $("#cnt-p").text("win");
    setTimeout(function () {$("#cnt-p").text("");}, 300);
    setTimeout(function () {$("#cnt-p").text("win");}, 400);
    setTimeout(function () {$("#cnt-p").text("");}, 700);
    setTimeout(function () {$("#cnt-p").text("win");}, 800);
    setTimeout(function () {
       if (on) {
        clearSequence();
        addToSequence();
 playSequence(decryptSequence());
       }
    }, 2500);
  }
  
  //ADD FUNCTIONALITY TO START BUTTON
  $("#start").on("click", function () {
      if (on) {
        clearSequence();
        addToSequence();
        playSequence(decryptSequence());
      }
  });
  
  //ADD FUNCTIONALITY TO STRICT BUTTON
  $("#strict").on("click", function (){
  if (on) {
    strict = !strict;
    if (strict) $(".led").addClass("led-on");
    else $(".led").removeClass("led-on");
  }
  });
  
  //ADD FUNCTIONALITY TO ON-OFF BUTTON
  $("#onoff").on("click", function () {
    on = !on;
    listening = false;
    if (on) { 
      $(".off").addClass("on"); $(".on").removeClass("off");
      $("#cnt-p").text(count);
    }
    else { 
      $(".on").addClass("off"); $(".off").removeClass("on"); 
     if (strict) {
      $(".led").removeClass("led-on");
      strict = !strict;
     }
     $("#cnt-p").text("");
    }
  });
  
  //ADD FUNCTIONALITY TO BLUE BUTTON
  $(".blue").on("click", function () {
   if (listening) {
     var index;
     var seq = decryptSequence();
     player_sequence.push("blue");
     index = player_sequence.length - 1;
     if (player_sequence[index] == seq[index]) {
       play("blue");
       if (player_sequence.length == seq.length) {
         listening = false;
         player_sequence = [];
         if (sequence.length < WIN) {
         addToSequence();
         setTimeout(function () {playSequence(decryptSequence());}, 800);
         }
         else play_win();
       } 
     }
     else play_incorrect();    
    }  
  });
  
  //ADD FUNCTIONALITY TO RED BUTTON
  $(".red").on("click", function () {
   if (listening) {
     var index;
     var seq = decryptSequence();
     player_sequence.push("red");
     index = player_sequence.length - 1;
     //console.log("player_sequence[index]:", player_sequence[index], player_sequence.length,"seq[index]:", seq[index]);
     if (player_sequence[index] == seq[index]) { //console.log("correct");
       play("red");
       if (player_sequence.length == seq.length) {
         listening = false;
         player_sequence = [];
         if (sequence.length < WIN) {
         addToSequence();
         setTimeout(function () {playSequence(decryptSequence());}, 800);
         }
         else play_win();
        
       } 
     }
     else play_incorrect();    
    }          
  });
  
  //ADD FUNCTIONALITY TO YELLOW BUTTON
  $(".yellow").on("click", function () {
   if (listening) {
     var index;
     var seq = decryptSequence();
     player_sequence.push("yellow");
     index = player_sequence.length - 1;
  //   console.log("player_sequence[index]:", player_sequence[index], player_sequence.length, "seq[index]:", seq[index]);
     if (player_sequence[index] == seq[index]) { //console.log("correct");
       play("yellow");
       if (player_sequence.length == seq.length) {
         listening = false;
         player_sequence = [];
         if (sequence.length < WIN) {
         addToSequence();
         setTimeout(function () {playSequence(decryptSequence());}, 800);
         }
         else play_win();
       
       } 
     }
     else play_incorrect();    
    }           
  });
  
  //ADD FUNCTIONALITY TO GREEN BUTTON
  $(".green").on("click", function () {
   if (listening) {
     var index;
     var seq = decryptSequence();
     player_sequence.push("green");
     index = player_sequence.length - 1;
     
     if (player_sequence[index] == seq[index]) { 
       play("green");
       if (player_sequence.length == sequence.length) {
         listening = false;
         player_sequence = [];
         if (sequence.length < WIN) {
         addToSequence();
         setTimeout(function () {playSequence(decryptSequence());}, 800);
         }
         else play_win();
       } 
     }
     else play_incorrect();    
    }           
  });
  
});