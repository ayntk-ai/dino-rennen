import Player from "./player.js";
import Ground from "./ground.js";
import CactiController from "./cacticontroller.js";
import Score from "./score.js";


export default class Canvas {
    constructor(canvasId, controlKey,  playerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");

        this.GAME_SPEED_START = 1;
        this.GAME_SPEED_INCREMENT = 0.00001;

        this.GAME_WIDTH = 800;
        this.GAME_HEIGHT = 200;
        this.PLAYER_WIDTH = 88 / 1.5;
        this.PLAYER_HEIGHT = 94 / 1.5;
        this.MAX_JUMP_HEIGHT = this.GAME_HEIGHT;
        this.MIN_JUMP_HEIGHT = 150;
        this.GROUND_WIDTH = 2400;
        this.GROUND_HEIGHT = 24;
        this.GROUND_AND_CACTUS_SPEED = 0.5;

        
        this.CACTI_CONFIG = [
            {width:48 / 1.5, height:100 / 1.5, image:"images/cactus_1.png"},
            {width:98 / 1.5, height:100 / 1.5, image:"images/cactus_2.png"},
            {width:68 / 1.5, height:70 / 1.5, image:"images/cactus_3.png"},
        ];

        // Game Objects
        this.cactiController = null;
        this.player = null;
        this.ground = null;
        this.score = null;
        this.playerId = playerId;
        this.gameOverPlayer = false;
        this.controlKey = controlKey;

        this.scaleRatio = null;
        this.previousTime = null;
        this.gameSpeed = this.GAME_SPEED_START;
        this.gameOver = false;
        this.hasAddedEventListenersForRestart = false;
        this.waitingToStart = true;
        

        this.setScreen();
        window.addEventListener("resize", () => setTimeout(() => this.setScreen(), 500));
        if (screen.orientation) {
            screen.orientation.addEventListener("change", () => this.setScreen());
        }

        this.createSprites();
        this.setupGameReset();

        requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
    }

    createSprites() {
        const playerWidthInGame = this.PLAYER_WIDTH * this.scaleRatio;
        const playerHeightInGame = this.PLAYER_HEIGHT * this.scaleRatio;
        const minJumpHeightInGame = this.MIN_JUMP_HEIGHT * this.scaleRatio;
        const maxJumpHeightInGame = this.MAX_JUMP_HEIGHT * this.scaleRatio;

        const groundWidthInGame = this.GROUND_WIDTH * this.scaleRatio;
        const groundHeightInGame = this.GROUND_HEIGHT * this.scaleRatio;

        this.player = new Player(
            this.ctx,
            playerHeightInGame,
            playerWidthInGame,
            minJumpHeightInGame,
            maxJumpHeightInGame,
            this.scaleRatio,
           {jump: this.controlKey} // Steuerungstasten für den Spieler
        );

        this.ground = new Ground(
            this.ctx,
            groundWidthInGame,
            groundHeightInGame,
            this.GROUND_AND_CACTUS_SPEED,
            this.scaleRatio
        );

        this.cactiImages = this.CACTI_CONFIG.map(cactus => {
            const image = new Image();
            image.src = cactus.image;
            return {
                image: image,
                width: cactus.width * this.scaleRatio,
                height: cactus.height * this.scaleRatio,
            };
        });

        this.score = new Score(
            this.ctx,
            this.scaleRatio
        );


        this.cactiController = new CactiController(
            this.ctx, 
            this.cactiImages, 
            this.scaleRatio, 
            this.GROUND_AND_CACTUS_SPEED
        );

    }

    setScreen() {
                this.scaleRatio = this.getScaleRatio();
                this.canvas.width = this.GAME_WIDTH * this.scaleRatio;
                this.canvas.height = this.GAME_HEIGHT * this.scaleRatio;
                this.createSprites();
            }

            showStartGameText(){
                const fontSize = 40 * this.scaleRatio;
                    this.ctx.font = `${fontSize}px Verdana`;
                    this.ctx.fillStyle = "grey";
                    const x = this.canvas.width / 14;
                    const y = this.canvas.height / 2;
                    this.ctx.fillText(`Drücke ${this.controlKey}`, x, y);
            }
                
                showGameOver(){
                    const fontSize = 40 * this.scaleRatio;
                    this.ctx.font = `${fontSize}px Verdana`;
                    this.ctx.fillStyle = "grey";
                    const x = this.canvas.width / 4.5;
                    const y = this.canvas.height / 2;
                    this.ctx.fillText(`GAME OVER, drücke ${this.controlKey}`, x, y);
            }

            setupGameReset(){
                if (!this.hasAddedEventListenersForRestart) {
                    this.hasAddedEventListenersForRestart = true;
                    window.addEventListener("keyup", this.reset.bind(this));

                   setTimeout(() =>{
                       window.addEventListener("keyup", this.reset.bind(this), {once:true});
                    }, 500);

                }
            }


            reset(event) {
                if (event.key === this.controlKey && (this.gameOver || this.waitingToStart)) {
                    this.hasAddedEventListenersForRestart = false;
                    this.gameOver = false;
                    this.waitingToStart = false;
                    this.ground.reset();
                    this.cactiController.reset();
                    this.score.reset();
                    this.gameSpeed = this.GAME_SPEED_START;
                }
            }

            updateGameSpeed(frameTimeDelta){
                this.gameSpeed += this.GAME_SPEED_INCREMENT * frameTimeDelta;
            }

            clearScreen() {
                this.ctx.fillStyle = "white";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            gameLoop(currentTime) {
                if (this.previousTime === null) {
                    this.previousTime = currentTime;
                    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
                    return;
                }
                
                const frameTimeDelta = currentTime - this.previousTime;
                this.clearScreen();

                if (!this.gameOver && !this.waitingToStart) {
                    // Update game objects
                    this.ground.update(this.gameSpeed, frameTimeDelta);
                    this.cactiController.update(this.gameSpeed, frameTimeDelta);
                    this.player.update(this.gameSpeed, frameTimeDelta);
                    this.score.update(frameTimeDelta);
                    this.updateGameSpeed(frameTimeDelta);
                }

                if (!this.gameOver && this.cactiController.collideWith(this.player)) {
                    this.gameOver = true;
                    this.score.setHighScore(this.playerId);
                }

                // Draw game objects
                this.ground.draw();        
                this.cactiController.draw();       
                this.player.draw();        
                this.score.draw(this.playerId);        
                if(this.gameOver){
                  this.showGameOver();
                }
                if(this.waitingToStart){
                  this.showStartGameText();
                }
                requestAnimationFrame((currentTime) => this.gameLoop(currentTime));

                this.previousTime = currentTime;
            }

            getScaleRatio() {
                const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
                const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);

                if (screenWidth / screenHeight < this.GAME_WIDTH / this.GAME_HEIGHT) {
                    return screenHeight / this.GAME_WIDTH;
                } 
                else {
                    return screenHeight / this.GAME_HEIGHT;
                }
            }
} 
