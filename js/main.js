paper.install(window);


const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

var rays = [], mirrors = [], lens = [];
var selectionRectangle, dragged;

var needsUpdate = true;

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};
var enviroment = {
    RI: 1
}
var iteration = 1;

//
// AUTOSTART
//
$(document).ready(() => {
    main();
});

//
// INIT
//
function init(){
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    $(canvas).css("backgroundColor", "#00111f");

	// Create an empty project and a view for the canvas:
	paper.setup(canvas);
	
	createMirror(canvas.width/3*2, canvas.height/3*2 - 25, canvas.width/3*2-25, canvas.height/3*2 + 75);
	createMirror(canvas.width/3*2-100, canvas.height/3*2 - 120, canvas.width/3*2-100-25, canvas.height/3*2 - 20);	
	//createLen(canvas.width/3*2, canvas.height/3*2);
	
	//
    // EVENTS
    //
    view.onResize = (event) => {
        update();
    };
    
    view.onMouseDown = (event) => {
	    segment = path = null;
	    var hitResult = project.hitTest(event.point, hitOptions);
	    
	    if (hitResult) {
		    path = hitResult.item;
		    
		    if(selectionRectangle != null && path.name == "selection rectangle"){        
	            /*if (hitResult.type == 'fill'){
	                path.position = event.point;
	            }*/
	            
		    }else if(path.name == "mirror" || path.name == "len"){
		        if(selectionRectangle && !path.parent.children["selection rectangle"]) selectionRectangle.remove();
		        var b = path.bounds.clone().expand(10, 10);

                selectionRectangle = new Path.Rectangle(b);
                selectionRectangle.pivot = selectionRectangle.position;
                selectionRectangle.insert(2, new Point(b.center.x, b.top));
                selectionRectangle.insert(2, new Point(b.center.x, b.top-25));
                selectionRectangle.insert(2, new Point(b.center.x, b.top));
                selectionRectangle.strokeWidth = 1;
                selectionRectangle.strokeColor = 'blue';
                selectionRectangle.fillColor = 'rgba(0, 0, 255, 0.1)';
                selectionRectangle.name = "selection rectangle";
                selectionRectangle.selected = true;
                
                path.parent.addChild(selectionRectangle);
		    }
		    
	    }else{
	        if(selectionRectangle != null) 
                selectionRectangle.remove();
	    }
	};
	
	view.onMouseDrag = (event) => {
	    var hitResult = project.hitTest(event.point, hitOptions);
        var path = hitResult ? hitResult.item : null;
        
        if(dragged){
            if(selectionRectangle != null && dragged.name == "selection rectangle") 
                selectionRectangle.parent.position = event.point;
        }else if(path){
            if(selectionRectangle != null && path.name == "selection rectangle")
                dragged = path;
        }
	};
	
	view.onMouseUp = (event) => {
	      dragged = null;
	};

}

//
// MAIN
//
function main() {
    init();
    draw();

    //
	// ANIMATION
	//
	paper.view.onFrame = (event) => {
	    if(needsUpdate){
	        update();
	    }
    }
}

//
// RENDER
//
function update(){
    draw();
    
    // Compute light iteration times
    for(var i = 0; i < iteration; i++){
        rayCollision();
    }
    
    needsUpdate = false;
    //setTimeout(() => { needsUpdate = true; }, 500);
}


//
// DRAW
//
function draw(){
    
    rays.forEach((ray) => { ray.remove(); });
    rays = [];

	//createRay(16, canvas.height/3*2);
	createRay(16, canvas.height/3*2-15, "#FF0000", 2, 4);
	createRay(16, canvas.height/3*2+00, "#00FF00", 0, 4);
	createRay(16, canvas.height/3*2+15, "#0066FF", -2, 4);

}

//
// FUNCTIONS
//

function roundN(num){
    return Math.round(num * 100) / 100
}

/// ### createMirror
function createMirror(pos1X, pos1Y, pos2X, pos2Y){
    var group = new Group();
    var mirror = new Path();
    	
	mirror.strokeColor = '#aefeff';
	mirror.strokeWidth = 4;
	mirror.moveTo(pos1X, pos1Y);
	mirror.lineTo(pos2X, pos2Y);
	mirror.name = "mirror";
    
	mirrors.push(mirror);
	group.addChild(mirror);
}

/// ### createLen
function createLen(posX, posY, diopter=5, RI=1.6){
    var group = new Group();
    var len = new CompoundPath();
    
    var top = new Point(posX, posY-50);
    var bottom = new Point(posX, posY+50);
    var through1 = new Point(posX-15, posY);
    var through2 = new Point(posX+15, posY);
    
    var path1 = new Path.Arc(top, through1, bottom);
    var path2 = new Path.Arc(top, through2, bottom);
    
    len.addChild(path1);
    len.addChild(path2);
    
	len.strokeColor = '#729fcf';
	len.strokeWidth = 2;
	len.fillColor = '#aefeff';
	len.name = "len";
	len.data.RI = RI; // Refractive index // 1.60 Flint glass (pure)
	len.data.D = diopter;
    
    lens.push(len);
	group.addChild(len);
}

