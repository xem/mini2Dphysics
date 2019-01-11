/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
var Vec2 = function (x, y) {
    this.x = x;
    this.y = y;
};

Vec2.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vec2.prototype.add = function (vec) {
    return new Vec2(vec.x + this.x, vec.y + this.y);
};

Vec2.prototype.subtract = function (vec) {
    return new Vec2(this.x - vec.x, this.y - vec.y);
};

Vec2.prototype.scale = function (n) {
    return new Vec2(this.x * n, this.y * n);
};

Vec2.prototype.dot = function (vec) {
    return (this.x * vec.x + this.y * vec.y);
};

Vec2.prototype.cross = function (vec) {
    return (this.x * vec.y - this.y * vec.x);
};

Vec2.prototype.rotate = function (center, angle) {
    //rotate in counterclockwise
    var r = [];

    var x = this.x - center.x;
    var y = this.y - center.y;

    r[0] = x * Math.cos(angle) - y * Math.sin(angle);
    r[1] = x * Math.sin(angle) + y * Math.cos(angle);

    r[0] += center.x;
    r[1] += center.y;

    return new Vec2(r[0], r[1]);
};

Vec2.prototype.normalize = function () {

    var len = this.length();
    if (len > 0) {
        len = 1 / len;
    }
    return new Vec2(this.x * len, this.y * len);
};

Vec2.prototype.distance = function (vec) {
    var x = this.x - vec.x;
    var y = this.y - vec.y;
    return Math.sqrt(x * x + y * y);
};

/* 
 * File: CollisionInfo.js
 *      normal: vector upon which collision interpenetrates
 *      depth: how much penetration
 */

/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";

/**
 * Default Constructor
 * @memberOf CollisionInfo
 * @returns {CollisionInfo} New instance of CollisionInfo
 */
function CollisionInfo() {
    this.mDepth = 0;
    this.mNormal = new Vec2(0, 0);
    this.mStart = new Vec2(0, 0);
    this.mEnd = new Vec2(0, 0);
}

/**
 * Set the depth of the CollisionInfo
 * @memberOf CollisionInfo
 * @param {Number} s how much penetration
 * @returns {void}
 */
CollisionInfo.prototype.setDepth = function (s) {
    this.mDepth = s;
};

/**
 * Set the normal of the CollisionInfo
 * @memberOf CollisionInfo
 * @param {vec2} s vector upon which collision interpenetrates
 * @returns {void}
 */
CollisionInfo.prototype.setNormal = function (s) {
    this.mNormal = s;
};

/**
 * Return the depth of the CollisionInfo
 * @memberOf CollisionInfo
 * @returns {Number} how much penetration
 */
CollisionInfo.prototype.getDepth = function () {
    return this.mDepth;
};

/**
 * Return the depth of the CollisionInfo
 * @memberOf CollisionInfo
 * @returns {vec2} vector upon which collision interpenetrates
 */
CollisionInfo.prototype.getNormal = function () {
    return this.mNormal;
};

/**
 * Set the all value of the CollisionInfo
 * @memberOf CollisionInfo
 * @param {Number} d the depth of the CollisionInfo 
 * @param {Vec2} n the normal of the CollisionInfo
 * @param {Vec2} s the startpoint of the CollisionInfo
 * @returns {void}
 */
CollisionInfo.prototype.setInfo = function (d, n, s) {
    this.mDepth = d;
    this.mNormal = n;
    this.mStart = s;
    this.mEnd = s.add(n.scale(d));
};

/**
 * change the direction of normal
 * @memberOf CollisionInfo
 * @returns {void}
 */
