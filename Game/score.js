export default class Score {
    score = 1;
    HIGH_SCORE_KEY = "High Score";

    constructor(ctx, scaleRatio, playerId) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.scaleRatio = scaleRatio;
        this.playerId = playerId;
    }

    update(frameTimeDelta) {
        this.score += frameTimeDelta * 0.01;
    }

    reset() {
        this.score = 0;
    }

    setHighScore(playerId) {
        const highScoreKey = `${this.HIGH_SCORE_KEY}_${playerId}`;
        const highScore = Number(localStorage.getItem(highScoreKey));
        if (this.score > highScore)
            localStorage.setItem(highScoreKey, Math.floor(this.score));
    }

    draw(playerId) {
        const highScoreKey = `${this.HIGH_SCORE_KEY}_${playerId}`;
        const highScore = Number(localStorage.getItem(highScoreKey));
        const y = 20 * this.scaleRatio;

        const fontSize = 20 * this.scaleRatio;
        this.ctx.font = `${fontSize}px serif`;
        this.ctx.fillStyle = "#000000";
        const scoreX = this.canvas.width - 75 * this.scaleRatio;
        const highScoreX = scoreX - 125 * this.scaleRatio;

        const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
        const highScorePadded = highScore.toString().padStart(6, 0);

        this.ctx.fillText(scorePadded, scoreX, y);
        this.ctx.fillText(`HS ${highScorePadded}`, highScoreX, y);
    }
}