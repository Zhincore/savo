class Mirror extends Path {
    static create(point1, point2) {
        let group = new Group();
        let mirror = new this(point1, point2);

        mirror.strokeColor = '#affeff66';
        mirror.strokeWidth = 4;
        mirror.moveTo(point1.x, point1.y);
        mirror.lineTo(point2.x, point2.y);
        mirror.data.type = "mirror";
        mirror.name = "mesh";

        group.addChild(mirror);
        return mirror;
    }

    constructor(point1, point2) {
        super();

        this.angle = Angle.calculateFor2Points(point1, point2);
        this.data.movable = true;
    }

    getPoint1() {
        return this.getSegments()[0];
    }

    getPoint2() {
        return this.getSegments()[1];
    }

    rotate(angle){
        this.angle += angle;
        super.rotate(angle);
    }

    getVector() {
        return this.getPoint1().subtract(this.getPoint2());
    }

    getPerpendicularVector() {
        this.rotate(90);
        let v = this.getVector();
        this.rotate(-90);
        return v;
    }
}
