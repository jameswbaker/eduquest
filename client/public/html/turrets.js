/* GAME CONFIGURATION CONSTANTS */
const GAME_CONFIG = {
    player: {
        speed: 6, // decreased from 8 for slower movement speed
        width: 30,
        height: 30,
        initialLives: 5,
        hurtTimer: 30,
        color: {
            normal: 'red',
            hurt: '#ff6666'
        }
    },
    projectile: {
        minSpeed: 2,
        maxSpeed: 4,
        width: 10,
        height: 10,
        color: '#ff0000'
    },
    turret: {
        minCount: 2,
        maxCount: 4,
        width: 40,
        height: 40,
        minShootInterval: 30,
        shootIntervalRange: 60,
        spawnMargin: 40,
        initialDelay: 1000, // delay (ms) before turrets start shooting
        color: '#444'
    },
    platform: {
        spawnMargin: 100,
        textPadding: 20,
        minWidth: 80,
        height: 80
    },
    text: {
        answerFont: '16px Arial',
        answerColor: 'white',
        answerLineHeight: 18,
        scoreFont: '24px Arial',
        gameOverFont: '48px Arial',
        finalScoreFont: '24px Arial'
    },
    colors: {
        answerArea: '#2196F3'
    },
    positioning: {
        maxAttempts: 100
    },
    safeRadius: 100
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Check canvas dimensions and reset if needed
        console.log("Canvas dimensions at start:", this.canvas.width, this.canvas.height);
        if (!this.canvas.width || !this.canvas.height) {
            console.warn("Canvas has no dimensions, resetting to default size");
            this.canvas.width = 800;
            this.canvas.height = 600;
        }
        
        this.questionDiv = document.getElementById('question');
        
        // Player properties
        this.player = {
            x: 50,
            y: 300,
            width: GAME_CONFIG.player.width,
            height: GAME_CONFIG.player.height,
            speed: GAME_CONFIG.player.speed,
            hurt: false,
            hurtTimer: 0
        };

        // Game state
        this.level = 1;
        this.levelsCleared = 0;
        this.lives = GAME_CONFIG.player.initialLives;
        this.gameOver = false;
        this.currentQuestion = null;
        this.platforms = [];
        this.answers = [];
        this.currentWordSet = null;
        
        // Track pressed keys
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Bind event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Additional properties
        this.projectiles = [];
        this.turrets = [];
        this.levelStartTime = 0; // Track when level starts

        // Show input container initially
        // document.getElementById('inputContainer').style.display = 'block';
        this.canvas.style.display = 'none';
        this.questionDiv.style.display = 'none';
        
        // Questions property
        this.questions = [];
        this.currentQuestionIndex = 0;

        // Flag to ensure restart listener is added only once per game over
        this.restartListenerAdded = false;
    }

    async startGame(questions) {
        console.log("Game started with questions:", questions);
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            console.error("Invalid questions data received:", questions);
            return;
        }
        this.questions = questions;
        // document.getElementById('inputContainer').style.display = 'none';
        this.canvas.style.display = 'block';
        this.questionDiv.style.display = 'block';
        
        // Start the game
        this.generateLevel();
        this.gameLoop();
    }

    // Reset only the game state (score, lives, levels, etc.) without reinitializing the entire game
    resetGame() {
        console.log("Resetting game state...");
        // Reset player position and status
        this.player.x = 50;
        this.player.y = 300;
        this.player.hurt = false;
        this.player.hurtTimer = 0;
        
        // Reset game state
        this.level = 1;
        this.levelsCleared = 0;
        this.lives = GAME_CONFIG.player.initialLives;
        this.gameOver = false;
        this.currentQuestion = null;
        this.platforms = [];
        this.answers = [];
        this.projectiles = [];
        this.turrets = [];
        this.levelStartTime = 0;
        this.currentQuestionIndex = 0;
        
        // Generate the first level anew
        this.generateLevel();
    }

    generateLevel(keepCurrentWord = false) {
        console.log("Generating level, question index:", this.currentQuestionIndex);
        if (this.currentQuestionIndex >= this.questions.length) {
            console.log("No more questions, game over");
            this.gameOver = true;
            this.currentQuestion = 0;
            return;
        }

        // Set level start time
        this.levelStartTime = Date.now();

        const currentQ = this.questions[this.currentQuestionIndex];
        console.log("Current question:", currentQ);
        
        // Update current question
        this.currentQuestion = {
            text: currentQ.question,
            correct: currentQ.answers.find(a => a.isCorrect).text
        };
        
        // Display question
        this.questionDiv.textContent = this.currentQuestion.text;
        
        // Clear previous level
        this.platforms = [];
        this.answers = [];
        this.turrets = [];
        this.projectiles = [];

        // Create answer areas using the multiple choice answers
        const possibleAnswers = currentQ.answers.map(a => a.text);
        console.log("Possible answers:", possibleAnswers);
        
        // Create answer areas in random positions
        const margin = GAME_CONFIG.platform.spawnMargin; // Minimum distance from edges
        const safeRadius = GAME_CONFIG.safeRadius || 100;
        console.log("Safe radius:", safeRadius);
        console.log("Canvas dimensions:", this.canvas.width, this.canvas.height);
        console.log("Player position:", this.player.x, this.player.y);

        // Calculate platform size based on longest word
        const longestWord = possibleAnswers.reduce((a, b) => a.length > b.length ? a : b);
        const platformWidth = Math.max(this.ctx.measureText(longestWord).width + GAME_CONFIG.platform.textPadding, GAME_CONFIG.platform.minWidth);
        const platformHeight = GAME_CONFIG.platform.height;
        
        possibleAnswers.forEach((answer) => {
            let validPosition = false;
            let platform;
            let attempts = 0;
            const maxAttempts = GAME_CONFIG.positioning.maxAttempts;
            
            while (!validPosition && attempts < maxAttempts) {
                attempts++;
                platform = {
                    x: Math.random() * (this.canvas.width - platformWidth - margin) + margin,
                    y: Math.random() * (this.canvas.height - platformHeight - margin) + margin,
                    width: platformWidth,
                    height: platformHeight
                };
                
                // Check if position is valid (away from player and other platforms)
                validPosition = !this.platforms.some(existing => this.checkCollision(platform, existing)) && 
                              Math.hypot(platform.x - this.player.x, platform.y - this.player.y) > safeRadius;
            }
            
            if (validPosition) {
                console.log(`Created platform at (${platform.x.toFixed(0)}, ${platform.y.toFixed(0)}) for answer: ${answer}`);
                this.platforms.push(platform);
                this.answers.push({
                    value: answer,
                    platform: platform,
                    isCorrect: answer === this.currentQuestion.correct
                });
            } else {
                console.warn(`Failed to find valid position for answer: ${answer} after ${maxAttempts} attempts`);
            }
        });

        // Add random turrets
        const numTurrets = Math.floor(Math.random() * (GAME_CONFIG.turret.maxCount - GAME_CONFIG.turret.minCount + 1)) + GAME_CONFIG.turret.minCount;
        console.log(`Attempting to create ${numTurrets} turrets`);
        
        for (let i = 0; i < numTurrets; i++) {
            let validPosition = false;
            let turret;
            let attempts = 0;
            const maxAttempts = GAME_CONFIG.positioning.maxAttempts;
            
            while (!validPosition && attempts < maxAttempts) {
                attempts++;
                turret = {
                    x: Math.random() * (this.canvas.width - 2 * GAME_CONFIG.turret.spawnMargin) + GAME_CONFIG.turret.spawnMargin,
                    y: Math.random() * (this.canvas.height - 2 * GAME_CONFIG.turret.spawnMargin) + GAME_CONFIG.turret.spawnMargin,
                    width: GAME_CONFIG.turret.width,
                    height: GAME_CONFIG.turret.height,
                    shootTimer: 0,
                    shootInterval: Math.random() * GAME_CONFIG.turret.shootIntervalRange + GAME_CONFIG.turret.minShootInterval
                };
                
                // Check if position is valid (away from player, platforms, and other turrets)
                validPosition = !this.platforms.some(platform => this.checkCollision(turret, platform)) && 
                              !this.turrets.some(existing => this.checkCollision(turret, existing)) && 
                              Math.hypot(turret.x - this.player.x, turret.y - this.player.y) > safeRadius;
            }
            
            if (validPosition) {
                console.log(`Created turret at (${turret.x.toFixed(0)}, ${turret.y.toFixed(0)})`);
                this.turrets.push(turret);
            } else {
                console.warn(`Failed to create turret ${i+1} after ${maxAttempts} attempts`);
            }
        }
    }

    handleKeyDown(event) {
        if (this.gameOver) return;
        
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
        }
    }

    checkCollisions() {
        // Check answer area collisions
        for (const answer of this.answers) {
            if (this.checkCollision(this.player, answer.platform)) {
                if (answer.isCorrect) {
                    this.currentQuestionIndex++;
                    this.levelsCleared++;
                    this.generateLevel();
                    return;
                }
            }
        }

        // Check turret collisions
        for (const turret of this.turrets) {
            if (this.checkCollision(this.player, turret)) {
                // Move player back to previous position
                if (this.keys.up) this.player.y += this.player.speed;
                if (this.keys.down) this.player.y -= this.player.speed;
                if (this.keys.left) this.player.x += this.player.speed;
                if (this.keys.right) this.player.x -= this.player.speed;
            }
        }

        // Check projectile collisions
        for (const proj of this.projectiles) {
            if (this.checkCollision(this.player, proj)) {
                this.hurtPlayer();
                break;
            }
        }
    }

    update() {
        if (this.gameOver) return;

        // Handle movement based on pressed keys
        if (this.keys.up) {
            this.player.y -= this.player.speed;
        }
        if (this.keys.down) {
            this.player.y += this.player.speed;
        }
        if (this.keys.left) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.right) {
            this.player.x += this.player.speed;
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
        this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.height));
        
        // Update projectiles and turrets
        this.updateProjectiles();
        this.updateTurrets();
        
        // Check collisions with answer areas and projectiles
        this.checkCollisions();

        // Update hurt timer
        if (this.player.hurt) {
            this.player.hurtTimer--;
            if (this.player.hurtTimer <= 0) {
                this.player.hurt = false;
            }
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.velocityX;
            proj.y += proj.velocityY;

            // Remove if off screen
            if (proj.x < 0 || proj.x > this.canvas.width || proj.y < 0 || proj.y > this.canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateTurrets() {
        // Don't shoot for initial delay of level
        if (Date.now() - this.levelStartTime < GAME_CONFIG.turret.initialDelay) {
            return;
        }

        this.turrets.forEach(turret => {
            turret.shootTimer++;
            if (turret.shootTimer >= turret.shootInterval) {
                this.shootProjectile(turret);
                turret.shootTimer = 0;
            }
        });
    }

    shootProjectile(turret) {
        const angle = Math.atan2(this.player.y - turret.y, this.player.x - turret.x);
        const speed = Math.random() * (GAME_CONFIG.projectile.maxSpeed - GAME_CONFIG.projectile.minSpeed) + GAME_CONFIG.projectile.minSpeed;
        this.projectiles.push({
            x: turret.x,
            y: turret.y,
            width: GAME_CONFIG.projectile.width,
            height: GAME_CONFIG.projectile.height,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    hurtPlayer() {
        if (!this.player.hurt) {
            this.player.hurt = true;
            this.player.hurtTimer = GAME_CONFIG.player.hurtTimer;
            this.lives--;
            this.projectiles = []; // Clear projectiles on hurt
            
            if (this.lives <= 0) {
                this.gameOver = true;
            } else {
                // Regenerate level with same word set
                this.generateLevel(true);
            }
        }
    }

    draw() {
        // Clear canvas with no transform
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw hurt effect
        if (this.player.hurt) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw answer areas
        console.log("Drawing answers:", this.answers.length);
        this.answers.forEach(answer => {
            this.ctx.fillStyle = GAME_CONFIG.colors.answerArea; // All answers same color
            this.ctx.fillRect(
                answer.platform.x,
                answer.platform.y,
                answer.platform.width,
                answer.platform.height
            );
            
            // Draw answer text with smaller font
            this.ctx.fillStyle = GAME_CONFIG.text.answerColor;
            this.ctx.font = GAME_CONFIG.text.answerFont;
            this.ctx.textAlign = 'center';
            
            // Split text into multiple lines if needed
            const words = answer.value.split(' ');
            let lines = [];
            let currentLine = words[0];
            
            for(let i = 1; i < words.length; i++) {
                const testLine = currentLine + ' ' + words[i];
                const metrics = this.ctx.measureText(testLine);
                if (metrics.width < answer.platform.width - 10) { // 10 remains as a small margin
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);
            
            // Draw each line
            const lineHeight = GAME_CONFIG.text.answerLineHeight;
            const totalHeight = lines.length * lineHeight;
            const startY = answer.platform.y + (answer.platform.height - totalHeight) / 2 + lineHeight;
            
            lines.forEach((line, index) => {
                this.ctx.fillText(
                    line,
                    answer.platform.x + answer.platform.width/2,
                    startY + (index * lineHeight)
                );
            });
        });

        // Draw turrets
        console.log("Drawing turrets:", this.turrets.length);
        this.ctx.fillStyle = GAME_CONFIG.turret.color;
        this.turrets.forEach(turret => {
            this.ctx.fillRect(turret.x, turret.y, turret.width, turret.height);
        });

        // Draw projectiles
        console.log("Drawing projectiles:", this.projectiles.length);
        this.ctx.fillStyle = GAME_CONFIG.projectile.color;
        this.projectiles.forEach(proj => {
            this.ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        });

        // Draw player
        this.ctx.fillStyle = this.player.hurt ? GAME_CONFIG.player.color.hurt : GAME_CONFIG.player.color.normal;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw score and lives
        this.ctx.font = GAME_CONFIG.text.scoreFont;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.levelsCleared}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 60);

        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = GAME_CONFIG.text.gameOverFont;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = GAME_CONFIG.text.finalScoreFont;
            this.ctx.fillText(`Final Score: ${this.levelsCleared}`, this.canvas.width/2, this.canvas.height/2 + 40);
            this.ctx.fillText("Press Space to Restart", this.canvas.width/2, this.canvas.height/2 + 70);

            // When space is pressed after game over, reset the score and game state.
            if (!this.restartListenerAdded) {
                this.restartListenerAdded = true;
                const restartHandler = (e) => {
                    if (e.code === 'Space') {
                        this.resetGame();
                        document.removeEventListener('keydown', restartHandler);
                        this.restartListenerAdded = false;
                        this.gameOver = false;
                    }
                };
                document.addEventListener('keydown', restartHandler);
            }
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Instead of reinitializing the entire game (and iframe), we now create one game instance.
let game;
function initGame() {
    game = new Game();
}

// Initialize game when page loads
initGame();