/// ### createRay
function createRay(posX, posY, color="white", angle=0, lightness=2){
	// Create a Paper.js Path to draw a line into it:
	var ray = new Path();
	// Give the stroke a color
	ray.strokeColor = color;
	ray.strokeWidth = 2;
	ray.strokeCap = 'butt';
	ray.strokeJoin = 'bevel';
	ray.shadowColor = color;
	ray.shadowBlur = lightness;
	var start = new Point(posX, posY);
	// Move to start and draw a line from there
	ray.moveTo(start);
	// Note that the plus operator on Point objects does not work
	// in JavaScript. Instead, we need to call the add() function:
	ray.lineTo(start.add([ canvas.width*2, 0 ]).rotate(angle));
	
	rays.push(ray);
}

// ## Internals
function rayCollision(){
    rays.forEach((ray) => {
        var closestCollision;
        var closest;
    
        mirrors.forEach((mirror) => {
            var intersections = ray.getIntersections(mirror);
            
            if(intersections.length > 0){
                var i = intersections.length-1;
                var end = false;
                
                ray.segments.forEach((segment) => {
                    if(intersections[i].point.toString() == segment.point.toString()){
                        end = true;
                        return;
                    }
                });
                if(end) return;

                var vector = intersections[i].point.subtract(ray.segments[ray.segments.length-2].point);

                if(vector.length < closest || closest == null){
                    closest = vector.length;
                    closestCollision = mirror;
                }
            }
        });
        
        lens.forEach((len) => {
            var intersections = ray.getIntersections(len);
        
            if(intersections.length > 0){
                var i = intersections.length-1;
                var end = false;
                
                ray.segments.forEach((segment) => {
                    if(intersections[i].point.toString() == segment.point.toString()){
                        end = true;
                        return;
                    }
                });
                if(end) return;

                var vector = intersections[i].point.subtract(ray.segments[ray.segments.length-2].point);

                if(vector.length < closest || closest == null){
                    closest = vector.length;
                    closestCollision = len;
                }
            }
        });
        
        if(closestCollision){
            collision(ray, closestCollision);
        }
    });
}

function collision(ray, object){
    var end = new Point(canvas.width*2, 0);
        
    // do final calulation
    switch(object.name){
        case "mirror":
            var intersections = ray.getIntersections(object);
            var intersection = intersections[intersections.length-1];
            
            var probe = probeCollisionAngle(ray, object, intersection, 0);
            var castVector = probe[0];
            var vector = probe[1];
        
            calcMirrorCollision(ray, intersection, end, vector, castVector);
            break;
            
        case "len":
            calcLenCollision(ray, object, end);
            break;
    }
}

function probeCollisionAngle(ray, object, intersection, i=0){
    if(!intersection) return [new Point(0, 0), new Point(0, 0)];
    
    // prepare ray
    ray.removeSegment(ray.lastSegment.index);
    ray.lineTo(intersection.point);
    
    // find out the angle of mirror
    var cast1 = new Path();
    var end1 = new Point(canvas.width, 0.00001);

    cast1.moveTo(ray.segments[ray.segments.length-2].point);
    cast1.lineTo(intersection.point.add(end1));
    
    var castIntersections = cast1.getIntersections(object);
    var collision1 = (castIntersections.length > 0 ? castIntersections[0].point : new Point(0, 0));

    var castVector = collision1.subtract(intersection.point);
    var vector = ray.segments[ray.segments.length-2].point.subtract(ray.lastSegment.point);

    cast1.remove();
    
    return [castVector, vector];
}


function calcMirrorCollision(ray, intersection, end, vector, castVector){
    //                                              -2 *  (    B       -     A     )
    ray.lineTo( intersection.point.add( end.rotate( -2*(roundN(vector.angle) - roundN(castVector.angle)) ) ) );
}

function calcLenCollision(ray, len, end){
    // bend ray on entrance
    var intersections = ray.getIntersections(len);
    var intersection = (intersections.length > 1 ? intersections[intersections.length-2] : null);
    if(!intersection) return;
    var probe = probeCollisionAngle(ray, len, intersection);
    var castVector = probe[0]; // A
    var vector = probe[1]; // B
    
    var normal = ((0.5 * Math.PI) + castVector.angleInRadians);
    var angle = ((vector.angleInRadians) - normal);
    var angle2 = roundN(((normal - Math.PI)) - Math.asin((enviroment.RI * Math.sin(angle)) / len.data.RI));
    
    ray.lineTo( intersection.point.add( end.rotate( angle2 * (180 / Math.PI) ) ) ); 
    console.log((normal - Math.PI) * (180 / Math.PI))
    
    // bend ray on leaving
    /*var intersections = ray.getIntersections(len);
    var intersection = (intersections.length > 1 ? intersections[intersections.length-1] : null);
    if(!intersection) return;
    var probe = probeCollisionAngle(ray, len, intersection, 1);
    var castVector = probe[0];
    var vector = probe[1];
    
    var normal = ((0.5 * Math.PI) + castVector.angleInRadians);
    var angle = ((vector.angleInRadians) - normal);
    var angle2 = roundN(Math.asin((len.data.RI * Math.sin(angle)) / enviroment.RI) + (normal - Math.PI));
    
    /*ray.removeSegment(ray.lastSegment.index);
    ray.lineTo(intersection.point);
    console.log((len.data.RI * Math.sin(angle)) / enviroment.RI)
    
    ray.lineTo( intersection.point.add( end.rotate( angle2 * (180 / Math.PI) ) ) );*/
    
}



