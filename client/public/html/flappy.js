/* FLAPPY GAME CONFIGURATION CONSTANTS */
const FLAPPY_CONFIG = {
    bird: {
      x: 150,
      y: 300,
      width: 25,
      height: 20,
      gravity: 0.3,
      jumpForce: -8,
      bounceForce: 4
    },
    pipes: {
      width: 20,
      gapHeight: 200,
      gapSpacing: 150,
      pipeSpacing: 400,
      speed: 1.75,
      preGenerateCount: 5,
      removeOffset: -100,
      gapMargin: 80
    },
    feedback: {
      duration: 90,
      color: 'red'
    },
    pause: {
      duration: 150
    },
    text: {
      answerFont: '14px Arial',
      lineHeight: 16,
      boxPadding: 10,
      boxExtraWidth: 20,
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
      scoreFont: '24px Arial',
      gameOverFont: '48px Arial',
      finalScoreFont: '24px Arial',
      feedbackFont: 'bold 36px Arial',
      pauseFont: '24px Arial'
    }
  };
  
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.questionDiv = document.getElementById('question');
  
      // Bird properties
      this.bird = {
        x: FLAPPY_CONFIG.bird.x,
        y: FLAPPY_CONFIG.bird.y,
        width: FLAPPY_CONFIG.bird.width,
        height: FLAPPY_CONFIG.bird.height,
        velocity: 0,
        gravity: FLAPPY_CONFIG.bird.gravity,
        jumpForce: FLAPPY_CONFIG.bird.jumpForce,
        bounceForce: FLAPPY_CONFIG.bird.bounceForce
      };
  
      // Game state
      this.score = 0;
      this.gameOver = false;
      this.currentQuestion = null;
      this.questions = [];
      this.currentQuestionIndex = 0;
  
      // Pipe properties
      this.pipes = [];
      this.pipeWidth = FLAPPY_CONFIG.pipes.width;
      this.gapHeight = FLAPPY_CONFIG.pipes.gapHeight;
      this.gapSpacing = FLAPPY_CONFIG.pipes.gapSpacing;
      this.pipeSpacing = FLAPPY_CONFIG.pipes.pipeSpacing;
      this.pipeSpeed = FLAPPY_CONFIG.pipes.speed;
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
      this.pauseDuration = FLAPPY_CONFIG.pause.duration;
  
      // Event listeners
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('touchstart', this.handleTouchStart.bind(this));
  
      // Minimal UI setup
      this.setupUI();
    }
  
    // Removed references to #inputContainer so your beginning interface remains visible
    setupUI() {
      // We no longer hide or show #inputContainer here.
      // If you want to hide the canvas by default, keep it hidden in HTML or do:
      this.canvas.style.display = 'none';
      this.questionDiv.style.display = 'none';
    }
  
    handleKeyDown(event) {
      if (event.code === 'Space') {
        event.preventDefault();
        this.jump();
      }
    }
  
    handleTouchStart(event) {
      event.preventDefault();
      this.jump();
    }
  
    jump() {
      if (this.gameOver) {
        this.resetGame();
      } else if (!this.isPaused) {
        this.bird.velocity = this.bird.jumpForce;
      }
    }
  
    async startGame(questions) {
      // Validate questions array
      if (!questions || !questions.length) {
        console.error('No questions provided');
        return;
      }
  
      this.questions = questions;
      this.currentQuestionIndex = 0;
      this.currentQuestion = questions[0].question;
      this.questionDiv.textContent = this.currentQuestion;
  
      // Reset game state
      this.score = 0;
      this.gameOver = false;
      this.pipes = [];
  
      // Show the canvas & question (no longer hiding #inputContainer)
      this.canvas.style.display = 'block';
      this.questionDiv.style.display = 'block';
  
      // Generate initial pipes, start loop
      this.preGeneratePipes();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  
    preGeneratePipes() {
      for (let i = 0; i < FLAPPY_CONFIG.pipes.preGenerateCount; i++) {
        this.generatePipe(this.canvas.width + (i * this.pipeSpacing));
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
  
      // Random gap positions
      const minY = FLAPPY_CONFIG.pipes.gapMargin;
      const maxY =
        this.canvas.height -
        FLAPPY_CONFIG.pipes.gapMargin -
        this.gapHeight -
        this.gapSpacing -
        this.gapHeight;
      const firstGapY = Math.random() * (maxY - minY) + minY;
      const secondGapY = firstGapY + this.gapHeight + this.gapSpacing;
  
      // Correct/incorrect answers
      const correctAnswer = currentQ.answers.find(a => a.isCorrect)?.text || 'True';
      const incorrectAnswer = currentQ.answers.find(a => !a.isCorrect)?.text || 'False';
      const isTopCorrect = Math.random() < 0.5;
  
      this.pipes.push({
        x: xPosition,
        gapY1: firstGapY,
        gapY2: secondGapY,
        passed: false,
        questionIndex: this.currentQuestionIndex,
        topGapAnswer: isTopCorrect ? correctAnswer : incorrectAnswer,
        bottomGapAnswer: isTopCorrect ? incorrectAnswer : correctAnswer,
        isTopCorrect
      });
  
      this.currentQuestionIndex++;
    }
  
    update() {
      if (this.gameOver || this.isPaused) {
        if (this.isPaused) {
          this.pauseTimer--;
          if (this.pauseTimer <= 0) {
            this.isPaused = false;
          }
        }
        return;
      }
  
      // Bird physics
      this.bird.velocity += this.bird.gravity;
      this.bird.y += this.bird.velocity;
  
      // Bounce at floor/ceiling
      if (this.bird.y + this.bird.height > this.canvas.height) {
        this.bird.y = this.canvas.height - this.bird.height;
        this.bird.velocity = -this.bird.bounceForce;
      } else if (this.bird.y < 0) {
        this.bird.y = 0;
        this.bird.velocity = this.bird.bounceForce;
      }
  
      // Move pipes
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= this.pipeSpeed;
  
        // Collision check
        if (this.checkPipeCollision(pipe)) {
          continue;
        }
  
        // Passing logic
        if (!pipe.passed && this.bird.x > pipe.x + this.pipeWidth) {
          pipe.passed = true;
          this.score++;
  
          // Next question
          const nextQuestionIndex = pipe.questionIndex + 1;
          if (nextQuestionIndex < this.questions.length) {
            this.currentQuestion = this.questions[nextQuestionIndex].question;
            this.questionDiv.textContent = this.currentQuestion;
          }
  
          // Short pause
          this.isPaused = true;
          this.pauseTimer = this.pauseDuration;
        }
  
        // Remove old pipes, generate new
        if (pipe.x + this.pipeWidth < FLAPPY_CONFIG.pipes.removeOffset) {
          this.pipes.splice(i, 1);
          if (this.pipes.length > 0) {
            const lastPipe = this.pipes[this.pipes.length - 1];
            this.generatePipe(lastPipe.x + this.pipeSpacing);
          }
        }
      }
    }
  
    checkPipeCollision(pipe) {
      if (
        this.bird.x + this.bird.width > pipe.x &&
        this.bird.x < pipe.x + this.pipeWidth
      ) {
        const inTopGap =
          this.bird.y > pipe.gapY1 &&
          this.bird.y + this.bird.height < pipe.gapY1 + this.gapHeight;
        const inBottomGap =
          this.bird.y > pipe.gapY2 &&
          this.bird.y + this.bird.height < pipe.gapY2 + this.gapHeight;
  
        // Collided with pipe
        if (!inTopGap && !inBottomGap) {
          this.gameOver = true;
          return true;
        }
  
        // Wrong answer
        if ((inTopGap && !pipe.isTopCorrect) || (inBottomGap && pipe.isTopCorrect)) {
          this.feedback.active = true;
          this.feedback.timer = this.feedback.duration;
          this.feedback.message = "Wrong Answer!";
          this.gameOver = true;
          return true;
        }
      }
      return false;
    }
  
    draw() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw pipes
      this.pipes.forEach((pipe) => {
        this.ctx.fillStyle = FLAPPY_CONFIG.colors.pipe;
        // top
        this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY1);
        // middle
        this.ctx.fillRect(
          pipe.x,
          pipe.gapY1 + this.gapHeight,
          this.pipeWidth,
          pipe.gapY2 - (pipe.gapY1 + this.gapHeight)
        );
        // bottom
        this.ctx.fillRect(
          pipe.x,
          pipe.gapY2 + this.gapHeight,
          this.pipeWidth,
          this.canvas.height - (pipe.gapY2 + this.gapHeight)
        );
  
        // Answer boxes
        const boxWidth = this.pipeWidth + 2 * FLAPPY_CONFIG.text.boxExtraWidth;
        const boxHeight = this.gapHeight - FLAPPY_CONFIG.text.boxExtraHeight;
        const boxX = pipe.x - FLAPPY_CONFIG.text.boxExtraWidth;
        const boxYTop = pipe.gapY1 + FLAPPY_CONFIG.text.boxPadding;
        const boxYBottom = pipe.gapY2 + FLAPPY_CONFIG.text.boxPadding;
  
        this.ctx.fillStyle = FLAPPY_CONFIG.text.answerBoxBackground;
        this.ctx.fillRect(boxX, boxYTop, boxWidth, boxHeight);
        this.ctx.fillRect(boxX, boxYBottom, boxWidth, boxHeight);
  
        // Top text
        this.ctx.fillStyle = pipe.isTopCorrect
          ? FLAPPY_CONFIG.colors.answerTopText
          : FLAPPY_CONFIG.colors.answerBottomText;
        this.ctx.font = FLAPPY_CONFIG.text.answerFont;
        this.ctx.textAlign = 'center';
        this.wrapText(
          this.ctx,
          pipe.topGapAnswer,
          pipe.x + this.pipeWidth / 2,
          boxYTop + FLAPPY_CONFIG.text.answerTextOffset,
          boxWidth - 2 * FLAPPY_CONFIG.text.boxPadding,
          FLAPPY_CONFIG.text.lineHeight
        );
  
        // Bottom text
        this.ctx.fillStyle = pipe.isTopCorrect
          ? FLAPPY_CONFIG.colors.answerBottomText
          : FLAPPY_CONFIG.colors.answerTopText;
        this.wrapText(
          this.ctx,
          pipe.bottomGapAnswer,
          pipe.x + this.pipeWidth / 2,
          boxYBottom + FLAPPY_CONFIG.text.answerTextOffset,
          boxWidth - 2 * FLAPPY_CONFIG.text.boxPadding,
          FLAPPY_CONFIG.text.lineHeight
        );
      });
  
      // Draw bird
      this.ctx.fillStyle = FLAPPY_CONFIG.colors.bird;
      this.ctx.beginPath();
      this.ctx.arc(
        this.bird.x + this.bird.width / 2,
        this.bird.y + this.bird.height / 2,
        this.bird.width / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
  
      // Draw score
      this.ctx.fillStyle = FLAPPY_CONFIG.colors.score;
      this.ctx.font = FLAPPY_CONFIG.ui.scoreFont;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`Score: ${this.score}`, 10, 30);
  
      // Feedback
      if (this.feedback.active) {
        this.ctx.fillStyle = this.feedback.color;
        this.ctx.font = FLAPPY_CONFIG.ui.feedbackFont;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          this.feedback.message,
          this.canvas.width / 2,
          this.canvas.height / 2
        );
        this.feedback.timer--;
        if (this.feedback.timer <= 0) {
          this.feedback.active = false;
        }
      }
  
      // Game over screen
      if (this.gameOver) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = FLAPPY_CONFIG.ui.gameOverFont;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = FLAPPY_CONFIG.ui.finalScoreFont;
        this.ctx.fillText(
          `Final Score: ${this.score}`,
          this.canvas.width / 2,
          this.canvas.height / 2 + 40
        );
        this.ctx.fillText(
          'Press Space to Try Again',
          this.canvas.width / 2,
          this.canvas.height / 2 + 80
        );
      }
  
      // Pause overlay
      if (this.isPaused) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = FLAPPY_CONFIG.ui.pauseFont;
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
      this.preGeneratePipes();
    }
  
    gameLoop() {
      this.update();
      this.draw();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  
    // Helper text-wrapping function
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
  
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
  
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    }
  }
  
  // Create/initialize your Game instance
  let game;
  function initGame() {
    game = new Game();
  }
  initGame();
  