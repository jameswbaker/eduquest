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
        
        // Add new properties
        this.projectiles = [];
        this.turrets = [];
        this.levelStartTime = 0; // Track when level starts

        // Show input container initially
        document.getElementById('inputContainer').style.display = 'block';
        this.canvas.style.display = 'none';
        this.questionDiv.style.display = 'none';
        
        // Add questions property
        this.questions = [];
        this.currentQuestionIndex = 0;
    }

    async startGame(questions) {
        this.questions = questions;
        document.getElementById('inputContainer').style.display = 'none';
        this.canvas.style.display = 'block';
        this.questionDiv.style.display = 'block';
        
        // Start the game
        this.generateLevel();
        this.gameLoop();
    }

    generateLevel(keepCurrentWord = false) {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.gameOver = true;
            return;
        }

        // Set level start time
        this.levelStartTime = Date.now();

        const currentQ = this.questions[this.currentQuestionIndex];
        
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
        
        // Create answer areas in random positions
        const margin = GAME_CONFIG.platform.spawnMargin; // Minimum distance from edges

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
                              Math.hypot(platform.x - this.player.x, platform.y - this.player.y) > this.safeRadius;
            }
            
            if (validPosition) {
                this.platforms.push(platform);
                this.answers.push({
                    value: answer,
                    platform: platform,
                    isCorrect: answer === this.currentQuestion.correct
                });
            }
        });

        // Add random turrets
        const numTurrets = Math.floor(Math.random() * (GAME_CONFIG.turret.maxCount - GAME_CONFIG.turret.minCount + 1)) + GAME_CONFIG.turret.minCount;
        
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
                              Math.hypot(turret.x - this.player.x, turret.y - this.player.y) > this.safeRadius;
            }
            
            if (validPosition) {
                this.turrets.push(turret);
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
        this.ctx.fillStyle = GAME_CONFIG.turret.color;
        this.turrets.forEach(turret => {
            this.ctx.fillRect(turret.x, turret.y, turret.width, turret.height);
        });

        // Draw projectiles
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
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Move game initialization to a separate function
let game;
function initGame() {
    game = new Game();
}

// Add submission handling
// submitReading() is already defined in index.html, so we can remove it from here

// Initialize game when page loads
initGame();