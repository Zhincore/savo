class LightSource extends Group {
    constructor(position, angle, config = {}){
        super();

        this.position = position;

        //correcting variables
        angle = round(angle % 360, App.config.anglePrecision);

        this.angle = angle;
        this.size = config.size !== undefined ? config.size : 20;

        this.config = Object.assign({
            color: '#ffffff',
            lightness: 4,
        }, config);
    }

    static create(position, angle, config) {
        let lightSource = new this(position, angle, config);
        let sourceObject = new Path.Rectangle(lightSource.position.subtract(new Point(lightSource.size/2, lightSource.size/2)), lightSource.size);
        sourceObject.fillColor = lightSource.config.color;
        sourceObject.shadowColor = lightSource.config.color;
        sourceObject.shadowBlur = lightSource.config.color;
        sourceObject.data.movable = true;
        sourceObject.name = "mesh";
        sourceObject.data.type = "ray";

        sourceObject.rotate(lightSource.angle);
        lightSource.addChild(sourceObject);
        lightSource.object = sourceObject;

        return lightSource;
    }

    fire() {
        return Ray.create(this.object.position, this.angle, this.config);
    }

    rotate(angle){
        this.angle += angle;
        super.rotate(angle, this.object.position);
    }
}
