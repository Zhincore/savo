
function Ray(color, linewidth, x, y){
    drawingContext = ctx;
    this.width=drawingContext.canvas.width;
    this.height=drawingContext.canvas.height;
    this.drawingCtx=drawingContext;
    this.points=[]
    this.canvas=document.createElement("canvas");
    this.canvas.width=this.width;
    this.canvas.height=this.height;
    this.ctx=this.canvas.getContext("2d");
    this.ctx.strokeStyle=color;
    this.ctx.lineWidth=linewidth;
    this.origin = new Victor(x, y);;
    
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, -100);
    this.ctx.stroke();
}

/*Ray.prototype.moveTo=function(x, y){
    this.lastX=x;
    this.lastY=y;
}

Ray.prototype.lineTo=function(x, y){
    this.ctx.moveTo(this.lastX,this.lastY);
    this.ctx.lineTo(x,y);
    this.ctx.stroke();
    this.lastX=x;
    this.lastY=y;
}*/

Ray.prototype.draw=function(){
    this.drawingCtx.drawImage(this.canvas,0,0);
}

Ray.prototype.isPointInPath=function(x, y){
    return this.ctx.isPointInPath(x, y);
}

Ray.prototype.rotate=function(deg){
      this.ctx.clearRect(0,0,canvas.width,canvas.height);
      this.ctx.beginPath();
      this.ctx.moveTo(this.origin.x, this.origin.y);
      this.ctx.lineTo(this.origin.x, -10000);
      this.ctx.stroke();
}

Ray.prototype.getPos=function(){
    return {x: this.origin.x, y:this.origin.y};
}

Ray.prototype.getDirection=function(){
    return this.direction;
}


