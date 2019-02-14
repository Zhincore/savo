class LightSource extends Group {
    constructor(position, angle, config = {}){
        super();

        this.position = position;

        //correcting variables
        angle = round(angle % 360, App.config.anglePrecision);
        this.angle = angle;

        this.config = Object.assign({
            size: 20,
            color: '#ffffff',
            lightness: 4,
        }, config);
    }

    static create(position, angle, config) {
        let lightSource = new this(position, angle, config);
        let sourceObject = new Path.Rectangle(lightSource.position.subtract(new Point(lightSource.config.size/2, lightSource.config.size/2)), lightSource.config.size);
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
