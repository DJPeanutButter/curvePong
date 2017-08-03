var hWindow         = 400,
    wWindow         = 1300,
    rBall           = 2.5,
    wPaddle         = 120,
    hPaddle         = 1,
    xBallStart      = 25,
    yBallStart      = 25,
    xPaddleStart    = wPaddle / 2,
    dXStart         = 5,
    dYStart         = 2.5,
    ddXStart        = 0,
    ddY             = 0.25,
    dPaddleStart    = 0,
    dMaxPaddle      = 20,
    yPaddle         = yBallStart + ddY * 25 * 51,
    scoreStart      = 100,
    nodeCount       = 3,
    xBall           = 0,
    yBall           = 0,
    xPaddle         = 0,
    dX              = 0,
    dY              = 0,
    ddX             = 0,
    dPaddle         = 0,
    score           = 0,
    keyLeft         = false,
    keyRight        = false,
    keyLeftUp       = true,
    keyRightUp      = true,
    fServe          = true,
    fPlayer         = true,
    fContact        = false,
    fFault          = false,
    playerOneWins   = 0,
    playerTwoWins   = 0,
    
    gameParameters  = {
      max:    document.createElement ("input"),
      last:   document.createElement ("input"),
      score:  document.createElement ("input"),
      pOne:   document.createElement ("input"),
      pTwo:   document.createElement ("input"),
      start:  function (){
        var nLastText = document.createElement ("span"),
            nMaxText  = document.createElement ("span"),
            scoreText = document.createElement ("span"),
            pOneText  = document.createElement ("span"),
            pTwoText  = document.createElement ("span");
            
        nLastText.appendChild (document.createTextNode ("Last"));
        nMaxText.appendChild  (document.createTextNode ("Max"));
        scoreText.appendChild (document.createTextNode ("Score"));
        pOneText.appendChild  (document.createTextNode ("Player 1"));
        pTwoText.appendChild  (document.createTextNode ("Player 2"));
        
        this.max.type   =
        this.last.type  =
        this.score.type =
        this.pOne.type  =
        this.pTwo.type  = "text";
        
        this.max.value    =
        this.last.value   =
        this.score.value  =
        this.pOne.value   =
        this.pTwo.value   = 0;
        
        this.last.onkeyup   =
        this.max.onkeyup    =
        this.score.onkeyup  =
        this.pOne.onkeyup   =
        this.pTwo.onkeyup   = function (e){
          var key = e.keyCode ? e.keyCode : e.which;
          if (key==13)
            this.blur ();
        };
        
        document.body.appendChild (nMaxText);
        document.body.appendChild (this.max);
        document.body.appendChild (nLastText);
        document.body.appendChild (this.last);
        document.body.appendChild (document.createElement ("br"));
        document.body.appendChild (scoreText);
        document.body.appendChild (this.score);
        document.body.appendChild (document.createElement ("br"));
        document.body.appendChild (pOneText);
        document.body.appendChild (this.pOne);
        document.body.appendChild (document.createElement ("br"));
        document.body.appendChild (pTwoText);
        document.body.appendChild (this.pTwo);
        
        nodeCount = document.body.childNodes.length;
        
        scoreText.style.width =
        nMaxText.style.width  =
        nLastText.style.width =
        pOneText.style.width  =
        pTwoText.style.width  = Math.max (nMaxText.scrollWidth,
                                          nLastText.scrollWidth,
                                          scoreText.scrollWidth,
                                          pOneText.scrollWidth,
                                          pTwoText.scrollWidth)+5;
        fServe=true;
      }
    },
    
    myGameArea = {
      canvas: document.createElement ("canvas"),
      start:  function (){
        keyLeft   =
        keyRight  =
        fContact  = !(keyLeftUp = keyRightUp = true);
        
        dPaddle                   = dPaddleStart;
        gameParameters.last.value = score;
        score                     = scoreStart;
        
        if (fServe){
          dX      = dXStart;
          ddX     = ddXStart;
          xBall   = xBallStart;
          xPaddle = xPaddleStart;
          dY      = dYStart;
          yBall   = yBallStart;
        }else{
          dY = -Math.abs (dY) + ddY;
          
          if (xBall > wWindow / 2 + wPaddle / 2 + rBall ||
              xBall < wWindow / 2 - wPaddle / 2 - rBall)
          
            xPaddle = wWindow / 2;
          else
            alert ("Paddle will not reset!");
        }
        
        this.canvas.width   = wWindow;
        this.canvas.height  = hWindow;
        this.context        = this.canvas.getContext ("2d");
        
        if (document.body.childNodes.length === nodeCount){
          document.body.appendChild (this.canvas);
          nodeCount++;
        }
        
        if (document.body.childNodes.length === nodeCount){
          gameParameters.start ();
          nodeCount--;
        }
        
        gameParameters.pOne.value = playerOneWins;
        gameParameters.pTwo.value = playerTwoWins;
        
        this.interval = setInterval (gameLoop, 20);
      },
      clear:  function(){
        this.context.clearRect (0, 0, this.canvas.width, this.canvas.height);
      },
      draw:   function(){
        this.context.fillStyle = "#373737";
        
        this.context.beginPath  ();
        this.context.arc        (xBall,
                                yBall,
                                rBall,
                                0,
                                Math.PI * 2,
                                true);
                                
        this.context.fill       ();
        this.context.closePath  ();
        this.context.fillRect   (xPaddle - wPaddle / 2,
                                 yPaddle - hPaddle / 2,
                                 wPaddle,
                                 hPaddle);
                                 
        this.context.font = "15px Arial";
        
        this.context.fillText ("Player " + (fPlayer ? "One" : "Two") +
                                (fServe ? " Serving" : "") +
                                (fServe && fFault ? "(F)" : ""),
                                10, 15);
                                
        this.context.fillRect (0, hWindow - 5, wWindow, 5);
        this.context.fillStyle = ((((score > gameParameters.last.value) &&
                                    !fServe) ||
                                  (fServe && fContact)) ? "#37c837" : "#c83737");
                                  
        this.context.fillRect (wWindow / 2 - wPaddle / 2, hWindow - 5, wPaddle, 5);
      }
    };
    