CollisionInfo.prototype.changeDir = function () {
    this.mNormal = this.mNormal.scale(-1);
    var n = this.mStart;
    this.mStart = this.mEnd;
    this.mEnd = n;
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";

/* global mAllObjects, dt, gEngine */

function RigidShape(center, mass, friction, restitution) {

    this.mCenter = center;
    this.mInertia = 0;
    if (mass !== undefined) {
        this.mInvMass = mass;
    } else {
        this.mInvMass = 1;
    }

    if (friction !== undefined) {
        this.mFriction = friction;
    } else {
        this.mFriction = 0.8;
    }

    if (restitution !== undefined) {
        this.mRestitution = restitution;
    } else {
        this.mRestitution = 0.2;
    }

    this.mVelocity = new Vec2(0, 0);

    if (this.mInvMass !== 0) {
        this.mInvMass = 1 / this.mInvMass;
        this.mAcceleration = gEngine.Core.mGravity;
    } else {
        this.mAcceleration = new Vec2(0, 0);
    }

    //angle
    this.mAngle = 0;

    //negetive-- clockwise
    //postive-- counterclockwise
    this.mAngularVelocity = 0;

    this.mAngularAcceleration = 0;

    this.mBoundRadius = 0;

    gEngine.Core.mAllObjects.push(this);
}

RigidShape.prototype.updateMass = function (delta) {
    var mass;
    if (this.mInvMass !== 0) {
        mass = 1 / this.mInvMass;
    } else {
        mass = 0;
    }

    mass += delta;
    if (mass <= 0) {
        this.mInvMass = 0;
        this.mVelocity = new Vec2(0, 0);
        this.mAcceleration = new Vec2(0, 0);
        this.mAngularVelocity = 0;
        this.mAngularAcceleration = 0;
    } else {
        this.mInvMass = 1 / mass;
        this.mAcceleration = gEngine.Core.mGravity;
    }
    this.updateInertia();
};

RigidShape.prototype.updateInertia = function () {
    // subclass must define this.
    // must work with inverted this.mInvMass
};

RigidShape.prototype.update = function () {
    if (gEngine.Core.mMovement) {
        var dt = gEngine.Core.mUpdateIntervalInSeconds;
        //v += a*t
        this.mVelocity = this.mVelocity.add(this.mAcceleration.scale(dt));
        //s += v*t 
        this.move(this.mVelocity.scale(dt));

        this.mAngularVelocity += this.mAngularAcceleration * dt;
        this.rotate(this.mAngularVelocity * dt);        
    }
    var width = gEngine.Core.mWidth;
    var height = gEngine.Core.mHeight;
    if (this.mCenter.x < 0 || this.mCenter.x > width || this.mCenter.y < 0 || this.mCenter.y > height) {
        var index = gEngine.Core.mAllObjects.indexOf(this);
        if (index > -1)
            gEngine.Core.mAllObjects.splice(index, 1);
    }

};

RigidShape.prototype.boundTest = function (otherShape) {
    var vFrom1to2 = otherShape.mCenter.subtract(this.mCenter);
    var rSum = this.mBoundRadius + otherShape.mBoundRadius;
    var dist = vFrom1to2.length();
    if (dist > rSum) {
        //not overlapping
        return false;
    }
    return true;
};

/* 
 * File:Circle.js
 *      define a circle
 *     
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global RigidShape */

var Circle = function (center, radius, mass, friction, restitution) {
    RigidShape.call(this, center, mass, friction, restitution);
    this.mType = "Circle";
    this.mRadius = radius;
    this.mBoundRadius = radius;
    //The start point of line in circle
    this.mStartpoint = new Vec2(center.x, center.y - radius);
    this.updateInertia();
};

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Circle;
Circle.prototype = prototype;

Circle.prototype.move = function (s) {
    this.mStartpoint = this.mStartpoint.add(s);
    this.mCenter = this.mCenter.add(s);
    return this;
};

Circle.prototype.draw = function (context) {
    context.beginPath();

    //draw a circle
    context.arc(this.mCenter.x, this.mCenter.y, this.mRadius, 0, Math.PI * 2, true);

    //draw a line from start point toward center
    context.moveTo(this.mStartpoint.x, this.mStartpoint.y);
    context.lineTo(this.mCenter.x, this.mCenter.y);

    context.closePath();
    context.stroke();
};

//rotate angle in counterclockwise
Circle.prototype.rotate = function (angle) {
    this.mAngle += angle;
    this.mStartpoint = this.mStartpoint.rotate(this.mCenter, angle);
    return this;
};

Circle.prototype.updateInertia = function () {
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        // this.mInvMass is inverted!!
        // Inertia=mass * radius^2
        // 12 is a constant value that can be changed
        this.mInertia = (1 / this.mInvMass) * (this.mRadius * this.mRadius) / 12;
    }
};

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global RigidShape */

