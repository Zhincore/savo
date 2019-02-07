const App = {
    canvas: document.querySelector("#canvas"),
    ctx: this.canvas.getContext('2d'),
    needsUpdate: true,

    rays: [],
    sources: [],
    objects: [],
    debugs: [],

    selectionRectangle: null,
    dragged: null,
    rotating: false,
    scaling: false,

    config: {
        hitOptions: {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 10
        },
        environment: {
            RI: 1,
        },
        iteration: 25,
        fps: 25,
        debug: true,
        precision: 2
    },

    debug: function(x,y,content) {
        const text = new PointText(new Point(x, y));
        this.debugs.push(text);
        text.justification = 'center';
        text.fillColor = '#ddd';
        text.content = content;
    },

    init: function() {
        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();

        $(this.canvas).css("backgroundColor", "#00111f");

        // Create an empty project and a view for the canvas:
        paper.setup(this.canvas);

        this.objects.push(
            // Mirror.create(600, 600, 700, 800),
            // Mirror.create(600, 650, 800, 750),
            // Mirror.create(600, 650, 800, 750),
            // Mirror.create(this.canvas.width/3*2, this.canvas.height/3*2 - 25, this.canvas.width/3*2-25, this.canvas.height/3*2 + 75),
            // Mirror.create(this.canvas.width/3*2-100, this.canvas.height/3*2 - 120, this.canvas.width/3*2-100-25, this.canvas.height/3*2 - 20),

            //horizontal mirrors
            Mirror.create(400, 300, 500, 300),
            Mirror.create(400, 310, 500, 310),
            Mirror.create(400, 320, 500, 320),

            //vertical mirrors
            Mirror.create(400, 400, 400, 500),
            Mirror.create(410, 400, 410, 500),

            //45* angled
            Mirror.create(400, 400, 500, 500),
            Mirror.create(500, 400, 400, 500),
            Mirror.create(400, 400, 500, 500),
            Mirror.create(500, 400, 400, 500)
        );
        //createLen(canvas.width/3*2, canvas.height/3*2);

        this.sources.push(
            LightSource.create(100, 100, "#F00", 0, 4),
            LightSource.create(this.canvas.width - 100, 100, "#00F", 150, 4)
        );

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

                if(path.data.movable === true){
                    console.log(path);

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

            if(this.dragged && (this.selectionRectangle !== null && this.dragged.name === "selection rectangle")){
                if(this.rotating){//rotate
                    this.selectionRectangle.parent.rotate(event.point.x - this.rotating.x);
                    this.rotating = event.point;

                }else if(this.scaling){//scale
                    this.selectionRectangle.parent.scaling.set(this.selectionRectangle.parent.scaling.x + ((event.point.x - this.scaling.x) / 100));
                    this.scaling = event.point;

                }else{//drag
                    this.selectionRectangle.parent.position = event.point;
                }

            }else if(path && this.selectionRectangle !== null && path.name === "selection rectangle"){
                this.dragged = path;

                if(hitResult.type === 'segment' && this.selectionRectangle !== null && path.name === "selection rectangle"){
                    if(hitResult.segment.index >= 2 && hitResult.segment.index <= 4){
                        // rotation
                        this.rotating = event.point;
                    }else{
                        // scaling
                        this.scaling = event.point;
                    }

                }
            }
        };

        view.onMouseUp = (event) => {
            this.dragged = this.rotating = this.scaling = null;
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
                if(ray.point.end === undefined) {
                    App.calculateRay(ray);
                }
            });
        }

        this.needsUpdate = false;
        setTimeout(() => { App.needsUpdate = true; }, 1000 / App.config.fps);
    },

    draw: function(){
        if(this.config.debug) {
            this.debugs.forEach((debug) => { debug.remove() });
        }

        this.rays.forEach((ray) => { ray.remove(); });
        this.rays = [];

        //createRay(16, canvas.height/3*2);
        this.sources.forEach((source) => {
            this.rays.push(source.fire())
        });
    },

    calculateRay: function(ray) {
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

                let reflectionAngle = Angle.calculateAbsoluteAngleForObjects(ray, object, intersection.point);
                // console.log(reflectionAngle);
// console.log(intersection.point, ray.angle, reflectionAngle);
                //                                                        180 reflect + reflection angle
                this.rays.push(ray.reflectOnPoint(intersection.point, reflectionAngle));
                break;
            case "len":
                calcLenCollision(ray, object, end);
                break;
        }
    },

    addMirror: function(x1, y1, x2, y2) {
        this.objects.push(Mirror.create(x1, y1, x2, y2));
    },

    addRay: function(x1, y1) {
        this.sources.push(LightSource.create(x1, y1, "#FFF", 0, 4));
    }
};

$(document).ready(() => {
    App.init();
});

/* Functions, extensions and overrides */

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

const testSuite = {
    run: function() {
        this.Angle_calculateForTwoPoints();
    },

    assert(expected, actual) {
        console.log(expected === actual, expected, actual);
    },

    Angle_calculateForTwoPoints: function() {
        this.assert(45, Angle.calculateFor2Points(0, 0, 10, 10));
        this.assert(30, Angle.calculateFor2Points(0, 0, 4.3301, 2.5));
        this.assert(26.5650, Angle.calculateFor2Points(0, 0, 6, 3));
        this.assert(14.6208, Angle.calculateFor2Points(0, 0, 23, 6));
    },
}

