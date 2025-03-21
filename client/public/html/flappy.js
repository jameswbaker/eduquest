/* FLAPPY GAME CONFIGURATION CONSTANTS */
const FLAPPY_CONFIG = {
  baseWidth: 800,
  baseHeight: 600,
  
  bird: {
    x: 150,
    y: 300,
    width: 70,
    height: 70,
    gravity: 3000.0,  // Doubled from 1500.0 for extremely fast falling
    jumpForce: -8,
    bounceForce: 4
  },
  pipes: {
    width: 35,
    gapHeight: 240,
    gapSpacing: 150,
    pipeSpacing: 400,
    speed: 180.0,
    preGenerateCount: 5,
    removeOffset: -100,
    gapMargin: 80
  },
  feedback: {
    duration: 1.5,  // Changed to seconds instead of frames
    color: 'red'
  },
  pause: {
    duration: 0.75  // Changed to seconds instead of frames
  },
  lives: {
    initial: 3,
    heartSize: 30,
    spacing: 10,
    color: 'red',
    outlineColor: 'white',
    outlineWidth: 2
  },
  invulnerability: {
    duration: 1.0  // Added in seconds
  },
  text: {
    answerFont: "14px 'Hanken Grotesk', sans-serif",
    lineHeight: 16,
    boxPadding: 10,
    boxExtraWidth: 25,
    boxExtraHeight: 20,
    answerTextOffset: 20,
    answerBoxBackground: 'rgba(255, 255, 255, 0.9)'
  },
  colors: {
    pipe: '#4CAF50',
    bird: '#FF6B6B',
    score: 'black',
    answerTopText: 'black',
    answerBottomText: 'red'
  },
  ui: {
    scoreFont: "24px 'Hanken Grotesk', sans-serif",
    gameOverFont: '48px Arial',
    finalScoreFont: '24px Arial',
    feedbackFont: 'bold 36px Arial',
    pauseFont: '24px Arial'
  }
};

const domain = window.domain || 'localhost';

let gameId = null;
let studentId = null;
let isUserTeacher = false;
let userName = null;

function extractURLParams() {
  try {
    // Get the current script's URL
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1]; // Most recently added script
    
    if (currentScript && currentScript.src && currentScript.src.includes('?')) {
      const urlParams = new URLSearchParams(currentScript.src.split('?')[1]);
      gameId = urlParams.get('gameId');
      studentId = urlParams.get('studentId');
      isUserTeacher = urlParams.get('isUserTeacher') === 'true';
      userName = urlParams.get('userName');
    } else {
      console.warn('No URL parameters found in script tag');
    }
  } catch (e) {
    console.error('Error extracting URL parameters:', e);
  }
}