var Rectangle = function (center, width, height, mass, friction, restitution) {

    RigidShape.call(this, center, mass, friction, restitution);
    this.mType = "Rectangle";
    this.mWidth = width;
    this.mHeight = height;
    this.mBoundRadius = Math.sqrt(width * width + height * height) / 2;
    this.mVertex = [];
    this.mFaceNormal = [];

    //0--TopLeft;1--TopRight;2--BottomRight;3--BottomLeft
    this.mVertex[0] = new Vec2(center.x - width / 2, center.y - height / 2);
    this.mVertex[1] = new Vec2(center.x + width / 2, center.y - height / 2);
    this.mVertex[2] = new Vec2(center.x + width / 2, center.y + height / 2);
    this.mVertex[3] = new Vec2(center.x - width / 2, center.y + height / 2);

    //0--Top;1--Right;2--Bottom;3--Left
    //mFaceNormal is normal of face toward outside of rectangle
    this.mFaceNormal[0] = this.mVertex[1].subtract(this.mVertex[2]);
    this.mFaceNormal[0] = this.mFaceNormal[0].normalize();
    this.mFaceNormal[1] = this.mVertex[2].subtract(this.mVertex[3]);
    this.mFaceNormal[1] = this.mFaceNormal[1].normalize();
    this.mFaceNormal[2] = this.mVertex[3].subtract(this.mVertex[0]);
    this.mFaceNormal[2] = this.mFaceNormal[2].normalize();
    this.mFaceNormal[3] = this.mVertex[0].subtract(this.mVertex[1]);
    this.mFaceNormal[3] = this.mFaceNormal[3].normalize();

    this.updateInertia();
};

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Rectangle;
Rectangle.prototype = prototype;

Rectangle.prototype.rotate = function (angle) {
    this.mAngle += angle;
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].rotate(this.mCenter, angle);
    }
    this.mFaceNormal[0] = this.mVertex[1].subtract(this.mVertex[2]);
    this.mFaceNormal[0] = this.mFaceNormal[0].normalize();
    this.mFaceNormal[1] = this.mVertex[2].subtract(this.mVertex[3]);
    this.mFaceNormal[1] = this.mFaceNormal[1].normalize();
    this.mFaceNormal[2] = this.mVertex[3].subtract(this.mVertex[0]);
    this.mFaceNormal[2] = this.mFaceNormal[2].normalize();
    this.mFaceNormal[3] = this.mVertex[0].subtract(this.mVertex[1]);
    this.mFaceNormal[3] = this.mFaceNormal[3].normalize();
    return this;
};

Rectangle.prototype.move = function (v) {
    var i;
    for (i = 0; i < this.mVertex.length; i++) {
        this.mVertex[i] = this.mVertex[i].add(v);
    }
    this.mCenter = this.mCenter.add(v);
    return this;
};

Rectangle.prototype.draw = function (context) {
    context.save();

    context.translate(this.mVertex[0].x, this.mVertex[0].y);
    context.rotate(this.mAngle);
    context.strokeRect(0, 0, this.mWidth, this.mHeight);

    context.restore();
};

Rectangle.prototype.updateInertia = function () {
    // Expect this.mInvMass to be already inverted!
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        //inertia=mass*width^2+height^2
        this.mInertia = (1 / this.mInvMass) * (this.mWidth * this.mWidth + this.mHeight * this.mHeight) / 12;
        this.mInertia = 1 / this.mInertia;
    }
};

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

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/*global Rectangle, Vec2 */

Rectangle.prototype.collisionTest = function (otherShape, collisionInfo) {
    var status = false;
    if (otherShape.mType === "Circle") {
        status = this.collidedRectCirc(otherShape, collisionInfo);
    } else {
        status = this.collidedRectRect(this, otherShape, collisionInfo);
    }
    return status;
};

var SupportStruct = function () {
    this.mSupportPoint = null;
    this.mSupportPointDist = 0;
};
var tmpSupport = new SupportStruct();

Rectangle.prototype.findSupportPoint = function (dir, ptOnEdge) {
    //the longest project length
    var vToEdge;
    var projection;

    tmpSupport.mSupportPointDist = -9999999;
    tmpSupport.mSupportPoint = null;
    //check each vector of other object
    for (var i = 0; i < this.mVertex.length; i++) {
        vToEdge = this.mVertex[i].subtract(ptOnEdge);
        projection = vToEdge.dot(dir);
        
        //find the longest distance with certain edge
        //dir is -n direction, so the distance should be positive       
        if ((projection > 0) && (projection > tmpSupport.mSupportPointDist)) {
            tmpSupport.mSupportPoint = this.mVertex[i];
            tmpSupport.mSupportPointDist = projection;
        }
    }
};

/**
 * Find the shortest axis that overlapping
 * @memberOf Rectangle
 * @param {Rectangle} otherRect  another rectangle that being tested
 * @param {CollisionInfo} collisionInfo  record the collision information
 * @returns {Boolean} true if has overlap part in all four directions.
 * the code is convert from http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032
 */