const Angle = {
    calculateFor2Points: function (x1, y1, x2, y2) {
        let q = 0;

        let a = Math.abs(x2 - x1);
        let b = Math.abs(y2 - y1);
        let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

        return round(Math.degrees(Math.asin(b/c)), 4);
    },

    /**
     * Returns absolute angle of reflection for two objects and point of intersection (tilt angle to X axis)
     *
     * @param Ray o1
     * @param Mirror o2
     * @param Point intersectionPoint
     * @returns 0-360 degree
     */
    calculateAbsoluteAngleForObjects: function(o1, o2, intersectionPoint) {
        v1 = o1.getVector(intersectionPoint);
        v2 = o2.getPerpendicularVector().multiply(-1).normalize();

        // r=d−2(d⋅n)n, n normalized
        vr = v1.subtract(v2.multiply(v1.dot(v2) * 2));
        angleOfReflection = round(vr.angle, App.config.precision);

        // this theoretically variable that should determine on which side of mirror the ray start is, although i doubt if it works + it doesnt seem to be needed
        // d = (o1.point.start.x - o2.getX2()) * (o2.getY2() - o2.getY1()) - (o1.point.start.y - o2.getY1()) * (o2.getX2() - o2.getX1());

        return angleOfReflection;
    }
};

function round(number, precision) {
    let factor = Math.pow(10, precision);
    let tempNumber = number * factor;
    let roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}

/// ### createLen
// function createLen(posX, posY, diopter=5, RI=1.6){
//     var group = new Group();
//     var len = new CompoundPath();
//
//     var top = new Point(posX, posY-50);
//     var bottom = new Point(posX, posY+50);
//     var through1 = new Point(posX-15, posY);
//     var through2 = new Point(posX+15, posY);
//
//     var path1 = new Path.Arc(top, through1, bottom);
//     var path2 = new Path.Arc(top, through2, bottom);
//
//     len.addChild(path1);
//     len.addChild(path2);
//
//     len.strokeColor = '#729fcf';
//     len.strokeWidth = 2;
//     len.fillColor = '#aefeff';
//     len.name = "len";
//     len.data.RI = RI; // Refractive index // 1.60 Flint glass (pure)
//     len.data.D = diopter;
//
//     App.objects.push(len);
//     group.addChild(len);
// }

// function probeCollisionAngle(ray, object, intersection, i=0){
//     if(!intersection) return [new Point(0, 0), new Point(0, 0)];
//
//     // prepare ray
//     ray.removeSegment(ray.lastSegment.index);
//     ray.lineTo(intersection.point);
//
//     // find out the angle of mirror
//     var cast1 = new Path();
//     var end1 = new Point(canvas.width, 0.00001);
//
//     cast1.moveTo(ray.segments[ray.segments.length-2].point);
//     cast1.lineTo(intersection.point.add(end1));
//
//     var castIntersections = cast1.getIntersections(object);
//     var collision1 = (castIntersections.length > 0 ? castIntersections[0].point : new Point(0, 0));
//
//     var castVector = collision1.subtract(intersection.point);
//     var vector = ray.segments[ray.segments.length-2].point.subtract(ray.lastSegment.point);
//
//     cast1.remove();
//
//     return [castVector, vector];
// }

// function calcLenCollision(ray, len, end){
//     // bend ray on entrance
//     var intersections = ray.getIntersections(len);
//     var intersection = (intersections.length > 1 ? intersections[intersections.length-2] : null);
//     if(!intersection) return;
//     var probe = probeCollisionAngle(ray, len, intersection);
//     var castVector = probe[0]; // A
//     var vector = probe[1]; // B
//
//     var normal = ((0.5 * Math.PI) + castVector.angleInRadians);
//     var angle = ((vector.angleInRadians) - normal);
//     var angle2 = roundN(((normal - Math.PI)) - Math.asin((enviroment.RI * Math.sin(angle)) / len.data.RI));
//
//     ray.lineTo( intersection.point.add( end.rotate( angle2 * (180 / Math.PI) ) ) );
//     console.log((normal - Math.PI) * (180 / Math.PI))
//
//     // bend ray on leaving
//     /*var intersections = ray.getIntersections(len);
//     var intersection = (intersections.length > 1 ? intersections[intersections.length-1] : null);
//     if(!intersection) return;
//     var probe = probeCollisionAngle(ray, len, intersection, 1);
//     var castVector = probe[0];
//     var vector = probe[1];
//
//     var normal = ((0.5 * Math.PI) + castVector.angleInRadians);
//     var angle = ((vector.angleInRadians) - normal);
//     var angle2 = roundN(Math.asin((len.data.RI * Math.sin(angle)) / enviroment.RI) + (normal - Math.PI));
//
//     /*ray.removeSegment(ray.lastSegment.index);
//     ray.lineTo(intersection.point);
//     console.log((len.data.RI * Math.sin(angle)) / enviroment.RI)
//
//     ray.lineTo( intersection.point.add( end.rotate( angle2 * (180 / Math.PI) ) ) );*/
//
// }