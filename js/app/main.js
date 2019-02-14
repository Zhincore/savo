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
            RI: 1.0,
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
        text.rotation = -30;
    },

    updateConfig: function(data) {
        this.config = Object.assign(this.config, data);
        $(canvas).css("backgroundColor", this.config.enviroment.color)
        $(canvas).trigger("changed");
    },

    updateConfig: function(data) {
        this.config = Object.assign(this.config, data);
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
            Mirror.create(new Point(400, 300), new Point(300, 300)),
            // Mirror.create(new Point(400, 310), new Point(500, 310)),
            // Mirror.create(new Point(400, 320), new Point(500, 320)),
            //
            // //vertical mirrors
            // Mirror.create(new Point(400, 400), new Point(400, 500)),
            // Mirror.create(new Point(410, 400), new Point(410, 500)),
            //
            // //45* angled
            // Mirror.create(new Point(400, 400), new Point(500, 500)),
            // Mirror.create(new Point(500, 400), new Point(400, 500)),
            // Mirror.create(new Point(400, 400), new Point(500, 500)),
            // Mirror.create(new Point(500, 400), new Point(400, 500)),
            // Len.create(new Point(200, 200), 60, 60),
            // Len.create(new Point(400, 400), 120, 120),
            Len.create(new Point(500, 150), 180, 90),
            Len.create(new Point(350, 300), 50, 120),
            // Len.create(new Point(200, 350), 70, 60)
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

            if(this.selectionRectangle) {
                if(typeof this.selectionRectangle.parent.children['mesh'].onUnfocus === 'function') {
                    this.selectionRectangle.parent.children['mesh'].onUnfocus();
                }
            }

            if (hitResult) {
                let path = hitResult.item;

                if(path.data.movable === true){
                    console.log(path);

                    if(this.selectionRectangle && !path.parent.children["selection rectangle"]) {
                        this.selectionRectangle.remove();
                    }
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

                    if(typeof this.selectionRectangle.parent.children['mesh'].onFocus === 'function') {
                        this.selectionRectangle.parent.children['mesh'].onFocus();
                    }
                }
            }else{
                if(this.selectionRectangle !== null) {
                    this.selectionRectangle.remove();
                    this.selectionRectangle = null;
                    this.createObjOptions();
                }
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
        let intersections = ray.getIntersections(object);
        let intersection = intersections[0];

        // do final calulation
        switch(object.data.type){
            case "mirror":
                let reflectionAngle = Angle.calculateAbsoluteReflectionAngleForObjects(ray, object, intersection.point);
                this.rays.push(ray.continueFromPoint(intersection.point, reflectionAngle));

                break;
            case "len":
                let eta = Angle.getEta(ray.config.RI, object.config.RI);
                let refractedRayRI = object.config.RI;
                if(ray.isInside(object)) {
                    eta = Angle.getEta(object.config.RI, App.config.enviroment.RI);
                    refractedRayRI = App.config.enviroment.RI;
                }

                // console.log(eta, object.config.RI, App.config.enviroment.RI, ray.config.RI);

                let refractionAngle = Angle.calculateAbsoluteRefractionAngleForObjects(ray, object, intersection.point, eta);

                //todo maybe put it somewhere else
                let enteredObjects = ray.getEnteredObjects();
                if(!ray.isInside(object)) {
                    enteredObjects.push(object.getId());
                } else {
                    let indexOfObj = enteredObjects.indexOf(object.getId());
                    enteredObjects.splice(indexOfObj);
                }

                let refractedRay = ray.continueFromPoint(intersection.point, refractionAngle);
                refractedRay.config.RI = refractedRayRI;

                refractedRay.enteredObjects = enteredObjects;

                this.rays.push(refractedRay);

                break;
        }
    },

    addMirror: function(x1, y1, x2, y2) {
        this.objects.push(Mirror.create(new Point(x1, y1), new Point(x2, y2)));
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
        this.assert(45, Angle.calculateFor2Points(new Point(0, 0), new Point(10, 10)));
        this.assert(30, Angle.calculateFor2Points(new Point(0, 0), new Point(4.3301, 2.5)));
        this.assert(26.5650, Angle.calculateFor2Points(new Point(0, 0), new Point(6, 3)));
        this.assert(14.6208, Angle.calculateFor2Points(new Point(0, 0), new Point(23, 6)));
    },
}

function round(number, precision) {
    let factor = Math.pow(10, precision);
    let tempNumber = number * factor;
    let roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}
