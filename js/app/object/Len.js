class Len extends CompoundPath {
    /**
     * @param point center of outer arc
     * @param angle arc angle
     * @param span span between two arc's points
     * @returns {Len}
     */
    static create(point, angle, span) {
        let group = new Group();
        let len = new this(point, angle);

        let xDistance = (span / 2) / Math.tan(Math.radians(angle / 2));
        let extraXDistance = (span/2) / Math.tan(Math.radians((180 - angle / 2) / 2));

        let A = new Point(point.x + xDistance, point.y - span / 2);
        let B = new Point(point.x + xDistance, point.y + span / 2);
        let M = new Point(point.x + xDistance + extraXDistance, point.y);
        let N = M.clone().subtract(new Point(extraXDistance * 2, 0));

        len.mArc = new Path.Arc(A, M, B);
        len.nArc = new Path.Arc(A, N, B);
        console.log(len.mArc, len.nArc);

        len.addChild(len.mArc);
        len.addChild(len.nArc);

        group.addChild(len);
        return len;
    }

    constructor(position, angle, config) {
        super();

        //style
        this.strokeColor = "#68ffff66";
        this.strokeWidth = 1;
        this.fillColor = '#aefeff44';
        //endstyle

        this.data.type = "len";
        this.name = "mesh";

        this.angle = angle;
        this.data.movable = true;

        this.config = Object.assign({
            RI: App.materialRI.glass
        }, config);
    }

    /*
    Checks on which part of len point is and returns center of that len's part circle
     */
    getLenCircleCenter(point) {
        if(this.mArc.contains(point)) {
            return this.getAMBcenter();
        } else if(this.nArc.contains(point)) {
            return this.getANBcenter();
        } else {
            console.log('point not found in any of len arcs', this, point);
            return new Point(0, 0);
        }
    }

    getAMBcenter() {
        let thirdPoint = this.mArc.getPointAt(this.mArc.length);
        if(thirdPoint === undefined) {
            this.mArc.getPointAt(this.mArc.length / 3);
        }

        return Geometry.circleCenterFrom3Points(
            this.mArc.getPointAt(0),
            this.mArc.getPointAt(this.mArc.length / 2),
            this.mArc.getPointAt(this.mArc.length)
        )
    }

    getANBcenter() {
        let thirdPoint = this.nArc.getPointAt(this.nArc.length);
        if(thirdPoint === undefined) {
            this.nArc.getPointAt(this.nArc.length / 3);
        }

        return Geometry.circleCenterFrom3Points(
            this.nArc.getPointAt(0),
            this.nArc.getPointAt(this.nArc.length / 2),
            thirdPoint
        )
    }

    getVector(toPoint) {
        return toPoint.subtract(this.getLenCircleCenter(toPoint));
    }

    getPerpendicularVector(toPoint) {
        this.rotate(90);
        let v = this.getVector(toPoint);
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