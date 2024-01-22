export default class Cactus {
    constructor(ctx, x, y, width, height, image) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;

    }

    update(speed, gameSpeed, frameTimeDelta, scaleRatio) {
        this.x -= gameSpeed * gameSpeed * frameTimeDelta * scaleRatio;
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    collideWith(sprite) {
        const adjustBy = 1.4;
        if (
            sprite.x + sprite.width / adjustBy > this.x &&
            sprite.x < this.x + this.width &&
            sprite.y + sprite.height / adjustBy > this.y &&
            sprite.y < this.y + this.height
        ) {
            return true;
        }
        else {
            return false;
        }


    }
}