window.onkeydown = function (e){
  var key = e.keyCode ? e.keyCode : e.which;
  if (key === 37 && keyLeftUp)
    keyLeft = !(keyLeftUp = false);
  else if (key === 39 && keyRightUp)
    keyRight = !(keyRightUp = false);
  else if (key === 32 && !myGameArea.interval)
    myGameArea.start ();
};
    
window.onkeyup = function (e){
  var key = e.keyCode?e.keyCode:e.which;
  if (key == 37)
    keyLeft = !(keyLeftUp = true);
  else if(key == 39)
    keyRight = !(keyRightUp = true);
};
    
function gameLoop (){
  var fLose = false;
  
  xBall += dX;
  yBall += dY;
  dY    += ddY;
  score -= 0.1;
  
  if (xBall > myGameArea.canvas.width - rBall ||
      xBall < rBall){
    dX    = (dX *= -1) + ddX * -1;
    ddX   = 0;
    xBall = xBall > wWindow / 2 ? myGameArea.canvas.width - rBall : rBall;
    
    if (fServe)
      fLose = true;
  }
  
  if (yBall >= yPaddle - rBall - hPaddle / 2 &&
      yBall <= yPaddle + rBall + hPaddle / 2 &&
      xBall <= xPaddle + rBall + wPaddle / 2 &&
      xBall >= xPaddle - rBall - wPaddle / 2 || yBall < rBall){
        
    dY = (dY *= -1) + ddY;
    
    if ((dPaddle !== 0) && yBall > rBall){
      ddX = -dPaddle / 30;
      dX += dPaddle;
      
      if (fContact && fServe)
        fLose = true;
      
      fContact = true;
      
      if (!fServe)
        gameParameters.max.value = Math.max (gameParameters.max.value, Math.round (score * 100) / 100);
    }
  }
  
  if (ddX > 0.1 || ddX < -0.1)
    dX += (ddX > 0 ? ddX -= 0.01 : ddX += 0.01);
  else
    ddX = 0;
  
  if (keyLeft && dPaddle > -dMaxPaddle)
    dPaddle--;
  
  if (keyRight && dPaddle < dMaxPaddle)
    dPaddle++;
  
  if (!keyLeft)
    if (dPaddle < 0)
      dPaddle++;
  
  if (!keyRight)
    if (dPaddle > 0)
      dPaddle--;
  
  if (xPaddle <= 0 + wPaddle / 2 || xPaddle >= wWindow - wPaddle / 2){
    dPaddle  *= -1;
    xPaddle   = xPaddle > wWindow / 2 ? wWindow - wPaddle / 2 - 1 :
                                        wPaddle / 2 + 1;
  }
  
  xPaddle += dPaddle;
  
  myGameArea.clear  ();
  myGameArea.draw   ();
  
  score += Math.abs (dX) * Math.abs (ddX);
  
  gameParameters.score.value = score = Math.round (score * 100) / 100;
  
  if(yBall >= myGameArea.canvas.height - 2 * rBall || fLose){
    clearInterval (myGameArea.interval);
    myGameArea.interval = false;
    
    if (score <= gameParameters.last.value && !fServe){
      fServe  = true;
      fPlayer = !fPlayer;
      
      if (fPlayer)
        playerOneWins++;
      else
        playerTwoWins++;
    }else if (fServe)
      if (fLose)
        if (fFault){
          fFault  = false;
          fPlayer = !fPlayer;
          
          if (fPlayer)
            playerOneWins++;
          else
            playerTwoWins++;
        }else
          fFault = true;
      else if (fContact){
        fServe  = false;
        fFault  = false;
        fPlayer = !fPlayer;
      }else if (fFault){
        fFault  = false;
        fPlayer = !fPlayer;
        
        if (fPlayer)
          playerOneWins++;
        else
          playerTwoWins++;
      }else
        fFault = true;
    else
      fPlayer = !fPlayer;
    
    if ((!fServe || !fLose) && fContact)
      gameParameters.max.value = Math.max (gameParameters.max.value,
                                           Math.round (score * 100) / 100);
    
    if (playerOneWins === 21)
      alert();
  }
}