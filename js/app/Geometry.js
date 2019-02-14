class Geometry {
    static circleCenterFrom3Points(A, B, C) {
        const yDelta_a = B.y - A.y;
        const xDelta_a = B.x - A.x;
        const yDelta_b = C.y - B.y;
        const xDelta_b = C.x - B.x;

        const aSlope = yDelta_a / xDelta_a;
        const bSlope = yDelta_b / xDelta_b;

        const Cx = (aSlope*bSlope*(A.y - C.y) + bSlope*(A.x + B.x) - aSlope*(B.x+C.x) )/(2* (bSlope-aSlope) );
        const Cy = -1*(Cx - (A.x+B.x)/2)/aSlope +  (A.y+B.y)/2;
        return new Point(Cx, Cy);
    }
}
