
import {AABB, Environment} from "./environment";

export class Entity extends AABB {

    posX;
    posY;
    velocityX;
    velocityY;
    accelerationX;
    accelerationY;
    onGround;

    constructor(posX, posY) {
        super(posX, posY, 30, 50);
        this.posX = posX;
        this.posY = posY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
    }

    update(deltaT) {
        let collidesX = false;
        let collidesY = false;

        this.velocityY += Environment.gravitationalConstant * 10;

        for (let i = 0; i < Environment.boundingBoxes.length; i++) {
            let p = Environment.boundingBoxes[i];
            if (this === p)
                continue;

            let cpyX = this.copy().translate(
                this.posX + this.velocityX * deltaT,
                this.posY
            );

            let cpyY = this.copy().translate(
                this.posX,
                this.posY + this.velocityY * deltaT
            )

            if (!collidesX && cpyX.intersects(p))
                collidesX = true;

            if (!collidesY && cpyY.intersects(p))
                collidesY = true;

            if (collidesX && collidesY)
                break;
        }

        if (!collidesX) {
            this.posX += this.velocityX * deltaT;
        }

        if (!collidesY) {
            this.posY += this.velocityY * deltaT;
        }

        this.velocityX = (Math.floor(this.velocityX * 1000 - 1) / 1000);
        this.velocityY = (Math.floor(this.velocityY * 1000 - 1) / 1000);
        this.translate(this.posX, this.posY);
        // This is to apply gravity. Collision detection follows.
    }

}
