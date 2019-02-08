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

        var xDistance = (span / 2) / Math.tan(Math.radians(angle / 2));
        var extraXDistance = (span/2) / Math.tan(Math.radians(angle));

        var A = new Point(point.x + xDistance, point.y - span / 2);
        var B = new Point(point.x + xDistance, point.y + span / 2);
        var M = new Point(point.x + xDistance + extraXDistance, point.y);
        var Mp = M.clone().subtract(new Point(extraXDistance * 2, 0));

        len.addChild(new Path.Arc(A, M, B));
        len.addChild(new Path.Arc(A, Mp, B));
//
    len.strokeColor = '#729fcf';
    len.strokeWidth = 2;
    len.fillColor = '#aefeff';

//
//     var path1 = new Path.Arc(top, through1, bottom);
//     var path2 = new Path.Arc(top, through2, bottom);
//
//     len.addChild(path1);
//     len.addChild(path2);

        len.strokeColor = "#68ffff66";
        len.strokeWidth = 4;

        len.name = "len";

        // group.addChild(mirror);
        return len;
    }

    constructor(position, angle) {
        super();

        this.angle = angle;
        this.data.movable = true;
    }
}