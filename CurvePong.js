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
    
    /* TODO: Get rid of global variables */
    
    gameParameters  = {
      /* Creating inputs in which we'll display numbers */
      max:            document.createElement ("input"),
      last:           document.createElement ("input"),
      score:          document.createElement ("input"),
      pOne:           document.createElement ("input"),
      pTwo:           document.createElement ("input"),
      
      /*
       * Moved from global, keeps a count of
       * how many times each player has won
       */
      playerOneWins:  0,
      playerTwoWins:  0,
      
      start:  function (){
        /*
         * Creates some static text spans to be used
         * as labels for the inputs from above
         */
        var nLastText = document.createElement ("span"),
            nMaxText  = document.createElement ("span"),
            scoreText = document.createElement ("span"),
            pOneText  = document.createElement ("span"),
            pTwoText  = document.createElement ("span");
        
        /* uses createTextNode to make text for our labels */
        nLastText.appendChild (document.createTextNode ("Last"));
        nMaxText.appendChild  (document.createTextNode ("Max"));
        scoreText.appendChild (document.createTextNode ("Score"));
        pOneText.appendChild  (document.createTextNode ("Player 1"));
        pTwoText.appendChild  (document.createTextNode ("Player 2"));
        
        /* Make the type of all our inputs as "text" */
        this.max.type   =
        this.last.type  =
        this.score.type =
        this.pOne.type  =
        this.pTwo.type  = "text";
        
        /* 0 as starting value */
        this.max.value    =
        this.last.value   =
        this.score.value  =
        this.pOne.value   =
        this.pTwo.value   = 0;
        
        /*
         * Loses focus of the inputs if you press enter
         * or space (space starts gameplay)
         */
        this.last.onkeyup   =
        this.max.onkeyup    =
        this.score.onkeyup  =
        this.pOne.onkeyup   =
        this.pTwo.onkeyup   = function (e){
          var key = e.keyCode ? e.keyCode : e.which;
          if (key == 13 || key == 32)
            this.blur ();
        };
        
        /*
         * Document Fragments are apparently a good practice?
         *
         * It makes sense, you want to have a staging area
         * to put everything before putting it on the document.
         *
         * This worked in my browser when I just appended
         * everything to the document, but I'll just keep it
         * like this because I don't want to have problems later.
         */
        var docFrag = document.createDocumentFragment ();
        
        /* Found another use for that map function */
        [nMaxText, this.max, nLastText, this.last,
        document.createElement ("br"),
        scoreText, this.score,
        document.createElement ("br"),
        pOneText, this.pOne,
        document.createElement ("br"),
        pTwoText, this.pTwo].map (function (i){
          /*
           * This does not work if we use the function pointer
           *
           *   map (docFrag.appendChild)
           *
           * I think it's because appendChild is a method of
           * a node object class. It's either that or because
           * of the 'this' pointers in the array, but either way
           * we have to use this very short lambda function
           */
          docFrag.appendChild (i);
        });
        
        /* Add the Document Fragment to the document */
        document.body.appendChild (docFrag);
        
        /*
         * Have all the widths match (the size of the longest + 5)
         *
         * It really bothers the shit out of me to change an attribute
         * of something AFTER we put it on the screen, but the browser
         * didn't know the scrollWidth of the text until it was printed
         * so that's what I'm forced to do for now.
         */
        scoreText.style.width =
        nMaxText.style.width  =
        nLastText.style.width =
        pOneText.style.width  =
        pTwoText.style.width  = Math.max (nMaxText.scrollWidth,
                                          nLastText.scrollWidth,
                                          scoreText.scrollWidth,
                                          pOneText.scrollWidth,
                                          pTwoText.scrollWidth)+5;
        
        /* Start with player 1 serving */
        fServe=true;
      }
    },
    
    myGameArea = {
      /*
       * Moved from global, used to make sure we only make
       * 1 game field and initialize the game once
       */
      fCreatedField:  false,
      fInitGame:      false,
      
      /* The actual canvas we're going to draw on */
      canvas:         document.createElement ("canvas"),
      start:          function (){
        /* Start with no keys pressed (assumption) */
        keyLeft   =
        keyRight  =
        fContact  = !(keyLeftUp = keyRightUp = true);
        
        /* Set paddle and score to initial state (scoreStart = 100) */
        dPaddle                   = dPaddleStart;
        gameParameters.last.value = score;
        score                     = scoreStart;
        
        /* Reset the ball for service, otherwise just reverse the y-speed */
        if (fServe){
          dX      = dXStart;
          ddX     = ddXStart;
          xBall   = xBallStart;
          xPaddle = xPaddleStart;
          dY      = dYStart;
          yBall   = yBallStart;
        }else{
          dY = -Math.abs (dY) + ddY;
          
          /*
           * If the ball is clear of the middle, reset the paddle
           * (the middle part is the same size as the paddle)
           */
          if (xBall > wWindow / 2 + wPaddle / 2 + rBall ||
              xBall < wWindow / 2 - wPaddle / 2 - rBall)
          
            xPaddle = wWindow / 2;
          else
            alert ("Paddle will not reset!");
        }
        
        /*
         * Initialize the canvas width and height, set context
         * and append the canvas to the document one time
         */
        if (!this.fCreatedField){
          this.canvas.width   = wWindow;
          this.canvas.height  = hWindow;
          this.context        = this.canvas.getContext ("2d");
          
          /*
           * gameParameters goes after appending canvas so that
           * scores and everything go at the bottom
           */
          document.body.appendChild (this.canvas);
          gameParameters.start      ();
          this.fCreatedField = true;
        }
        
        /* Update number of wins - probably could move? */
        gameParameters.pOne.value = gameParameters.playerOneWins;
        gameParameters.pTwo.value = gameParameters.playerTwoWins;
        
        /*
         * Start the main loop and assign 20 to this.interval (to be able to
         * check to see if it's still running later)
         */
        this.interval = setInterval (gameLoop, 20);
      },
      clear:  function(){
        this.context.clearRect (0, 0, this.canvas.width, this.canvas.height);
      },
      draw:   function(){
        /* Color (just like in css) */
        this.context.fillStyle = "#373737";
        
        this.context.beginPath  ();
        this.context.arc        (xBall,
                                yBall,
                                rBall,
                                0,
                                Math.PI * 2,
                                true);
        
        /*
         * The fill method will draw a convex shape using
         * all the points given since beginPath, in this
         * case, we used arc.
         */
        this.context.fill       ();
        
        /* Not sure what closePath does */
        this.context.closePath  ();
        
        this.context.fillRect   (xPaddle - wPaddle / 2,
                                 yPaddle - hPaddle / 2,
                                 wPaddle,
                                 hPaddle);
                                 
        this.context.font = "15px Arial";
        
        /*
         * A message in the top left corner that
         * tells you the turn state of the game
         */
        this.context.fillText ("Player " + (fPlayer ? "One" : "Two") +
                                (fServe ? " Serving" : "") +
                                (fServe && fFault ? "(F)" : ""),
                                10, 15);
        
        /* Ground */
        this.context.fillRect (0, hWindow - 5, wWindow, 5);
        
        /*
         * Sets the color for the center of the ground green if the current
         * score is greater than the last score, and red otherwise
         */
        this.context.fillStyle = ((((score > gameParameters.last.value) &&
                                    !fServe) ||
                                  (fServe && fContact)) ? "#37c837" : "#c83737");
                                  
        this.context.fillRect (wWindow / 2 - wPaddle / 2, hWindow - 5, wPaddle, 5);
      }
    };
    
