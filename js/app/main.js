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
            tolerance: 5
        },
        enviroment: {
            RI: 1,
            color: "#00111f",
        },
        iteration: 25,
        fps: 25,
        debug: true,
        autoUpdate: true,
        precision: 2,
        anglePrecision: 0,
        rayLength: 1000
    },
    
    materialRI: {
        vacuum:     1.00,
        air:        1.00,
        helium:     1.00,
        hydrogen:   1.00,
        ice:        1.31,
        water:      1.33,
        ethanol:    1.36,
        glass:      1.52,
        flintglass: 1.62,
        diamond:    2.42
    },

    debug: function(x,y,content) {
        const text = new PointText(new Point(x, y));
        this.debugs.push(text);
        text.justification = 'center';
        text.fillColor = '#ddd';
        text.content = content;
    },

    updateConfig: function(data) {
        this.config = Object.assign(this.config, data);
        $(canvas).css("backgroundColor", this.config.enviroment.color)
        $(canvas).trigger("changed");
    },

    registerEvents: function() {
        const formSlctr = "#config, #config-sm";
        
        $(formSlctr).on('change input', function() {
            let data = $(this).serializeArray()
                // fix checkboxes 
                .concat(jQuery('input[type=checkbox]:not(:checked)', formSlctr).map(
                    function() {
                        return {"name": this.name, "value": false}
                    }).get()
                // process
                ).reduce(function(obj, item) {
                    obj[item.name] = item.value;
                    return obj;
            }, {});

            App.updateConfig(data);
        }).trigger('change');
        
        $("#enviromentConfig").on('change input', function() {
            let data = $(this).serializeArray()
                // fix checkboxes 
                .concat(jQuery('input[type=checkbox]:not(:checked)', formSlctr).map(
                    function() {
                        return {"name": this.name, "value": false}
                    }).get()
                // process
                ).reduce(function(obj, item) {
                    obj[item.name] = item.value;
                    return obj;
            }, {});
            
            App.updateConfig({enviroment: data});
        }).trigger('change');
        
        $(canvas).on("changed", () => {
            if(App.config.autoUpdate){
                App.needsUpdate = true;
            }
        });
    },

    init: function() {
        this.registerEvents();

        this.canvas.width = $(window).width();
        this.canvas.height = $(window).height();

        $(this.canvas).css("backgroundColor", this.config.enviroment.color);

        // Create an empty project and a view for the canvas:
        paper.setup(this.canvas);
        
        // Prepare toolbar config
        $(".matSelect").html(() => {
            let html = "";
            Object.keys(this.materialRI).forEach((mat) => {
                html += "<option value="+mat+" class='trn' data-trn="+mat+"></option>"
            });
            return html;
        });
        $(document).trigger("translate");

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
            LightSource.create(new Point(100, 100), 0, {
                color: "#FF0000",
                lightness: 4
            }),
            LightSource.create(new Point(this.canvas.width - 100, 100), 150, {
                color: "#0000FF",
                lightness: 4
            })
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
                    this.createObjOptions();
                }
            }else{
                if(this.selectionRectangle !== null)
                    this.selectionRectangle.remove();
                    this.selectionRectangle = null;
                    this.createObjOptions();
            }
        };

        view.onMouseDrag = (event) => {
            let hitResult = project.hitTest(event.point, this.config.hitOptions);
            let path = hitResult ? hitResult.item : null;

            if(this.dragged && (this.selectionRectangle !== null && this.dragged.name === "selection rectangle")){
                let obj = this.selectionRectangle.parent;
                let center = obj.children["mesh"].bounds.center;
                
                if(this.rotating){//rotate
                    let angle = obj.bounds.center.subtract(this.rotating).getDirectedAngle(obj.bounds.center.subtract(event.point));
                    obj.rotate(angle, center);
                    this.rotating = event.point;

                }else if(this.scaling){//scale
                    obj.scale((event.point.subtract(obj.bounds.center).length - this.scaling.subtract(obj.bounds.center).length) / 100 + 1, center);
                    console.log(event.point.subtract(obj.bounds.center).length - this.scaling.subtract(obj.bounds.center).length)
                    this.scaling = event.point;

                }else{//drag
                    obj.position = event.point;
                }
                $(canvas).trigger("changed");

            }else if(path && this.selectionRectangle !== null && path.name === "selection rectangle"){
                this.dragged = path;

                if(hitResult.type === 'segment' && this.selectionRectangle !== null && path.name === "selection rectangle"){
                    if(hitResult.segment.index >= 2 && hitResult.segment.index <= 4){
                        // rotation
                        this.rotating = {point: event.point, last: 0};
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
        //if(this.config.autoUpdate) setTimeout(() => { App.needsUpdate = true; }, 1000 / App.config.fps);
    },

    draw: function(){
        this.debugs.forEach((debug) => { debug.remove() });

        this.rays.forEach((ray) => { ray.remove(); });
        this.rays = [];

        //createRay(16, canvas.height/3*2);
        this.sources.forEach((source) => {
            this.rays.push(source.fire())
        });
    },
    
    createObjOptions: function(){
        const emptyMsg = $("#objEmptyMsg");
        const form = $("#objectConfig");
        
        if(this.selectionRectangle !== null){

            let obj = this.selectionRectangle.parent;
            let mesh = obj.children["mesh"];
            let type = mesh.data.type;
            let isRay = type === "ray";
            let isMirror = type === "mirror";
            let isLen = type === "len";
            
            
            emptyMsg.hide();
            form.show();
            
            $("#objTypeH").show();
            $("#objType").attr("data-trn", type);
            form.find("input").val(0);
            
            form.children(".onlyRay").toggle(isRay);
            form.children(".onlyMirror").toggle(isMirror);
            form.children(".onlyLen").toggle(isLen);
            
            if(isRay){
                form.find("input[name='color']").val(obj.config.color);
            }else if(isLen){
                let RI = getKeyByValue(this.materialRI, obj.config.RI);
            }
            
            // Remove previous handlers
            form.find("input").off("change input");
            
            // Add new handlers
            form.find("input[name='color']").on("change input", (ev) => {
                console.log(ev)
                obj.config.color = mesh.fillColor = $(ev.target).val();
                $(canvas).trigger("changed");
            });
            
            $(document).trigger("translate");
            
        }else{
            
            emptyMsg.show();
            $("#objTypeH").hide();
            form.hide();
            
        }
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

                if(vector.length > 1 / (10 * App.config.precision) && (vector.length < closest || closest == null)){
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
        switch(object.data.type){
            case "mirror":
                let intersections = ray.getIntersections(object);
                let intersection = intersections[intersections.length-1];

                let reflectionAngle = Angle.calculateAbsoluteReflectionAngleForObjects(ray, object, intersection.point);
                // console.log(reflectionAngle);
// console.log(intersection.point, ray.angle, reflectionAngle);
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
        this.sources.push(LightSource.create(new Point(x1, y1), 0, {
                color: "#FFFFFF",
                lightness: 4
            }));
    },

    normalizeCoords: function(point) {
        point.x = round(point.x, this.config.precision);
        point.y = round(point.y, this.config.precision);
        return point;
    },

    normalizeAngle: function(angle) {
        return round(angle % 360, this.config.anglePrecision);
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

        return Math.degrees(Math.asin(b/c));
    },

    /**
     * Returns absolute angle of reflection for two objects and point of intersection (tilt angle to X axis)
     *
     * @param Ray o1
     * @param Mirror o2
     * @param Point intersectionPoint
     * @returns 0-360 degree
     */
    calculateAbsoluteReflectionAngleForObjects: function(o1, o2, intersectionPoint) {
        v1 = o1.getVector(intersectionPoint);
        v2 = o2.getPerpendicularVector().multiply(-1).normalize();

        // r=d−2(d⋅n)n, n normalized
        vr = v1.subtract(v2.multiply(v1.dot(v2) * 2));

        // this theoretically variable that should determine on which side of mirror the ray start is, although i doubt if it works + it doesnt seem to be needed
        // d = (o1.point.start.x - o2.getX2()) * (o2.getY2() - o2.getY1()) - (o1.point.start.y - o2.getY1()) * (o2.getX2() - o2.getX1());

        return vr.angle;
    }
};

function round(number, precision) {
    let factor = Math.pow(10, precision);
    let tempNumber = number * factor;
    let roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
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
