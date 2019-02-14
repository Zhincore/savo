class Angle {
    static calculateFor2Points(point1, point2) {
        let a = Math.abs(point2.x - point1.x);
        let b = Math.abs(point2.y - point1.y);
        let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

        return Math.degrees(Math.asin(b/c));
    }

    /**
     * Returns absolute angle of reflection for two objects and point of intersection (tilt angle to X axis)
     *
     * @param o1 Ray
     * @param o2 Mirror
     * @param intersectionPoint Point
     * @returns int 0-359 degrees
     */
    static calculateAbsoluteReflectionAngleForObjects(o1, o2, intersectionPoint) {
        let v1 = o1.getVector(intersectionPoint);
        let v2 = o2.getPerpendicularVector();

        return this.reflect(v1, v2.normalize()).angle;
    }

    static calculateAbsoluteRefractionAngleForObjects(o1, o2, intersectionPoint, eta) {
        let v1 = o1.getVector(intersectionPoint);
        let v2 = o2.getVector(intersectionPoint);

        if(o1.isInside(o2)) {
            v2.angle += 180;
        }

        let refractionVector = this.refract(v1.normalize(), v2.normalize(), eta);
        if(refractionVector === null) { //invalid angle, reflecting instead
            return this.reflect(v1, v2.normalize()).angle;
        }

        return refractionVector.angle;
    }

    static reflect(v1, v2) {
        // r=d−2(d⋅n)n, n normalized
        return v1.subtract(v2.multiply(v1.dot(v2) * 2));
    }

    // using as reference:
    // https://graphics.stanford.edu/courses/cs148-10-summer/docs/2006--degreve--reflection_refraction.pdf
    static refract(normalizedI, normalizedN, eta) {
        const cosI = -1 * normalizedN.dot(normalizedI);
        const sinT2 = eta * eta * (1.0 - cosI * cosI);

        if (sinT2 > 1.0) {
            return null; //invalid vector, shouldnt refract, too low angle
        }

        const cosT = Math.sqrt(1.0 - sinT2);

        return normalizedI.multiply(eta).add(normalizedN.multiply(eta * cosI - cosT));
    }

    static getEta(fromRI, toRI) {
        return fromRI / toRI;
    }

    static betweenTwoVectors(v1, v2) {
        let m1 = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
        let m2 = Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2));

        return Math.degrees(Math.acos(v1.dot(v2) / (m1 * m2)));
    }
}