window.onkeydown = function (e){
  /*
   * 37 is the VirtualKey code for left,
   * 39 is the VirtualKey code for right
   * 32 is the VirtualKey code for space
   */

  /*
   * Key codes are passed in different
   * places in different browsers
   *
   * The Ternary Operator - ? - is used
   * here. It is used as follows
   *
   *   condition ? returnValueIfTrue : returnValueIfFalse
   */
  var key = e.keyCode ? e.keyCode : e.which;
  
  /*
   * keyLeftUp is used so that we only set keyLeft to true if the key
   * has been released. Some browsers will keep sending keyDown events
   * while the key is held down.
   */
  if (key === 37 && keyLeftUp)
    /*
     * Assignment has a return value and it's the same as what's assigned.
     * Assignment works right-to-left, which means this line assigns false to
     * keyLeftUp, then assigns true, or rather !false (not false), to keyLeft
     */
    keyLeft = !(keyLeftUp = false);
  else if (key === 39 && keyRightUp)
    keyRight = !(keyRightUp = false);
  /*
   * If the game is still going myGameArea.interval will be equal to 20 (true),
   * otherwise it will be equal to 0 (false).
   */
  else if (key === 32 && !myGameArea.interval)
    myGameArea.start ();
};
    
window.onkeyup = function (e){
  var key = e.keyCode ? e.keyCode : e.which;
  if (key == 37)
    keyLeft = !(keyLeftUp = true);
  else if(key == 39)
    keyRight = !(keyRightUp = true);
};
    