extractURLParams();

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.questionDiv = document.getElementById('question');

    this.gameId = gameId;
    this.studentId = studentId;
    this.isUserTeacher = isUserTeacher;
    this.userName = userName;

    // Calculate scale factor based on canvas dimensions
    this.scaleX = this.canvas.width / FLAPPY_CONFIG.baseWidth;
    this.scaleY = this.canvas.height / FLAPPY_CONFIG.baseHeight;
    // Use the minimum scale to maintain aspect ratio
    this.scale = Math.min(this.scaleX, this.scaleY);

    // Time tracking for frame-rate independent movement
    this.lastUpdateTime = 0;
    this.deltaTime = 0;

    // Fixed gameplay constants that don't scale with screen size
    this.gameSpeed = {
      // Fixed values independent of screen size
      gravity: FLAPPY_CONFIG.bird.gravity,
      liftForce: -3000.0,  // Doubled from -1500.0 for extremely fast lift
      pipeSpeed: FLAPPY_CONFIG.pipes.speed,
      maxUpwardVelocity: -2000,  // Increased from -1200 for much faster ascent
      maxRotation: Math.PI / 6, // 30 degrees in radians
      velocityRange: 2500,  // Increased for better rotation with higher velocities
      drag: 0.2  // Reduced from 0.4 for almost no air resistance
    };

    // Bird properties - visual elements scale with screen but physics don't
    this.bird = {
      x: FLAPPY_CONFIG.bird.x * this.scaleX,
      y: FLAPPY_CONFIG.bird.y * this.scaleY,
      width: FLAPPY_CONFIG.bird.width * this.scale,
      height: FLAPPY_CONFIG.bird.height * this.scale,
      velocity: 0,
      rotation: 0,
      hitboxReduction: 0.3
    };

    // Lives system
    this.lives = FLAPPY_CONFIG.lives.initial;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.invulnerabilityDuration = FLAPPY_CONFIG.invulnerability.duration;  // In seconds now

    // Track if space key is being held
    this.isSpaceHeld = false;

    // Load bird icon image
    this.birdImage = new Image();
    this.birdImage.src = "img/pngegg.png"; // Ensure this path is correct

    // Load background image
    this.backgroundImage = new Image();
    this.backgroundImage.src = "img/flap_background.png"; // Ensure correct path

    // Load pipe image
    this.pipeImage = new Image();
    this.pipeImage.src = "img/pipe.png"; // Ensure this image exists in your public folder
    // Optionally add error handling:
    this.pipeImage.onerror = () => {
      console.error("Failed to load pipe image. Please check the path.");
    };

    // Game state
    this.score = 0;
    this.gameOver = false;
    this.currentQuestion = null;
    this.questions = [];
    this.currentQuestionIndex = 0;

    // Pipe properties - visual elements scale with screen but spacing and speed don't
    this.pipes = [];
    this.pipeWidth = FLAPPY_CONFIG.pipes.width * this.scale;
    this.defaultGapHeight = FLAPPY_CONFIG.pipes.gapHeight * this.scale;
    this.gapSpacing = FLAPPY_CONFIG.pipes.gapSpacing * this.scale;
    // Fixed pipe spacing - not dependent on screen size
    this.pipeSpacing = FLAPPY_CONFIG.pipes.pipeSpacing;
    this.worldOffset = 0;

    // Feedback system
    this.feedback = {
      active: false,
      timer: FLAPPY_CONFIG.feedback.duration,
      duration: FLAPPY_CONFIG.feedback.duration,
      message: "",
      color: FLAPPY_CONFIG.feedback.color
    };

    // Game state control
    this.isPaused = false;
    this.pauseTimer = 0;
    this.pauseDuration = FLAPPY_CONFIG.pause.duration;  // In seconds now
    this.feedbackTimer = 0;
    this.feedbackDuration = FLAPPY_CONFIG.feedback.duration;  // In seconds now

    // Event listeners for both keydown and keyup
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Minimal UI setup
    this.setupUI();
  }

  setupUI() {
    this.canvas.style.display = 'none';
    this.questionDiv.style.display = 'none';
  }

  handleKeyDown(event) {
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.gameOver) {
        this.resetGame();
      } else if (!this.isPaused) {
        this.isSpaceHeld = true;
      }
    }
  }

  handleKeyUp(event) {
    if (event.code === 'Space') {
      event.preventDefault();
      this.isSpaceHeld = false;
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    if (this.gameOver) {
      this.resetGame();
    } else if (!this.isPaused) {
      this.isSpaceHeld = true;
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    this.isSpaceHeld = false;
  }

  async startGame(questions) {
    if (!questions || !questions.length) {
      console.error('No questions provided');
      return;
    }
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.currentQuestion = questions[0].question;
    this.questionDiv.textContent = this.currentQuestion;

    this.score = 0;
    this.gameOver = false;
    this.pipes = [];

    this.canvas.style.display = 'block';
    this.questionDiv.style.display = 'block';

    this.preGeneratePipes();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  async saveGameResult() {
    if (!this.gameId || !this.studentId) {
      console.error('Cannot save game result: missing gameId or studentId');
      return;
    }

    if (isUserTeacher) {
      console.log("Player is a teacher. Don't save results");
      return;
    }

    try {
      console.log("Score:", this.score);
      const response = await fetch(`http://${domain}:5001/add-game-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: this.gameId,
          student_id: this.studentId,
          score: this.score,
          user_name: this.userName,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save game result: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Game result saved:", data);
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  preGeneratePipes() {
    // Use a fixed starting position independent of canvas width
    const startX = FLAPPY_CONFIG.baseWidth;
    for (let i = 0; i < FLAPPY_CONFIG.pipes.preGenerateCount; i++) {
      this.generatePipe(startX + (i * this.pipeSpacing));
    }
  }

  generatePipe(xPosition) {
    if (this.currentQuestionIndex >= this.questions.length) {
      return;
    }
    const currentQ = this.questions[this.currentQuestionIndex];
    if (!currentQ || !currentQ.answers || currentQ.answers.length < 2) {
      console.error('Invalid question format', currentQ);
      return;
    }

    // Get the text of the answers to calculate their size
    const correctAnswer = currentQ.answers.find(a => a.isCorrect)?.text || 'True';
    const incorrectAnswer = currentQ.answers.find(a => !a.isCorrect)?.text || 'False';
    
    // Set up text measurements with proper scaling
    const baseFontSize = parseInt(FLAPPY_CONFIG.text.answerFont.match(/\d+/)[0]);
    const fontSize = baseFontSize * this.scale;
    this.ctx.font = `${fontSize}px 'Hanken Grotesk', sans-serif`;
    const lineHeight = FLAPPY_CONFIG.text.lineHeight * this.scale;
    const boxPadding = FLAPPY_CONFIG.text.boxPadding * this.scale;
    const boxExtraWidth = FLAPPY_CONFIG.text.boxExtraWidth * this.scale;
    const boxExtraHeight = FLAPPY_CONFIG.text.boxExtraHeight * this.scale;
    
    // Measure each answer's text height
    const correctAnswerHeight = this.calculateTextHeight(
      correctAnswer, 
      this.pipeWidth + 2 * boxExtraWidth - 2 * boxPadding, 
      lineHeight
    );
    const incorrectAnswerHeight = this.calculateTextHeight(
      incorrectAnswer, 
      this.pipeWidth + 2 * boxExtraWidth - 2 * boxPadding, 
      lineHeight
    );
    
    // Calculate required gap height for each answer
    const correctBoxHeight = correctAnswerHeight + 2 * boxPadding;
    const incorrectBoxHeight = incorrectAnswerHeight + 2 * boxPadding;
    
    // Use the larger of the two box heights to set the gap size
    const maxBoxHeight = Math.max(correctBoxHeight, incorrectBoxHeight) + boxExtraHeight;
    // Ensure gap height is reasonable - cap at 1.5x the default to prevent huge gaps
    const maxAllowedHeight = this.defaultGapHeight * 1.5;
    const gapHeight = Math.min(
      maxAllowedHeight, 
      Math.max(this.defaultGapHeight, maxBoxHeight + 20 * this.scale)
    );
    
    // Calculate safe boundaries to ensure boxes are fully visible
    const topSafeMargin = 40 * this.scale;
    const bottomSafeMargin = 40 * this.scale;
    
    // Calculate the available space for gap placement
    const availableHeight = this.canvas.height - topSafeMargin - bottomSafeMargin - (2 * gapHeight) - this.gapSpacing;
    
    // If not enough space, adjust spacing
    if (availableHeight < 0) {
      // Emergency adjustment - reduce gap spacing if necessary
      this.gapSpacing = Math.max(50 * this.scale, this.canvas.height - topSafeMargin - bottomSafeMargin - (2 * gapHeight));
    }
    
    // Calculate valid Y positions for the first gap
    const minY = topSafeMargin;
    const maxY = this.canvas.height - bottomSafeMargin - this.gapSpacing - (2 * gapHeight);
    
    // Ensure we have a valid range (fail-safe)
    const adjustedMaxY = Math.max(minY, maxY);
    
    // Generate gap positions ensuring they are fully visible
    const firstGapY = Math.random() * (adjustedMaxY - minY) + minY;
    const secondGapY = firstGapY + gapHeight + this.gapSpacing;
    
    // Decide which gap gets the correct answer
    const isTopCorrect = Math.random() < 0.5;

    this.pipes.push({
      x: xPosition,
      gapY1: firstGapY,
      gapY2: secondGapY,
      gapHeight: gapHeight, // Store the dynamic gap height
      passed: false,
      questionIndex: this.currentQuestionIndex,
      topGapAnswer: isTopCorrect ? correctAnswer : incorrectAnswer,
      bottomGapAnswer: isTopCorrect ? incorrectAnswer : correctAnswer,
      isTopCorrect
    });

    this.currentQuestionIndex++;
  }

  update() {
    // Calculate deltaTime for frame-rate independent movement
    const currentTime = performance.now();
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = currentTime;
      this.deltaTime = 0;
    } else {
      this.deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
      this.lastUpdateTime = currentTime;
    }

    // Cap deltaTime to prevent huge jumps if tab was inactive
    const maxDeltaTime = 0.1; // Maximum of 100ms
    this.deltaTime = Math.min(this.deltaTime, maxDeltaTime);
    
    if (this.gameOver) {
      return;
    }
    
    if (this.isPaused) {
      this.pauseTimer -= this.deltaTime;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
      }
      return;
    }

    // Handle invulnerability timer - now time-based
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= this.deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // Handle feedback timer - now time-based
    if (this.feedback && this.feedback.active) {
      this.feedback.timer -= this.deltaTime;
      if (this.feedback.timer <= 0) {
        this.feedback.active = false;
      }
    }

    // Apply lift force when space is held, otherwise apply gravity
    if (this.isSpaceHeld) {
      // Apply lift force with deltaTime - make it even more immediate
      this.bird.velocity += this.gameSpeed.liftForce * this.deltaTime * 1.2; // Extra 20% boost
      // Limit maximum upward velocity
      if (this.bird.velocity < this.gameSpeed.maxUpwardVelocity) {
        this.bird.velocity = this.gameSpeed.maxUpwardVelocity;
      }
    } else {
      // Apply gravity with deltaTime
      this.bird.velocity += this.gameSpeed.gravity * this.deltaTime;
    }
    
    // Apply minimal air resistance - reduces velocity over time
    const dragFactor = Math.pow(1 - this.gameSpeed.drag, this.deltaTime * 20); // Reduced calculation factor
    this.bird.velocity *= dragFactor;
    
    // Update bird rotation based on velocity
    // Map velocity to rotation angle: -30 degrees (up) to +30 degrees (down)
    const velocityRange = this.gameSpeed.velocityRange;
    
    // Calculate target rotation based on velocity
    let targetRotation = (this.bird.velocity / velocityRange) * this.gameSpeed.maxRotation;
    
    // Clamp rotation to reasonable limits
    targetRotation = Math.max(-this.gameSpeed.maxRotation, Math.min(this.gameSpeed.maxRotation, targetRotation));
    
    // Smooth rotation transition
    this.bird.rotation = targetRotation;
    
    // Apply velocity with deltaTime
    this.bird.y += this.bird.velocity * this.deltaTime;

    // No bouncing - just stop at boundaries
    if (this.bird.y + this.bird.height > this.canvas.height) {
      this.bird.y = this.canvas.height - this.bird.height;
      this.bird.velocity = 0;
    } else if (this.bird.y < 0) {
      this.bird.y = 0;
      this.bird.velocity = 0;
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      // Use deltaTime for frame-rate independent movement
      pipe.x -= this.gameSpeed.pipeSpeed * this.deltaTime;

      if (this.checkPipeCollision(pipe)) {
        continue;
      }

      if (!pipe.passed && this.bird.x > pipe.x + this.pipeWidth) {
        pipe.passed = true;
        this.score++;
        const nextQuestionIndex = pipe.questionIndex + 1;
        if (nextQuestionIndex < this.questions.length) {
          this.currentQuestion = this.questions[nextQuestionIndex].question;
          this.questionDiv.textContent = this.currentQuestion;
        }
        this.isPaused = true;
        this.pauseTimer = this.pauseDuration;
      }

      if (pipe.x + this.pipeWidth < FLAPPY_CONFIG.pipes.removeOffset) {
        this.pipes.splice(i, 1);
        if (this.currentQuestionIndex < this.questions.length) {
          if (this.pipes.length > 0) {
            const lastPipe = this.pipes[this.pipes.length - 1];
            this.generatePipe(lastPipe.x + this.pipeSpacing);
          } else {
            this.generatePipe(FLAPPY_CONFIG.baseWidth);
          }
        }
      }
    }

    if (this.currentQuestionIndex >= this.questions.length && this.pipes.length === 0) {
      this.gameOver = true;
      this.saveGameResult();
    }
  }

  checkPipeCollision(pipe) {
    // Skip collision check if player is invulnerable
    if (this.isInvulnerable) {
      return false;
    }
    
    // Calculate answer box dimensions
    const boxWidth = this.pipeWidth + 2 * FLAPPY_CONFIG.text.boxExtraWidth * this.scale;
    // Ensure box height is within reasonable limits - no more than 80% of the gap height
    const maxBoxHeightPct = 0.8;
    const boxHeight = Math.min(
      pipe.gapHeight * maxBoxHeightPct, 
      pipe.gapHeight - FLAPPY_CONFIG.text.boxExtraHeight * this.scale
    );
    const boxX = pipe.x - FLAPPY_CONFIG.text.boxExtraWidth * this.scale;
    const boxYTop = pipe.gapY1 + (pipe.gapHeight - boxHeight) / 2; // Center in the gap
    const boxYBottom = pipe.gapY2 + (pipe.gapHeight - boxHeight) / 2; // Center in the gap
    
    // Apply hitbox reduction for more forgiving collisions
    const hitboxReduction = this.bird.width * this.bird.hitboxReduction;
    const birdHitboxX = this.bird.x + hitboxReduction;
    const birdHitboxY = this.bird.y + hitboxReduction;
    const birdHitboxWidth = this.bird.width - (hitboxReduction * 2);
    const birdHitboxHeight = this.bird.height - (hitboxReduction * 2);
    
    // Add extra safety margin for pipe collisions to make them more forgiving
    const safetyMargin = 5 * this.scale;
    
    // Check if bird is in the correct answer box (which is always safe)
    const inTopBox = 
      birdHitboxX + birdHitboxWidth > boxX &&
      birdHitboxX < boxX + boxWidth &&
      birdHitboxY > boxYTop &&
      birdHitboxY + birdHitboxHeight < boxYTop + boxHeight;
      
    const inBottomBox = 
      birdHitboxX + birdHitboxWidth > boxX &&
      birdHitboxX < boxX + boxWidth &&
      birdHitboxY > boxYBottom &&
      birdHitboxY + birdHitboxHeight < boxYBottom + boxHeight;
    
    // If bird is in the correct answer box, it's safe
    if ((inTopBox && pipe.isTopCorrect) || (inBottomBox && !pipe.isTopCorrect)) {
      return false;
    }
    
    // If bird is in the wrong answer box, lose a life
    if ((inTopBox && !pipe.isTopCorrect) || (inBottomBox && pipe.isTopCorrect)) {
      this.loseLife("Wrong Answer!");
      return true;
    }
    
    // Check for pipe collision with extra safety margin
    if (
      birdHitboxX + birdHitboxWidth > pipe.x + safetyMargin &&
      birdHitboxX < pipe.x + this.pipeWidth - safetyMargin
    ) {
      // Check if bird is in any of the gap areas with safety margin
      const inTopGap =
        birdHitboxY > pipe.gapY1 + safetyMargin &&
        birdHitboxY + birdHitboxHeight < pipe.gapY1 + pipe.gapHeight - safetyMargin;
      const inBottomGap =
        birdHitboxY > pipe.gapY2 + safetyMargin &&
        birdHitboxY + birdHitboxHeight < pipe.gapY2 + pipe.gapHeight - safetyMargin;
        
      // If not in a gap, the bird has hit the pipe
      if (!inTopGap && !inBottomGap) {
        this.loseLife("Pipe Collision!");
        return true;
      }
    }
    return false;
  }
  
  // New method to handle losing a life
  loseLife(message) {
    this.lives--;
    
    // Add a brief pause when losing a life - now time-based
    this.isPaused = true;
    this.pauseTimer = 0.5; // Half a second pause
    
    // Flash red instead of showing text
    document.getElementById('gameCanvas').style.boxShadow = '0 0 20px 10px rgba(255, 0, 0, 0.7)';
    setTimeout(() => {
      document.getElementById('gameCanvas').style.boxShadow = 'none';
    }, 300);
    
    if (this.lives <= 0) {
      // Game over when out of lives
      this.gameOver = true;
      this.saveGameResult();
    } else {
      // Make player invulnerable briefly after losing a life - time-based now
      this.isInvulnerable = true;
      this.invulnerabilityTimer = this.invulnerabilityDuration;
    }
  }

  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the background image first
    if (this.backgroundImage.complete) {
      this.ctx.drawImage(
        this.backgroundImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      
    } else {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw pipes using the pipe image with slicing for top and bottom segments
    this.pipes.forEach((pipe) => {
      if (this.pipeImage.complete) {
        this.ctx.drawImage(
          this.pipeImage,
          0,
          0,
          this.pipeImage.width,
          this.pipeImage.height,
          pipe.x,
          0,
          this.pipeWidth,
          this.canvas.height
        );
      } else {
        // Fallback: draw simple rectangles if pipe image isn't loaded
        this.ctx.fillStyle = FLAPPY_CONFIG.colors.pipe;
        this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY1);
        this.ctx.fillRect(
          pipe.x,
          pipe.gapY1 + pipe.gapHeight,
          this.pipeWidth,
          pipe.gapY2 - (pipe.gapY1 + pipe.gapHeight)
        );
        this.ctx.fillRect(
          pipe.x,
          pipe.gapY2 + pipe.gapHeight,
          this.pipeWidth,
          this.canvas.height - (pipe.gapY2 + pipe.gapHeight)
        );
      }

      // Draw answer boxes and text as before
      const boxWidth = this.pipeWidth + 2 * FLAPPY_CONFIG.text.boxExtraWidth * this.scale;
      // Ensure box height is within reasonable limits - no more than 80% of the gap height
      const maxBoxHeightPct = 0.8;
      const boxHeight = Math.min(
        pipe.gapHeight * maxBoxHeightPct, 
        pipe.gapHeight - FLAPPY_CONFIG.text.boxExtraHeight * this.scale
      );
      const boxX = pipe.x - FLAPPY_CONFIG.text.boxExtraWidth * this.scale;
      const boxYTop = pipe.gapY1 + (pipe.gapHeight - boxHeight) / 2; // Center in the gap
      const boxYBottom = pipe.gapY2 + (pipe.gapHeight - boxHeight) / 2; // Center in the gap

      this.ctx.fillStyle = FLAPPY_CONFIG.text.answerBoxBackground;
      this.ctx.fillRect(boxX, boxYTop, boxWidth, boxHeight);
      this.ctx.fillRect(boxX, boxYBottom, boxWidth, boxHeight);

      // Calculate vertical center positions for text
      const baseFontSize = parseInt(FLAPPY_CONFIG.text.answerFont.match(/\d+/)[0]);
      const fontSize = baseFontSize * this.scale;
      this.ctx.font = `${fontSize}px 'Hanken Grotesk', sans-serif`;
      const scaledLineHeight = FLAPPY_CONFIG.text.lineHeight * this.scale;
      
      // Top answer text - centered vertically
      this.ctx.fillStyle = pipe.isTopCorrect
        ? FLAPPY_CONFIG.colors.answerTopText
        : FLAPPY_CONFIG.colors.answerBottomText;
      this.ctx.textAlign = 'center';
      
      // Pre-calculate text height to center it
      const topTextHeight = this.calculateTextHeight(
        pipe.topGapAnswer, 
        boxWidth - 2 * FLAPPY_CONFIG.text.boxPadding * this.scale, 
        scaledLineHeight
      );
      const topTextY = boxYTop + (boxHeight - topTextHeight) / 2;
      
      this.wrapText(
        this.ctx,
        pipe.topGapAnswer,
        pipe.x + this.pipeWidth / 2,
        topTextY,
        boxWidth - 2 * FLAPPY_CONFIG.text.boxPadding * this.scale,
        scaledLineHeight
      );

      // Bottom answer text - centered vertically
      this.ctx.fillStyle = pipe.isTopCorrect
        ? FLAPPY_CONFIG.colors.answerBottomText
        : FLAPPY_CONFIG.colors.answerTopText;
      
      // Pre-calculate text height to center it
      const bottomTextHeight = this.calculateTextHeight(
        pipe.bottomGapAnswer, 
        boxWidth - 2 * FLAPPY_CONFIG.text.boxPadding * this.scale, 
        scaledLineHeight
      );
      const bottomTextY = boxYBottom + (boxHeight - bottomTextHeight) / 2;
      
      this.wrapText(
        this.ctx,
        pipe.bottomGapAnswer,
        pipe.x + this.pipeWidth / 2,
        bottomTextY,
        boxWidth - 2 * FLAPPY_CONFIG.text.boxPadding * this.scale,
        scaledLineHeight
      );
    });

    // Draw the bird using the icon image with rotation
    // Make the bird blink when invulnerable (visible on even frames, invisible on odd frames)
    const shouldDrawBird = !this.isInvulnerable || Math.floor(this.invulnerabilityTimer / 5) % 2 === 0;
    
    if (shouldDrawBird) {
      this.ctx.save(); // Save current context state
      
      // Translate to the center of the bird
      this.ctx.translate(
        this.bird.x + this.bird.width / 2,
        this.bird.y + this.bird.height / 2
      );
      
      // Apply rotation
      this.ctx.rotate(this.bird.rotation);
      
      // Draw bird centered at origin (now rotated)
      if (this.birdImage.complete) {
        this.ctx.drawImage(
          this.birdImage,
          -this.bird.width / 2,
          -this.bird.height / 2,
          this.bird.width,
          this.bird.height
        );
      } else {
        this.ctx.fillStyle = FLAPPY_CONFIG.colors.bird;
        this.ctx.fillRect(
          -this.bird.width / 2,
          -this.bird.height / 2,
          this.bird.width,
          this.bird.height
        );
      }
      
      this.ctx.restore(); // Restore context to previous state
    }

    // Draw score with scaled font
    this.ctx.fillStyle = FLAPPY_CONFIG.colors.score;
    const scoreFontSize = parseInt(FLAPPY_CONFIG.ui.scoreFont.match(/\d+/)[0]) * this.scale;
    this.ctx.font = `${scoreFontSize}px 'Hanken Grotesk', sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10 * this.scale, 30 * this.scale);

    // Draw lives
    this.drawLives();

    // Draw feedback if active with scaled font - time-based now
    if (this.feedback && this.feedback.active) {
      this.ctx.fillStyle = this.feedback.color;
      const feedbackFontSize = parseInt(FLAPPY_CONFIG.ui.feedbackFont.match(/\d+/)[0]) * this.scale;
      this.ctx.font = `bold ${feedbackFontSize}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.feedback.message,
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }

    // Draw game over screen if game is over with scaled fonts
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      
      const gameOverFontSize = parseInt(FLAPPY_CONFIG.ui.gameOverFont.match(/\d+/)[0]) * this.scale;
      this.ctx.font = `${gameOverFontSize}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
      
      const finalScoreFontSize = parseInt(FLAPPY_CONFIG.ui.finalScoreFont.match(/\d+/)[0]) * this.scale;
      this.ctx.font = `${finalScoreFontSize}px Arial`;
      this.ctx.fillText(
        `Final Score: ${this.score}`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 40 * this.scale
      );
      this.ctx.fillText(
        'Press Space to Try Again',
        this.canvas.width / 2,
        this.canvas.height / 2 + 80 * this.scale
      );
    }

    // Draw pause overlay if game is paused with scaled font
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      const pauseFontSize = parseInt(FLAPPY_CONFIG.ui.pauseFont.match(/\d+/)[0]) * this.scale;
      this.ctx.font = `${pauseFontSize}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'Get Ready!',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
  }

  resetGame() {
    this.bird.y = FLAPPY_CONFIG.bird.y;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.feedback.active = false;
    this.isPaused = false;
    this.pauseTimer = 0;
    this.currentQuestionIndex = 0;
    
    // Reset lives
    this.lives = FLAPPY_CONFIG.lives.initial;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    
    // Reset time tracking
    this.lastUpdateTime = 0;
    
    this.preGeneratePipes();
  }

  gameLoop(timestamp) {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;
    let startY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    lineCount++;
    
    return lineCount * lineHeight; // Return total height of text
  }

  calculateTextHeight(text, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;

    // Need a temporary context to measure text
    const ctx = this.ctx;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lineCount++;
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lineCount++;
    
    return lineCount * lineHeight; // Return total height of text
  }

  drawLives() {
    const heartSize = FLAPPY_CONFIG.lives.heartSize * this.scale;
    const spacing = FLAPPY_CONFIG.lives.spacing * this.scale;
    const startX = this.canvas.width - (heartSize + spacing) * this.lives + spacing;
    const y = 30 * this.scale;
    
    this.ctx.lineWidth = FLAPPY_CONFIG.lives.outlineWidth * this.scale;
    this.ctx.strokeStyle = FLAPPY_CONFIG.lives.outlineColor;
    this.ctx.fillStyle = FLAPPY_CONFIG.lives.color;
    
    for (let i = 0; i < this.lives; i++) {
      const x = startX + i * (heartSize + spacing);
      this.drawHeart(x, y, heartSize);
    }
  }
  
  drawHeart(x, y, size) {
    // Draw a heart shape
    this.ctx.beginPath();
    
    // Start at the bottom point of the heart
    this.ctx.moveTo(x + size / 2, y + size);
    
    // Draw left side
    this.ctx.bezierCurveTo(
      x, y + size * 0.7, // Control point 1
      x - size / 2, y,   // Control point 2
      x + size / 2, y    // End point
    );
    
    // Draw right side
    this.ctx.bezierCurveTo(
      x + size * 1.5, y,     // Control point 1
      x + size, y + size * 0.7, // Control point 2
      x + size / 2, y + size    // End point
    );
    
    this.ctx.closePath();
    
    // Fill and stroke the heart
    this.ctx.fill();
    this.ctx.stroke();
  }
}

// Create/initialize your Game instance
let game;
function initGame() {
  game = new Game();
}
initGame();