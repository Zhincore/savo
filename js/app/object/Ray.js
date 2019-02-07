class Ray extends Path {
    constructor(x, y, color, angle, lightness) {
        super();

        //correcting variables
        x = round(x, App.config.precision);
        y = round(y, App.config.precision);
        angle = round(angle % 360, App.config.anglePrecision);

        this.angle = angle;

        this.point = {
            start: new Point(x, y),
            end: undefined
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
        ray.sendToBack();

        let start = new Point(ray.point.start.x, ray.point.start.y);
        ray.moveTo(start);
        ray.lineTo(start.clone().add([ App.config.rayLength, 0 ]).rotate(ray.angle, start));

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
        this.point.end = new Point(x, y);

        this.lineTo(x, y);
    }

    getVector(toPoint) {
        return toPoint.subtract(this.point.start);
    }
}
