class Ray extends Path {
    constructor(position, angle = 0, config) {
        super();

        //correcting variables


        this.angle = App.normalizeAngle(angle);

        this.point = {
            start: App.normalizeCoords(position),
            end: undefined
        };

        this.config = Object.assign({
            color: '#fff',
            lightness: 4,
            power: App.config.rayLength
        }, config);

        console.log(this.config);

        if(App.config.debug) {
            App.debug(this.point.start.x, this.point.start.y - 30,`(x: ${this.point.start.x}, y: ${this.point.start.y}, ${this.angle}°)`);
        }
    }

    static create(position, angle, config = {}) {
        const ray = new this(position, angle, config);

        ray.strokeColor = ray.config.color;
        ray.strokeWidth = 1;
        ray.strokeCap = 'butt';
        ray.strokeJoin = 'bevel';
        ray.shadowColor = ray.config.color;
        ray.shadowBlur = ray.config.lightness;
        ray.blendMode = "screen";
        ray.sendToBack();

        ray.moveTo(ray.point.start);
        ray.lineTo(ray.point.start.add([ ray.config.power, 0 ]).rotate(ray.angle, ray.point.start));

        return ray;
    }

    reflectOnPoint(point, angle) {
        this.endOnPoint(point);

        return Ray.create(point, angle, Object.assign(this.config, {
            power: this.getRemainingPower()
        }));
    }

    endOnPoint(point) {
        this.endOnCoors(point.x, point.y);
    }

    endOnCoors(x, y) {
        this.removeSegment(this.lastSegment.index);
        this.point.end = App.normalizeCoords(new Point(x, y));

        this.lineTo(this.point.end.x, this.point.end.y);
    }

    getVector(toPoint) {
        return toPoint.subtract(this.point.start);
    }

    getRemainingPower() {
        return round(this.config.power - this.length, App.config.precision);
    }
}
