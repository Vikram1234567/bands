export class cBullet {
  constructor(initPack) {
    this.ID = initPack.ID;
    this.x = initPack.x;
    this.y = initPack.y;
  } //cBullet.constructor()

  drawSelf(ctx, xView, yView) {
    let x = this.x - xView;
    let y = this.y - yView;


    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2*Math.PI);
    ctx.stroke();
  } //cBullet.drawSelf()
} //class cBullet