class LightSource extends Group {
    constructor(position, angle, config = {}){
        super();

        this.position = position;

        //correcting variables
        angle = round(angle % 360, App.config.anglePrecision);

        this.angle = angle;
        this.size = config.size !== undefined ? config.size : 20;

        this.config = {
            color: config.color !== undefined ? config.color : '#fff',
            lightness: config.lightness !== undefined ? config.lightness : 1,
            power: config.power //if it's undefined, then first fired ray will have App.config.rayLength power by default
        }
    }

    static create(position, angle, config) {
        let lightSource = new this(position, angle, config);
        let sourceObject = new Path.Rectangle(lightSource.position.subtract(new Point(lightSource.size/2, lightSource.size/2)), lightSource.size);
        sourceObject.fillColor = lightSource.config.color;
        sourceObject.shadowColor = lightSource.config.color;
        sourceObject.shadowBlur = lightSource.config.color;
        sourceObject.data.movable = true;

        sourceObject.rotate(lightSource.angle);
        lightSource.addChild(sourceObject);
        lightSource.object = sourceObject;

        return lightSource;
    }

    fire() {
        return Ray.create(this.position, this.angle, this.config);
    }

    rotate(angle){
        this.angle += angle;
        super.rotate(angle, this.object.position);
    }
}
