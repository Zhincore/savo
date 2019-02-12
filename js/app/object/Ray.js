class Ray extends Path {
    static create(position, angle, config = {}) {
        const ray = new this(position, angle, config);

        ray.sendToBack();

        ray.moveTo(ray.point.start);
        ray.lineTo(ray.point.start.add([ ray.config.power, 0 ]).rotate(ray.angle, ray.point.start));
        ray.fixPositions();

        return ray;
    }

    constructor(position, angle = 0, config) {
        super();

        this.angle = App.normalizeAngle(angle);

        this.point = {
            start: App.normalizeCoords(position),
            end: undefined
        };

        this.config = Object.assign({
            color: '#fff',
            lightness: 4,
            power: App.config.rayLength,
            RI: App.materialRI.air,
        }, config);

        this.enteredObjects = [];

        if(App.config.debug) {
            App.debug(this.point.start.x, this.point.start.y - 30, `(x: ${this.point.start.x}, y: ${this.point.start.y}, ${this.angle}°)`);
        }

        //style
        this.strokeColor = this.config.color;
        this.strokeWidth = 1;
        this.strokeCap = 'butt';
        this.strokeJoin = 'bevel';
        this.shadowColor = this.config.color;
        this.shadowBlur = this.config.lightness;
        this.blendMode = "screen";
        //endstyle
    }

    fixPositions() {
        let start = this.firstSegment;
        let end = this.lastSegment;
        const normalizedVector = this.getVector(end.point).normalize();
        start.point = start.point.add(normalizedVector);
        end.point = end.point.add(normalizedVector);
    }

    continueFromPoint(point, angle) {
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

    isInside(object) {
        return this.enteredObjects.indexOf(object.getId()) >= 0;
    }

    getEnteredObjects() {
        return JSON.parse(JSON.stringify( this.enteredObjects ))
    }
}
