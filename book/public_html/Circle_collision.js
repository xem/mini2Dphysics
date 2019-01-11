/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global Circle */

Circle.prototype.collisionTest = function (otherShape, collisionInfo) {
    var status = false;
    if (otherShape.mType === "Circle") {
        status = this.collidedCircCirc(this, otherShape, collisionInfo);
    } else {
        status = otherShape.collidedRectCirc(this, collisionInfo);
    }
    return status;
};

Circle.prototype.collidedCircCirc = function (c1, c2, collisionInfo) {
    var vFrom1to2 = c2.mCenter.subtract(c1.mCenter);
    var rSum = c1.mRadius + c2.mRadius;
    var dist = vFrom1to2.length();
    if (dist > Math.sqrt(rSum * rSum)) {
        //not overlapping
        return false;
    }
    if (dist !== 0) {
        // overlapping bu not same position
        var normalFrom2to1 = vFrom1to2.scale(-1).normalize();
        var radiusC2 = normalFrom2to1.scale(c2.mRadius);
        collisionInfo.setInfo(rSum - dist, vFrom1to2.normalize(), c2.mCenter.add(radiusC2));
    } else {
        //same position
        if (c1.mRadius > c2.mRadius) {
            collisionInfo.setInfo(rSum, new Vec2(0, -1), c1.mCenter.add(new Vec2(0, c1.mRadius)));
        } else {
            collisionInfo.setInfo(rSum, new Vec2(0, -1), c2.mCenter.add(new Vec2(0, c2.mRadius)));
        }
    }
    return true;
};

