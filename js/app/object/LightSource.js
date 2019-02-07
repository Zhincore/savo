class LightSource extends Group {
    constructor(x, y, color, angle, lightness, size=20){
        super();

        //correcting variables
        x = round(x, App.config.precision);
        y = round(y, App.config.precision);
        angle = round(angle % 360, App.config.precision);

        this.angle = angle;
        this.size = size;
        this.object = undefined;

        this.point = {
            start: new Point(x, y),
            end: {x: undefined, y: undefined}
        }

        this.config = {
            color: color,
            lightness: lightness
        }
    }

    static create(x, y, color, angle, lightness, size=20) {
        let lightSource = new this(x, y, color, angle, lightness, size);
        let sourceObject = new Path.Rectangle(lightSource.point.start.subtract(new Point(size/2, size/2)), lightSource.size);
        sourceObject.fillColor = color;
        sourceObject.shadowColor = color;
        sourceObject.shadowBlur = lightness;
        sourceObject.data.movable = true;

        sourceObject.rotate(lightSource.angle);
        lightSource.addChild(sourceObject);
        lightSource.object = sourceObject;

        return lightSource;
    }

    fire() {
        this.update();
        let lightRay = Ray.create(this.point.start.x, this.point.start.y, this.config.color, this.angle, this.config.lightness);
        return lightRay;
    }

    update() {
        this.point.start = this.object.position;
    }

    rotate(angle){
        this.angle += angle;
        super.rotate(angle, this.object.position);
    }
}
