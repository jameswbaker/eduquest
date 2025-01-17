class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.questionDiv = document.getElementById('question');
        
        // Player properties
        this.player = {
            x: 50,
            y: 300,
            width: 30,
            height: 30,
            speed: 8,
            hurt: false,
            hurtTimer: 0
        };

        // Game state
        this.level = 1;
        this.levelsCleared = 0;
        this.lives = 5;
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
        this.projectileSpeed = 7; // Reduced from 10
        this.safeRadius = 100; // Radius around player where objects can't spawn
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
        const margin = 100; // Minimum distance from edges

        // Calculate platform size based on longest word
        const longestWord = possibleAnswers.reduce((a, b) => a.length > b.length ? a : b);
        const platformWidth = Math.max(this.ctx.measureText(longestWord).width + 40, 80); // Min 80px width
        const platformHeight = 80;

        possibleAnswers.forEach((answer) => {
            let validPosition = false;
            let platform;
            let attempts = 0;
            const maxAttempts = 100;
            
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
        const numTurrets = Math.floor(Math.random() * 3) + 2; // 2-4 turrets
        
        for (let i = 0; i < numTurrets; i++) {
            let validPosition = false;
            let turret;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!validPosition && attempts < maxAttempts) {
                attempts++;
                turret = {
                    x: Math.random() * (this.canvas.width - 80) + 40,
                    y: Math.random() * (this.canvas.height - 80) + 40,
                    width: 40,
                    height: 40,
                    shootTimer: 0,
                    shootInterval: Math.random() * 60 + 30 // Random interval between 30-90
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
        // Don't shoot for first 3 seconds of level
        if (Date.now() - this.levelStartTime < 1000) {
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
        const speed = Math.random() * 2 + 3; // Random speed between 3-5 (reduced from 3-6)
        this.projectiles.push({
            x: turret.x,
            y: turret.y,
            width: 10,
            height: 10,
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
            this.player.hurtTimer = 30;
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
            this.ctx.fillStyle = '#2196F3'; // All answers same color
            this.ctx.fillRect(
                answer.platform.x,
                answer.platform.y,
                answer.platform.width,
                answer.platform.height
            );
            
            // Draw answer text with smaller font
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial'; // Reduced from 20px to 16px
            this.ctx.textAlign = 'center';
            
            // Split text into multiple lines if needed
            const words = answer.value.split(' ');
            let lines = [];
            let currentLine = words[0];
            
            for(let i = 1; i < words.length; i++) {
                const testLine = currentLine + ' ' + words[i];
                const metrics = this.ctx.measureText(testLine);
                if (metrics.width < answer.platform.width - 10) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);
            
            // Draw each line
            const lineHeight = 18;
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
        this.ctx.fillStyle = '#444';
        this.turrets.forEach(turret => {
            this.ctx.fillRect(turret.x, turret.y, turret.width, turret.height);
        });

        // Draw projectiles
        this.ctx.fillStyle = '#ff0000';
        this.projectiles.forEach(proj => {
            this.ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        });

        // Draw player
        this.ctx.fillStyle = this.player.hurt ? '#ff6666' : 'red';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw score and lives
        this.ctx.fillStyle = 'black';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.levelsCleared}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 60);

        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
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