paper.install(window);

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

class Ray extends Path {
    constructor(x, y, color, angle, lightness) {
        super();

        //correcting variables
        x = round(x, App.config.precision);
        y = round(y, App.config.precision);
        angle = round(angle % 360, App.config.precision);

        this.angle = angle;

        this.point = {
            start: {x: x, y: y},
            end: {x: undefined, y: undefined}
        }

        this.config = {
            color: color,
            lightness: lightness
        }

        if(App.config.debug) {
            App.debug(x,y - 30,`(x: ${x}, y: ${y}, ${angle}°)`);
        }
    }

    static create(x, y, color="white", angle=0, lightness=2) {
        const ray = new this(x, y, color, angle, lightness);

        ray.strokeColor = color;
        ray.strokeWidth = 2;
        ray.strokeCap = 'butt';
        ray.strokeJoin = 'bevel';
        ray.shadowColor = color;
        ray.shadowBlur = lightness;

        let start = new Point(ray.point.start.x, ray.point.start.y);
        ray.moveTo(start);
        ray.lineTo(start.add([ App.canvas.width*5, 0 ]).rotate(ray.angle));

        return ray;
    }
    reflectOnPoint(point, angle) {
        this.endOnPoint(point);

        return Ray.create(point.x, point.y, this.config.color, angle, this.lightness);
    }

    endOnPoint(point) {
        this.endOnCoors(point.x, point.y);
    }

    endOnCoors(x, y) {
        this.removeSegment(this.lastSegment.index);
        this.point.end.x = x;
        this.point.end.y = y;

        this.lineTo(x, y);
    }
}

class Mirror extends Path {
    constructor(x1, y1, x2, y2) {
        super();

        this.angle = Angle.calculateFor2Points(x1, y1, x2, y2);

        this.point = {
            start: {x: x1, y: y1},
            end: {x: x2, y: y2}
        }
    }

    static create(x1, y1, x2, y2) {
        let group = new Group();
        let mirror = new this(x1, y1, x2, y2);

        mirror.strokeColor = '#aefeff';
        mirror.strokeWidth = 4;
        mirror.moveTo(x1, y1);
        mirror.lineTo(x2, y2);
        mirror.name = "mirror";

        group.addChild(mirror);
        return mirror;
    }
}

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

    calculateReflectionAngle: function(alfa, beta) {
        // return 2 * beta - alfa;
        return beta + 90 - alfa;
    },

    calculateReflectionAngleForObjects: function(o1, o2, intersectionPoint) {
        let m1 = o1.point.start.x > intersectionPoint.x
             ? (intersectionPoint.y - o1.point.start.y) / (intersectionPoint.x - o1.point.start.x)
             : (o1.point.start.y - intersectionPoint.y) / (o1.point.start.x - intersectionPoint.x)
        ;
        if((o2.point.start.x == o2.point.end.x) || false) {
            m2 = 1;
        } else {
            m2 = o2.point.start.x > o2.point.end.x
                ? (o2.point.end.y - o2.point.start.y) / (o2.point.end.x - o2.point.start.x)
                : (o2.point.start.y - o2.point.end.y) / (o2.point.start.x - o2.point.end.x)
            ;
        }
        let o2perpslope = -1 * m2;

        /**
         var dAx = A2x - A1x;
         var dAy = A2y - A1y;
         var dBx = B2x - B1x;
         var dBy = B2y - B1y;
         var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
         if(angle < 0) {angle = angle * -1;}
         var degree_angle = angle * (180 / Math.PI);
         */

        // if(intersectionPoint.x > o1.point.start.x) {
        //     var dAx = intersectionPoint.x - o1.point.start.x;
        //     var dAy = intersectionPoint.y - o1.point.start.y;
        // } else {
        //     var dAx = o1.point.start.x - intersectionPoint.x;
        //     var dAy = o1.point.start.y - intersectionPoint.y;
        // }
        //
        // if(o2.point.end.x > o2.point.start.x) {
        //     var dBx = o2.point.end.x - o2.point.start.x;
        //     var dBy = o2.point.end.y - o2.point.end.x;
        // } else {
        //     var dBx = o2.point.start.x - o2.point.end.x;
        //     var dBy = o2.point.end.x - o2.point.end.y;
        // }
        // var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
        // if(angle < 0) {angle = angle * -1;}
        // var degree_angle = Math.degrees(angle);

        /**
         *
if(m1*m2==-1){
angle = Math.PI/2
}else{
angle = Math.atan((m1-m2)/(1+m1*m2))
}
         */
        if(m1*m2==-1){
            angle = Math.degrees(Math.PI/2);
        }else{
            angle = Math.degrees(Math.atan((m1-m2)/(1+m1*m2)));
        }

        console.log(m1, m2, angle, round(angle, 0), (90 - round(angle, 0)) * 2);
        return (90 - round(angle, 0)) * 2;

        // angleBetweenSlopes = Math.degrees(Math.PI - Math.abs(Math.atan(o1slope) - Math.atan(o2slope)));
        // console.log(angleBetweenSlopes);
        let angleBetweenSlopes = Math.degrees(Math.atan((o1slope - o2slope) / (1 - o1slope * o2slope)));
        // console.log(angleBetweenSlopes);
        // angleBetweenSlopes = Math.atan2(o1.point.start.y - intersectionPoint.y, o1.point.start.x - intersectionPoint.x)
            - Math.atan2(o2.point.start.y - intersectionPoint.y, o2.point.start.x - intersectionPoint.x);
        // console.log(angleBetweenSlopes);
        return (90 - angleBetweenSlopes) * 2;
        // return this.calculateReflectionAngle(o1.angle, o2.angle);
    }
};

function round(number, precision) {
    let factor = Math.pow(10, precision);
    let tempNumber = number * factor;
    let roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}

const App = {
    canvas: document.querySelector("#canvas"),
    ctx: this.canvas.getContext('2d'),
    needsUpdate: true,

    rays: [],
    objects: [],
    debugs: [],

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
            Mirror.create(600, 600, 700, 800),
            Mirror.create(600, 650, 800, 750),
            Mirror.create(600, 650, 800, 750),
            Mirror.create(this.canvas.width/3*2, this.canvas.height/3*2 - 25, this.canvas.width/3*2-25, this.canvas.height/3*2 + 75),
            Mirror.create(this.canvas.width/3*2-100, this.canvas.height/3*2 - 120, this.canvas.width/3*2-100-25, this.canvas.height/3*2 - 20),
            Mirror.create(400, 300, 500, 300),
            Mirror.create(400, 310, 500, 310),
            Mirror.create(400, 320, 500, 320),
            Mirror.create(400, 400, 400, 500),
            Mirror.create(410, 400, 410, 500)
        );
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
                if(ray.point.end.x === undefined) {
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
        this.rays.push(
            Ray.create(100, 100, "#F00", 30, 4),
            // Ray.create(16, this.canvas.height/3*2+00, "#0F0", 0, 4),
            // Ray.create(16, this.canvas.height/3*2+15, "#06F", -2, 4)
        );
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

                let reflectionAngle = Angle.calculateReflectionAngleForObjects(ray, object, intersection.point);
                // console.log(reflectionAngle);
// console.log(intersection.point, ray.angle, reflectionAngle);
                this.rays.push(ray.reflectOnPoint(intersection.point, ray.angle + 180 + reflectionAngle));
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