function gameLoop (){
  /* Start the loop having not lost */
  var fLose = false;
  
  /* Update location & speed of ball, decay score */
  xBall += dX;
  yBall += dY;
  dY    += ddY;
  score -= 0.1;
  
  /* Check if ball hits a side wall */
  if (xBall > myGameArea.canvas.width - rBall ||
      xBall < rBall){
    
    /* Apply ddX to dX, reverse direction and kill ddX */
    dX    = -dX - ddX;
    ddX   = 0;
    /* Set ball x location so that it is touching the wall, not inside */
    xBall = xBall > wWindow / 2 ? myGameArea.canvas.width - rBall : rBall;
    
    /* Can't touch the walls on serves */
    if (fServe)
      fLose = true;
  }
  
  /* Check if ball is touching paddle */
  if (yBall >= yPaddle - rBall - hPaddle / 2 &&
      yBall <= yPaddle + rBall + hPaddle / 2 &&
      xBall <= xPaddle + rBall + wPaddle / 2 &&
      xBall >= xPaddle - rBall - wPaddle / 2 || yBall < rBall){
    
    /*
     * Reverses momentum of ball,
     *
     * Since dY already accelerated by ddY this loop,
     * we have to decelerate dY by the same amount. Since
     * dY has changed signs, we will ADD ddY to decelerate
     */
    dY = -dY + ddY;
    
    /*
     * If the paddle's moving and the ball isn't touching the
     * top of the game area, add to ddX (spin) in opposite
     * direction and to dX (speed) in same direction
     */
    if ((dPaddle !== 0) && yBall > rBall){
      ddX = -dPaddle / 30;
      dX += dPaddle;
      
      /* Can't hit the paddle twice on a serve */
      if (fContact && fServe)
        fLose = true;
      
      fContact = true;
      
      /* Update max score, I might take this out now that I'm decaying the score. */
      if (!fServe)
        gameParameters.max.value = Math.max (gameParameters.max.value, Math.round (score * 100) / 100);
    }
  }
  
  /* Empties ddX into dX or kills it if |ddX| < 0.1 */
  if (ddX > 0.1 || ddX < -0.1)
    dX += (ddX > 0 ? ddX -= 0.01 : ddX += 0.01);
  else
    ddX = 0;
  
  /*
   * Paddle movement. If the key is down and paddle
   * isn't yet at max speed, increase speed
   */
  if (keyLeft && dPaddle > -dMaxPaddle)
    dPaddle--;
  
  if (keyRight && dPaddle < dMaxPaddle)
    dPaddle++;
  
  /*
   * Paddle Speed Decay
   * If the paddle is moving and the associated
   * key isn't pressed, decrease speed
   */
  if (!keyLeft)
    if (dPaddle < 0)
      dPaddle++;
  
  if (!keyRight)
    if (dPaddle > 0)
      dPaddle--;
  
  /* Bounce paddle off walls */
  if (xPaddle <= 0 + wPaddle / 2 || xPaddle >= wWindow - wPaddle / 2){
    dPaddle  *= -1;
    xPaddle   = xPaddle > wWindow / 2 ? wWindow - wPaddle / 2 - 1 :
                                        wPaddle / 2 + 1;
  }
  
  /* Move paddle according to speed */
  xPaddle += dPaddle;
  
  myGameArea.clear  ();
  myGameArea.draw   ();
  
  /* Increas score based on ball movement */
  score += Math.abs (dX * ddX);
  
  /* Round score to nearest 100th */
  gameParameters.score.value = score = Math.round (score * 100) / 100;
  
  /* Check if ball hits ground or fLose flag is thrown */
  if(yBall >= myGameArea.canvas.height - 2 * rBall || fLose){
    /* Stops gameplay */
    clearInterval (myGameArea.interval);
    myGameArea.interval = false;
    
    /*
     * If current score doesn't beat last score, switch players,
     * add a point to the appropriate player and set fServe to true.
     */
    if (score <= gameParameters.last.value && !fServe){
      fServe  = true;
      fPlayer = !fPlayer;
      
      if (fPlayer)
        gameParameters.playerOneWins++;
      else
        gameParameters.playerTwoWins++;
    }else if (fServe)
      /* Check for fault, switch players and give point if needed */
      if (fLose)
        if (fFault){
          /* 2 faults, add point and five serve to other player */
          fFault  = false;
          fPlayer = !fPlayer;
          
          if (fPlayer)
            gameParameters.playerOneWins++;
          else
            gameParameters.playerTwoWins++;
        }else
          /* First fault */
          fFault = true;
      else if (fContact){
        /* Legal serve, switch control to other player */
        fServe  = false;
        fFault  = false;
        fPlayer = !fPlayer;
      }else if (fFault){
        /* 2 faults, add point and give serve to other player */
        fFault  = false;
        fPlayer = !fPlayer;
        
        if (fPlayer)
          gameParameters.playerOneWins++;
        else
          gameParameters.playerTwoWins++;
      }else
        fFault = true;
    else
      /* Legal return, switch control to other player */
      fPlayer = !fPlayer;
    
    /* Update max score, I might take this out now that I'm decaying the score. */
    if ((!fServe || !fLose) && fContact)
      gameParameters.max.value = Math.max (gameParameters.max.value,
                                           Math.round (score * 100) / 100);
  }
}
