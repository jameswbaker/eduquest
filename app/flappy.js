class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.questionDiv = document.getElementById('question');
        
        // Bird properties
        this.bird = {
            x: 150,
            y: 300,
            width: 25,    // Reduced from 30
            height: 20,   // Reduced from 25
            velocity: 0,
            gravity: 0.4,    // Reduced from 0.6
            jumpForce: -8,
            bounceForce: 4   // New property for boundary bouncing
        };

        // Game state
        this.score = 0;
        this.gameOver = false;
        this.currentQuestion = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        
        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 40;     // Reduced from 60
        this.gapHeight = 150;
        this.gapSpacing = 150;
        this.pipeSpacing = 350;
        this.pipeSpeed = 2.5;
        this.worldOffset = 0;
        
        // Feedback system
        this.feedback = {
            active: false,
            timer: 0,
            duration: 90,
            message: "",
            color: "red"
        };
        
        // Game state control
        this.isPaused = false;
        this.pauseTimer = 0;
        this.pauseDuration = 150;
        
        // Event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        
        // Initial UI setup
        this.setupUI();
    }

    setupUI() {
        document.getElementById('inputContainer').style.display = 'block';
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
        
        // Update UI
        document.getElementById('inputContainer').style.display = 'none';
        this.canvas.style.display = 'block';
        this.questionDiv.style.display = 'block';
        
        // Initialize game
        this.preGeneratePipes();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    preGeneratePipes() {
        // Generate initial set of pipes
        for (let i = 0; i < 5; i++) {
            this.generatePipe(this.canvas.width + (i * this.pipeSpacing));
        }
    }

    generatePipe(xPosition) {
        // Don't generate more pipes if we're out of questions
        if (this.currentQuestionIndex >= this.questions.length) {
            return;
        }

        const currentQ = this.questions[this.currentQuestionIndex];
        
        // Ensure we have valid question data
        if (!currentQ || !currentQ.answers || currentQ.answers.length < 2) {
            console.error('Invalid question format', currentQ);
            return;
        }

        // Calculate gap positions - ensure both gaps are visible
        const minY = 80;
        const maxY = this.canvas.height - 80 - this.gapHeight - this.gapSpacing - this.gapHeight;
        const firstGapY = Math.random() * (maxY - minY) + minY;
        const secondGapY = firstGapY + this.gapHeight + this.gapSpacing;

        // Get answers
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
            isTopCorrect: isTopCorrect
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

        // Update bird physics
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Boundary checks with bouncing
        if (this.bird.y + this.bird.height > this.canvas.height) {
            this.bird.y = this.canvas.height - this.bird.height;
            this.bird.velocity = -this.bird.bounceForce; // Bounce up
        } else if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = this.bird.bounceForce; // Bounce down
        }

        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            // Check collision
            if (this.checkPipeCollision(pipe)) {
                continue;
            }

            // Check if pipe was passed
            if (!pipe.passed && this.bird.x > pipe.x + this.pipeWidth) {
                pipe.passed = true;
                this.score++;
                
                // Update current question
                const nextQuestionIndex = pipe.questionIndex + 1;
                if (nextQuestionIndex < this.questions.length) {
                    this.currentQuestion = this.questions[nextQuestionIndex].question;
                    this.questionDiv.textContent = this.currentQuestion;
                }
                
                // Pause briefly after passing pipe
                this.isPaused = true;
                this.pauseTimer = this.pauseDuration;
            }

            // Remove off-screen pipes and generate new ones
            if (pipe.x + this.pipeWidth < -100) {
                this.pipes.splice(i, 1);
                if (this.pipes.length > 0) {
                    const lastPipe = this.pipes[this.pipes.length - 1];
                    this.generatePipe(lastPipe.x + this.pipeSpacing);
                }
            }
        }
    }

    checkPipeCollision(pipe) {
        if (this.bird.x + this.bird.width > pipe.x && 
            this.bird.x < pipe.x + this.pipeWidth) {
            
            const inTopGap = this.bird.y > pipe.gapY1 && 
                            this.bird.y + this.bird.height < pipe.gapY1 + this.gapHeight;
            const inBottomGap = this.bird.y > pipe.gapY2 && 
                               this.bird.y + this.bird.height < pipe.gapY2 + this.gapHeight;
            
            if (!inTopGap && !inBottomGap) {
                this.gameOver = true;
                return true;
            }
            
            // Check if went through wrong gap
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

        // Draw pipes and answers
        this.pipes.forEach(pipe => {
            // Draw pipes
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY1); // Top section
            this.ctx.fillRect(pipe.x, pipe.gapY1 + this.gapHeight, 
                            this.pipeWidth, pipe.gapY2 - (pipe.gapY1 + this.gapHeight)); // Middle section
            this.ctx.fillRect(pipe.x, pipe.gapY2 + this.gapHeight, 
                            this.pipeWidth, this.canvas.height - (pipe.gapY2 + this.gapHeight)); // Bottom section

            // Draw answer boxes
            const padding = 10;
            const boxWidth = this.pipeWidth + 40;
            const boxHeight = this.gapHeight - 20;
            
            // Draw answer backgrounds
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fillRect(pipe.x - 20, pipe.gapY1 + 10, boxWidth, boxHeight);
            this.ctx.fillRect(pipe.x - 20, pipe.gapY2 + 10, boxWidth, boxHeight);
            
            // Draw answer text
            this.ctx.fillStyle = pipe.isTopCorrect ? 'black' : 'red';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.wrapText(this.ctx, pipe.topGapAnswer, pipe.x + this.pipeWidth/2, 
                         pipe.gapY1 + 30, boxWidth - 20, 20);
            
            this.ctx.fillStyle = pipe.isTopCorrect ? 'red' : 'black';
            this.wrapText(this.ctx, pipe.bottomGapAnswer, pipe.x + this.pipeWidth/2, 
                         pipe.gapY2 + 30, boxWidth - 20, 20);
        });

        // Draw bird
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2, 
                    this.bird.width/2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw score
        this.ctx.fillStyle = 'black';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        // Draw feedback
        if (this.feedback.active) {
            this.ctx.fillStyle = this.feedback.color;
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.feedback.message, this.canvas.width/2, this.canvas.height/2);
            this.feedback.timer--;
            if (this.feedback.timer <= 0) {
                this.feedback.active = false;
            }
        }

        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
            this.ctx.fillText('Press Space to Try Again', this.canvas.width/2, this.canvas.height/2 + 80);
        }

        // Draw pause indicator
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Get Ready!', this.canvas.width/2, this.canvas.height/2);
        }
    }

    resetGame() {
        this.bird.y = 300;
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

    // Add helper method for text wrapping
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

// Initialize game
let game;
function initGame() {
    game = new Game();
}

initGame();