Rectangle.prototype.findAxisLeastPenetration = function (otherRect, collisionInfo) {

    var n;
    var supportPoint;

    var bestDistance = 999999;
    var bestIndex = null;

    var hasSupport = true;
    var i = 0;

    while ((hasSupport) && (i < this.mFaceNormal.length)) {
        // Retrieve a face normal from A
        n = this.mFaceNormal[i];

        // use -n as direction and the vectex on edge i as point on edge
        var dir = n.scale(-1);
        var ptOnEdge = this.mVertex[i];
        // find the support on B
        // the point has longest distance with edge i 
        otherRect.findSupportPoint(dir, ptOnEdge);
        hasSupport = (tmpSupport.mSupportPoint !== null);
        
        //get the shortest support point depth
        if ((hasSupport) && (tmpSupport.mSupportPointDist < bestDistance)) {
            bestDistance = tmpSupport.mSupportPointDist;
            bestIndex = i;
            supportPoint = tmpSupport.mSupportPoint;
        }
        i = i + 1;
    }
    if (hasSupport) {
        //all four directions have support point
        var bestVec = this.mFaceNormal[bestIndex].scale(bestDistance);
        collisionInfo.setInfo(bestDistance, this.mFaceNormal[bestIndex], supportPoint.add(bestVec));
    }
    return hasSupport;
};
/**
 * Check for collision between RigidRectangle and RigidRectangle
 * @param {Rectangle} r1 Rectangle object to check for collision status
 * @param {Rectangle} r2 Rectangle object to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf Rectangle
 */    
var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();
Rectangle.prototype.collidedRectRect = function (r1, r2, collisionInfo) {

    var status1 = false;
    var status2 = false;

    //find Axis of Separation for both rectangle
    status1 = r1.findAxisLeastPenetration(r2, collisionInfoR1);

    if (status1) {
        status2 = r2.findAxisLeastPenetration(r1, collisionInfoR2);
        if (status2) {
            //if both of rectangles are overlapping, choose the shorter normal as the normal       
            if (collisionInfoR1.getDepth() < collisionInfoR2.getDepth()) {
                var depthVec = collisionInfoR1.getNormal().scale(collisionInfoR1.getDepth());
                collisionInfo.setInfo(collisionInfoR1.getDepth(), collisionInfoR1.getNormal(), collisionInfoR1.mStart.subtract(depthVec));
            } else {
                collisionInfo.setInfo(collisionInfoR2.getDepth(), collisionInfoR2.getNormal().scale(-1), collisionInfoR2.mStart);
            }
        } 
    }
    return status1 && status2;
};

/**
 * Check for collision between Rectangle and Circle
 * @param {Circle} otherCir circle to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf Rectangle
 */
Rectangle.prototype.collidedRectCirc = function (otherCir, collisionInfo) {

    var inside = true;
    var bestDistance = -99999;
    var nearestEdge = 0;
    var i, v;
    var circ2Pos, projection;
    for (i = 0; i < 4; i++) {
        //find the nearest face for center of circle        
        circ2Pos = otherCir.mCenter;
        v = circ2Pos.subtract(this.mVertex[i]);
        projection = v.dot(this.mFaceNormal[i]);
        if (projection > 0) {
            //if the center of circle is outside of rectangle
            bestDistance = projection;
            nearestEdge = i;
            inside = false;
            break;
        }
        if (projection > bestDistance) {
            bestDistance = projection;
            nearestEdge = i;
        }
    }
    var dis, normal, radiusVec;
    if (!inside) {
        //the center of circle is outside of rectangle

        //v1 is from left vertex of face to center of circle 
        //v2 is from left vertex of face to right vertex of face
        var v1 = circ2Pos.subtract(this.mVertex[nearestEdge]);
        var v2 = this.mVertex[(nearestEdge + 1) % 4].subtract(this.mVertex[nearestEdge]);

        var dot = v1.dot(v2);

        if (dot < 0) {
            //the center of circle is in corner region of mVertex[nearestEdge]
            dis = v1.length();
            //compare the distance with radium to decide collision
            if (dis > otherCir.mRadius) {
                return false;
            }

            normal = v1.normalize();
            radiusVec = normal.scale(-otherCir.mRadius);
            collisionInfo.setInfo(otherCir.mRadius - dis, normal, circ2Pos.add(radiusVec));
        } else {
            //the center of circle is in corner region of mVertex[nearestEdge+1]

            //v1 is from right vertex of face to center of circle 
            //v2 is from right vertex of face to left vertex of face
            v1 = circ2Pos.subtract(this.mVertex[(nearestEdge + 1) % 4]);
            v2 = v2.scale(-1);
            dot = v1.dot(v2); 
            if (dot < 0) {
                dis = v1.length();
                //compare the distance with radium to decide collision
                if (dis > otherCir.mRadius) {
                    return false;
                }
                normal = v1.normalize();
                radiusVec = normal.scale(-otherCir.mRadius);
                collisionInfo.setInfo(otherCir.mRadius - dis, normal, circ2Pos.add(radiusVec));
            } else {
                //the center of circle is in face region of face[nearestEdge]
                if (bestDistance < otherCir.mRadius) {
                    radiusVec = this.mFaceNormal[nearestEdge].scale(otherCir.mRadius);
                    collisionInfo.setInfo(otherCir.mRadius - bestDistance, this.mFaceNormal[nearestEdge], circ2Pos.subtract(radiusVec));
                } else {
                    return false;
                }
            }
        }
    } else {
        //the center of circle is inside of rectangle
        radiusVec = this.mFaceNormal[nearestEdge].scale(otherCir.mRadius);
        collisionInfo.setInfo(otherCir.mRadius - bestDistance, this.mFaceNormal[nearestEdge], circ2Pos.subtract(radiusVec));
    }
    return true;
};

