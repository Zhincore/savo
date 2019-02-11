class Mirror extends Path {
    static create(point1, point2) {
        let group = new Group();
        let mirror = new this(point1, point2);
        group.addChild(mirror);

        mirror.moveTo(point1.x, point1.y);
        mirror.lineTo(point2.x, point2.y);

        return mirror;
    }

    constructor(point1, point2) {
        super();

        //style
        this.strokeColor = '#affeff66';
        this.strokeWidth = 4;
        //endstyle

        this.data.type = "mirror";
        this.name = "mesh";

        this.angle = Angle.calculateFor2Points(point1, point2);
        this.data.movable = true;
    }

    getPoint1() {
        return this.getSegments()[0].point;
    }

    getPoint2() {
        return this.getSegments()[1].point;
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

    // Events
    onFocus() {
        if(App.config.debug) {
            console.log('focus', this);
            this.selected = true;
        }
    }

    onUnfocus() {
        if(App.config.debug) {
            console.log('unfocus', this);
            this.selected = false;
        }
    }
}
