/**
Note on deviceorientation events:
On iOS 9 or later, these events will not work within an iframe. This does not seem to be an issue with tested desktop OS or iOS 8.
**/

var plane = document.querySelector('.plane');
var ball = document.querySelector('.ball');

var maxLeft = plane.clientWidth - ball.clientWidth;
var maxTop = plane.clientHeight - ball.clientHeight;

var g = 10;
var sg = 0;
var orientation = 0;

ball.style.left = '10px';
ball.style.top = '10px';

$(document).ready(function () {
  
  var gravity = setInterval(startGravity, 10);
function startGravity() {
  var pos = parseInt(ball.style.top.replace('px', ''), 10);
  
  if (pos >= (maxTop - g)) { clearInterval(gravity);
     if (g > 1) {
       g -=2;
       gravity = setInterval(bounce, 10);
     }
  }
  else {
    g += 1;
    ball.style.top = (pos + g) + 'px';
  }
}

function bounce () {
  var pos = parseInt(ball.style.top.replace('px', ''), 10);
    if (g > 0) {
      g--;
      ball.style.top = (pos - g) + "px";
    } 
  else {
    clearInterval(gravity);
    gravity = setInterval(startGravity, 10);
  }
  }

function roll() {
  var x = orientation;
   var posx = parseInt(ball.style.left.replace('px', ''), 10);
//  var posy= parseInt(ball.style.top.replace('px', ''), 10);
  if (x > 5 || x < -5)
     sg += x/15;
  else if (sg >= 1/2) sg+= x/25;
  else if (sg <= -1/2) sg+= x/25;
  else sg = 0;
  
  
     ball.style.left = (((posx + sg) > 0) && ((posx + sg) < maxLeft) ? (posx + sg) : (sg>0 ? (posx > 0 ? maxLeft : 0) : (posx <= maxLeft/2 ? 0 : maxLeft))) + "px";
   
    if (posx + sg >= maxLeft || posx + sg <= 0) { 
      if (sg < 3 && sg > -3) sg = 0;
      else sg = -sg/3;
      
    }
   
  
}  
  
function handleOrientation(e) {
 // var y = (e.beta > 90 ? 180 : (e.beta < -90 ? 0 : e.beta + 90));
 // var x = e.gamma + 90;
  orientation = e.gamma;
}
  
window.addEventListener('deviceorientation', handleOrientation);
setInterval(roll, 10);

});