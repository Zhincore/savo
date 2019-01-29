paper.install(window);

class Ray extends Path {
    static create(posX, posY, color="white", angle=0, lightness=2) {
        // Create a Paper.js Path to draw a line into it:
        const ray = new this();
        // Give the stroke a color
        ray.strokeColor = color;
        ray.strokeWidth = 2;
        ray.strokeCap = 'butt';
        ray.strokeJoin = 'bevel';
        ray.shadowColor = color;
        ray.shadowBlur = lightness;
        let start = new Point(posX, posY);
        // Move to start and draw a line from there
        ray.moveTo(start);
        // Note that the plus operator on Point objects does not work
        // in JavaScript. Instead, we need to call the add() function:
        ray.lineTo(start.add([ App.canvas.width*2, 0 ]).rotate(angle));

        return ray;
    }
}

const App = {
    canvas: document.querySelector("#canvas"),
    ctx: this.canvas.getContext('2d'),
    needsUpdate: true,

    rays: [],
    objects: [],

    selectionRectangle: null,
    dragged: null,

    config: {
        hitOptions: {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 5
        },
        environment: {
            RI: 1,
        },
        iteration: 2,
        fps: 1,
    },

    init: function() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();

        $(this.canvas).css("backgroundColor", "#00111f");

        // Create an empty project and a view for the canvas:
        paper.setup(this.canvas);

        createMirror(this.canvas.width/3*2, this.canvas.height/3*2 - 25, this.canvas.width/3*2-25, this.canvas.height/3*2 + 75);
        createMirror(this.canvas.width/3*2-100, this.canvas.height/3*2 - 120, this.canvas.width/3*2-100-25, this.canvas.height/3*2 - 20);
        //createLen(canvas.width/3*2, canvas.height/3*2);

        //
        // EVENTS
        //
        view.onResize = (event) => {
            update();
        };

        view.onMouseDown = (event) => {
            let hitResult = project.hitTest(event.point, this.config.hitOptions);

            if (hitResult) {
                let path = hitResult.item;

                if(this.selectionRectangle !== null && path.name === "selection rectangle"){
                    /*if (hitResult.type == 'fill'){
                        path.position = event.point;
                    }*/

                } else if(path.name === "mirror" || path.name === "len"){
                    if(this.selectionRectangle && !path.parent.children["selection rectangle"]) this.selectionRectangle.remove();
                    var b = path.bounds.clone().expand(10, 10);

                    this.selectionRectangle = new Path.Rectangle(b);
                    this.selectionRectangle.pivot = this.selectionRectangle.position;
                    this.selectionRectangle.insert(2, new Point(b.center.x, b.top));
                    this.selectionRectangle.insert(2, new Point(b.center.x, b.top-25));
                    this.selectionRectangle.insert(2, new Point(b.center.x, b.top));
                    this.selectionRectangle.strokeWidth = 1;
                    this.selectionRectangle.strokeColor = 'blue';
                    this.selectionRectangle.fillColor = 'rgba(0, 0, 255, 0.1)';
                    this.selectionRectangle.name = "selection rectangle";
                    this.selectionRectangle.selected = true;

                    path.parent.addChild(this.selectionRectangle);
                }
            }else{
                if(this.selectionRectangle !== null)
                    this.selectionRectangle.remove();
            }
        };

        view.onMouseDrag = (event) => {
            let hitResult = project.hitTest(event.point, this.config.hitOptions);
            let path = hitResult ? hitResult.item : null;

            if(this.dragged){
                if(this.selectionRectangle !== null && this.dragged.name === "selection rectangle")
                    this.selectionRectangle.parent.position = event.point;
            } else if(path){
                if(this.selectionRectangle !== null && path.name === "selection rectangle")
                    this.dragged = path;
            }
        };

        view.onMouseUp = (event) => {
            this.dragged = null;
        };

        //
        // ANIMATION
        //
        paper.view.onFrame = (event) => {
            if(App.needsUpdate){
                App.update();
            }
        }
    },

    update: function() {
        this.draw();

        // Compute light iteration times
        for(let i = 0; i < this.config.iteration; i++){
            this.rays.forEach((ray) => {
                App.drawRay(ray);
            });
        }

        this.needsUpdate = false;
        setTimeout(() => { App.needsUpdate = true; }, 1000 / App.config.fps);
    },

    draw: function(){
        this.rays.forEach((ray) => { ray.remove(); });
        this.rays = [];

        //createRay(16, canvas.height/3*2);
        this.rays.push(
            Ray.create(16, this.canvas.height/3*2-15, "#F00", 2, 4),
            Ray.create(16, this.canvas.height/3*2+00, "#0F0", 0, 4),
            Ray.create(16, this.canvas.height/3*2+15, "#06F", -2, 4)
        );
    },

    drawRay: function(ray) {
        let object = this.closestRayCollision(ray);
        if(object !== undefined) {
            this.collide(ray, object);
        }
    },

    closestRayCollision: function(ray) {
        let closestCollision;
        let closest;

        App.objects.forEach((mirror) => {
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

        return closestCollision;
    },

    collide: function(ray, object) {
        let end = new Point(App.canvas.width*2, 0);

        // do final calulation
        switch(object.name){
            case "mirror":
                let intersections = ray.getIntersections(object);
                let intersection = intersections[intersections.length-1];

                let probe = probeCollisionAngle(ray, object, intersection, 0);
                let castVector = probe[0];
                let vector = probe[1];

                ray.lineTo( intersection.point.add( end.rotate( -2*(roundN(vector.angle) - roundN(castVector.angle)) ) ) );
                break;
            case "len":
                calcLenCollision(ray, object, end);
                break;
        }
    }
};

$(document).ready(() => {
    App.init();
});

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

    App.objects.push(mirror);
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

    App.objects.push(len);
    group.addChild(len);
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