/*
 The following is not free software. You may use it for educational purposes, but you may not redistribute or use it commercially.
 (C) Burak Kanber 2012
 */
/* global objectNum, context, mRelaxationCount, mAllObjects, mPosCorrectionRate */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
var gEngine = gEngine || {};
// initialize the variable while ensuring it is not redefined

gEngine.Physics = (function () {

    var mPositionalCorrectionFlag = true;
    var mRelaxationCount = 15;                  // number of relaxation iteration
    var mPosCorrectionRate = 0.8;               // percentage of separation to project objects

    var positionalCorrection = function (s1, s2, collisionInfo) {
        var s1InvMass = s1.mInvMass;
        var s2InvMass = s2.mInvMass;

        var num = collisionInfo.getDepth() / (s1InvMass + s2InvMass) * mPosCorrectionRate;
        var correctionAmount = collisionInfo.getNormal().scale(num);

        s1.move(correctionAmount.scale(-s1InvMass));
        s2.move(correctionAmount.scale(s2InvMass));
    };

    var resolveCollision = function (s1, s2, collisionInfo) {

        if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
            return;
        }

        //  correct positions
        if (gEngine.Physics.mPositionalCorrectionFlag) {
            positionalCorrection(s1, s2, collisionInfo);
        }

        var n = collisionInfo.getNormal();

        //the direction of collisionInfo is always from s1 to s2
        //but the Mass is inversed, so start scale with s2 and end scale with s1
        var start = collisionInfo.mStart.scale(s2.mInvMass / (s1.mInvMass + s2.mInvMass));
        var end = collisionInfo.mEnd.scale(s1.mInvMass / (s1.mInvMass + s2.mInvMass));
        var p = start.add(end);
        //r is vector from center of object to collision point
        var r1 = p.subtract(s1.mCenter);
        var r2 = p.subtract(s2.mCenter);

        //newV = V + mAngularVelocity cross R
        var v1 = s1.mVelocity.add(new Vec2(-1 * s1.mAngularVelocity * r1.y, s1.mAngularVelocity * r1.x));
        var v2 = s2.mVelocity.add(new Vec2(-1 * s2.mAngularVelocity * r2.y, s2.mAngularVelocity * r2.x));
        var relativeVelocity = v2.subtract(v1);

        // Relative velocity in normal direction
        var rVelocityInNormal = relativeVelocity.dot(n);

        //if objects moving apart ignore
        if (rVelocityInNormal > 0) {
            return;
        }

        // compute and apply response impulses for each object    
        var newRestituion = Math.min(s1.mRestitution, s2.mRestitution);
        var newFriction = Math.min(s1.mFriction, s2.mFriction);

        //R cross N
        var R1crossN = r1.cross(n);
        var R2crossN = r2.cross(n);

        // Calc impulse scalar
        // the formula of jN can be found in http://www.myphysicslab.com/collision.html
        var jN = -(1 + newRestituion) * rVelocityInNormal;
        jN = jN / (s1.mInvMass + s2.mInvMass +
                R1crossN * R1crossN * s1.mInertia +
                R2crossN * R2crossN * s2.mInertia);

        //impulse is in direction of normal ( from s1 to s2)
        var impulse = n.scale(jN);
        // impulse = F dt = m * ?v
        // ?v = impulse / m
        s1.mVelocity = s1.mVelocity.subtract(impulse.scale(s1.mInvMass));
        s2.mVelocity = s2.mVelocity.add(impulse.scale(s2.mInvMass));

        s1.mAngularVelocity -= R1crossN * jN * s1.mInertia;
        s2.mAngularVelocity += R2crossN * jN * s2.mInertia;

        var tangent = relativeVelocity.subtract(n.scale(relativeVelocity.dot(n)));

        //relativeVelocity.dot(tangent) should less than 0
        tangent = tangent.normalize().scale(-1);

        var R1crossT = r1.cross(tangent);
        var R2crossT = r2.cross(tangent);

        var jT = -(1 + newRestituion) * relativeVelocity.dot(tangent) * newFriction;
        jT = jT / (s1.mInvMass + s2.mInvMass + R1crossT * R1crossT * s1.mInertia + R2crossT * R2crossT * s2.mInertia);

        //friction should less than force in normal direction
        if (jT > jN) {
            jT = jN;
        }

        //impulse is from s1 to s2 (in opposite direction of velocity)
        impulse = tangent.scale(jT);

        s1.mVelocity = s1.mVelocity.subtract(impulse.scale(s1.mInvMass));
        s2.mVelocity = s2.mVelocity.add(impulse.scale(s2.mInvMass));
        s1.mAngularVelocity -= R1crossT * jT * s1.mInertia;
        s2.mAngularVelocity += R2crossT * jT * s2.mInertia;
    };

    var drawCollisionInfo = function (collisionInfo, context) {
        context.beginPath();
        context.moveTo(collisionInfo.mStart.x, collisionInfo.mStart.y);
        context.lineTo(collisionInfo.mEnd.x, collisionInfo.mEnd.y);
        context.closePath();
        context.strokeStyle = "orange";
        context.stroke();
    };
    var collision = function () {
        var i, j, k;
        var collisionInfo = new CollisionInfo();
        for (k = 0; k < mRelaxationCount; k++) {
            for (i = 0; i < gEngine.Core.mAllObjects.length; i++) {
                for (j = i + 1; j < gEngine.Core.mAllObjects.length; j++) {
                    if (gEngine.Core.mAllObjects[i].boundTest(gEngine.Core.mAllObjects[j])) {
                        if (gEngine.Core.mAllObjects[i].collisionTest(gEngine.Core.mAllObjects[j], collisionInfo)) {
                            //make sure the normal is always from object[i] to object[j]
                            if (collisionInfo.getNormal().dot(gEngine.Core.mAllObjects[j].mCenter.subtract(gEngine.Core.mAllObjects[i].mCenter)) < 0) {
                                collisionInfo.changeDir();
                            }

                            //draw collision info (a black line that shows normal)
                            //drawCollisionInfo(collisionInfo, gEngine.Core.mContext);

                            resolveCollision(gEngine.Core.mAllObjects[i], gEngine.Core.mAllObjects[j], collisionInfo);
                        }
                    }
                }
            }
        }
    };
    var mPublic = {
        collision: collision,
        mPositionalCorrectionFlag: mPositionalCorrectionFlag
    };

    return mPublic;
}());

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*jslint node: true, vars: true, evil: true, bitwise: true */
/*global  requestAnimationFrame: false */
/*global document,gObjectNum */
"use strict";  // Operate in Strict mode such that variables must be declared before used!

