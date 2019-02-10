class Mirror extends Path {
    constructor(x1, y1, x2, y2) {
        super();

        this.angle = Angle.calculateFor2Points(x1, y1, x2, y2);
        this.data.movable = true;
    }

    getX1() {
        return this.getSegments()[0].point.x;
    }

    getY1() {
        return this.getSegments()[0].point.y;
    }

    getX2() {
        return this.getSegments()[1].point.x;
    }

    getY2() {
        return this.getSegments()[1].point.y;
    }

    getPoint1() {
        return new Point(this.getX1(), this.getY1());
    }

    getPoint2() {
        return new Point(this.getX2(), this.getY2());
    }

    static create(x1, y1, x2, y2) {
        let group = new Group();
        let mirror = new this(x1, y1, x2, y2);

        mirror.strokeColor = '#affeff66';
        mirror.strokeWidth = 4;
        mirror.moveTo(x1, y1);
        mirror.lineTo(x2, y2);
        mirror.data.type = "mirror";
        mirror.name = "mesh";

        group.addChild(mirror);
        return mirror;
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