/**
 * Static refrence to gEngine
 * @type gEngine
 */
var gEngine = gEngine || {};
// initialize the variable while ensuring it is not redefined
gEngine.Core = (function () {
    var mCanvas, mContext, mWidth = 800, mHeight = 450;
    mCanvas = document.getElementById('canvas');
    mContext = mCanvas.getContext('2d');
    mCanvas.height = mHeight;
    mCanvas.width = mWidth;

    var mGravity = new Vec2(0, 20);
    var mMovement = true;

    var mCurrentTime, mElapsedTime, mPreviousTime = Date.now(), mLagTime = 0;
    var kFPS = 60;          // Frames per second
    var kFrameTime = 1 / kFPS;
    var mUpdateIntervalInSeconds = kFrameTime;
    var kMPF = 1000 * kFrameTime; // Milliseconds per frame.
    var mAllObjects = [];

    var updateUIEcho = function () {
        document.getElementById("uiEchoString").innerHTML =
                "<p><b>Selected Object:</b>:</p>" +
                "<ul style=\"margin:-10px\">" +
                "<li>Id: " + gObjectNum + "</li>" +
                "<li>Center: " + mAllObjects[gObjectNum].mCenter.x.toPrecision(3) + "," + mAllObjects[gObjectNum].mCenter.y.toPrecision(3) + "</li>" +
                "<li>Angle: " + mAllObjects[gObjectNum].mAngle.toPrecision(3) + "</li>" +
                "<li>Velocity: " + mAllObjects[gObjectNum].mVelocity.x.toPrecision(3) + "," + mAllObjects[gObjectNum].mVelocity.y.toPrecision(3) + "</li>" +
                "<li>AngluarVelocity: " + mAllObjects[gObjectNum].mAngularVelocity.toPrecision(3) + "</li>" +
                "<li>Mass: " + 1 / mAllObjects[gObjectNum].mInvMass.toPrecision(3) + "</li>" +
                "<li>Friction: " + mAllObjects[gObjectNum].mFriction.toPrecision(3) + "</li>" +
                "<li>Restitution: " + mAllObjects[gObjectNum].mRestitution.toPrecision(3) + "</li>" +
                "<li>Positional Correction: " + gEngine.Physics.mPositionalCorrectionFlag + "</li>" +
                "<li>Movement: " + gEngine.Core.mMovement + "</li>" +
                "</ul> <hr>" +
                "<p><b>Control</b>: of selected object</p>" +
                "<ul style=\"margin:-10px\">" +
                "<li><b>Num</b> or <b>Up/Down Arrow</b>: Select Object</li>" +
                "<li><b>WASD</b> + <b>QE</b>: Position [Move + Rotate]</li>" +
                "<li><b>IJKL</b> + <b>UO</b>: Velocities [Linear + Angular]</li>" +
                "<li><b>Z/X</b>: Mass [Decrease/Increase]</li>" +
                "<li><b>C/V</b>: Frictrion [Decrease/Increase]</li>" +
                "<li><b>B/N</b>: Restitution [Decrease/Increase]</li>" +
                "<li><b>M</b>: Positional Correction [On/Off]</li>" +
                "<li><b>,</b>: Movement [On/Off]</li>" +
                "</ul> <hr>" +
                "<b>F/G</b>: Spawn [Rectangle/Circle] at selected object" +
                "<p><b>H</b>: Excite all objects</p>" +
                "<p><b>R</b>: Reset System</p>" +
                "<hr>";
    };
    var draw = function () {
        mContext.clearRect(0, 0, mWidth, mHeight);
        var i;
        for (i = 0; i < mAllObjects.length; i++) {
            mContext.strokeStyle = 'blue';
            if (i === gObjectNum) {
                mContext.strokeStyle = 'red';
            }
            mAllObjects[i].draw(mContext);
        }
    };
    var update = function () {
        var i;
        for (i = 0; i < mAllObjects.length; i++) {
            mAllObjects[i].update(mContext);
        }
    };
    var runGameLoop = function () {
        requestAnimationFrame(function () {
            runGameLoop();
        });

        //      compute how much time has elapsed since we last runGameLoop was executed
        mCurrentTime = Date.now();
        mElapsedTime = mCurrentTime - mPreviousTime;
        mPreviousTime = mCurrentTime;
        mLagTime += mElapsedTime;

        updateUIEcho();
        draw();
        //      Make sure we update the game the appropriate number of times.
        //      Update only every Milliseconds per frame.
        //      If lag larger then update frames, update until caught up.
        while (mLagTime >= kMPF) {
            mLagTime -= kMPF;
            gEngine.Physics.collision();
            update();
        }
    };
    var initializeEngineCore = function () {
        runGameLoop();
    };
    var mPublic = {
        initializeEngineCore: initializeEngineCore,
        mAllObjects: mAllObjects,
        mWidth: mWidth,
        mHeight: mHeight,
        mContext: mContext,
        mGravity: mGravity,
        mUpdateIntervalInSeconds: mUpdateIntervalInSeconds,
        mMovement: mMovement
    };
    return mPublic;
}());

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global height, width, gEngine */
function MyGame() {
    var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0);
    r1.rotate(2.8);
    var r2 = new Rectangle(new Vec2(200, 400), 400, 20, 0, 1, 0.5);
    var r3 = new Rectangle(new Vec2(100, 200), 200, 20, 0);
    var r4 = new Rectangle(new Vec2(10, 360), 20, 100, 0, 0, 1);

    for (var i = 0; i < 10; i++) {
        var r1 = new Rectangle(new Vec2(Math.random() * gEngine.Core.mWidth, Math.random() * gEngine.Core.mHeight / 2), Math.random() * 50 + 10, Math.random() * 50 + 10, Math.random() * 30, Math.random(), Math.random());
        r1.mVelocity = new Vec2(Math.random() * 60 - 30, Math.random() * 60 - 30);
        var r1 = new Circle(new Vec2(Math.random() * gEngine.Core.mWidth, Math.random() * gEngine.Core.mHeight / 2), Math.random() * 20 + 10, Math.random() * 30, Math.random(), Math.random());
        r1.mVelocity = new Vec2(Math.random() * 60 - 30, Math.random() * 60 - 30);
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/* global mAllObjects, gEngine */

var gObjectNum = 0;
function userControl(event) {
    var keycode;

    if (window.event) {
        //alert('ie');
        keycode = event.keyCode;
    } else if (event.which) {
        //alert('firefox ');
        keycode = event.which;
    }
    if (keycode >= 48 && keycode <= 57) {
        if (keycode - 48 < gEngine.Core.mAllObjects.length) {
            gObjectNum = keycode - 48;
        }
    }
    if (keycode === 38) {
        //up arrow
        if (gObjectNum > 0) {
            gObjectNum--;
        }
    }
    if (keycode === 40) {
        // down arrow
        if (gObjectNum < gEngine.Core.mAllObjects.length - 1) {
            gObjectNum++;
        }
    }
    if (keycode === 87) {
        //W
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(0, -10));
    }
    if (keycode === 83) {
        // S
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(0, +10));
    }
    if (keycode === 65) {
        //A
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(-10, 0));
    }
    if (keycode === 68) {
        //D
        gEngine.Core.mAllObjects[gObjectNum].move(new Vec2(10, 0));
    }
    if (keycode === 81) {
        //Q
        gEngine.Core.mAllObjects[gObjectNum].rotate(-0.1);
    }
    if (keycode === 69) {
        //E
        gEngine.Core.mAllObjects[gObjectNum].rotate(0.1);
    }
    if (keycode === 73) {
        //I
        gEngine.Core.mAllObjects[gObjectNum].mVelocity.y -= 1;
    }
    if (keycode === 75) {
        // k
        gEngine.Core.mAllObjects[gObjectNum].mVelocity.y += 1;
    }
    if (keycode === 74) {
        //j
        gEngine.Core.mAllObjects[gObjectNum].mVelocity.x -= 1;
    }
    if (keycode === 76) {
        //l
        gEngine.Core.mAllObjects[gObjectNum].mVelocity.x += 1;
    }
    if (keycode === 85) {
        //U
        gEngine.Core.mAllObjects[gObjectNum].mAngularVelocity -= 0.1;
    }
    if (keycode === 79) {
        //O
        gEngine.Core.mAllObjects[gObjectNum].mAngularVelocity += 0.1;
    }
    if (keycode === 90) {
        //Z
        gEngine.Core.mAllObjects[gObjectNum].updateMass(-1);
    }
    if (keycode === 88) {
        //X
        gEngine.Core.mAllObjects[gObjectNum].updateMass(1);
    }
    if (keycode === 67) {
        //C
        gEngine.Core.mAllObjects[gObjectNum].mFriction -= 0.01;
    }
    if (keycode === 86) {
        //V
        gEngine.Core.mAllObjects[gObjectNum].mFriction += 0.01;
    }
    if (keycode === 66) {
        //B
        gEngine.Core.mAllObjects[gObjectNum].mRestitution -= 0.01;
    }
    if (keycode === 78) {
        //N
        gEngine.Core.mAllObjects[gObjectNum].mRestitution += 0.01;
    }
    if (keycode === 77) {
        //M
        gEngine.Physics.mPositionalCorrectionFlag = !gEngine.Physics.mPositionalCorrectionFlag;
    }
    if (keycode === 188) {
        //，
        gEngine.Core.mMovement = !gEngine.Core.mMovement;
    }
    if (keycode === 70) {
        //f
        var r1 = new Rectangle(new Vec2(gEngine.Core.mAllObjects[gObjectNum].mCenter.x, gEngine.Core.mAllObjects[gObjectNum].mCenter.y), Math.random() * 30 + 10, Math.random() * 30 + 10, Math.random() * 30, Math.random(), Math.random());
        r1.mVelocity = new Vec2(Math.random() * 300 - 150, Math.random() * 300 - 150);
    }
    if (keycode === 71) {
        //g
        var r1 = new Circle(new Vec2(gEngine.Core.mAllObjects[gObjectNum].mCenter.x, gEngine.Core.mAllObjects[gObjectNum].mCenter.y), Math.random() * 10 + 20, Math.random() * 30, Math.random(), Math.random());
        r1.mVelocity = new Vec2(Math.random() * 300 - 150, Math.random() * 300 - 150);
    }

    if (keycode === 72) {
        //H
        var i;
        for (i = 0; i < gEngine.Core.mAllObjects.length; i++) {
            if (gEngine.Core.mAllObjects[i].mInvMass !== 0) {
                gEngine.Core.mAllObjects[i].mVelocity = new Vec2(Math.random() * 500 - 250, Math.random() * 500 - 250);
            }
        }
    }
    if (keycode === 82) {
        //R
        gEngine.Core.mAllObjects.splice(7, gEngine.Core.mAllObjects.length);
        gObjectNum = 0;
    }
}