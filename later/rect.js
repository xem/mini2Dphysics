/* global RigidShape */

/*var Rectangle = function (center, width, height, mass, friction, restitution) {

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
*/

/*global Rectangle, Vec2 */

/*Rectangle.prototype.collisionTest = function (otherShape, collisionInfo) {
  var status = false;
  if (otherShape.mType === "Circle") {
    status = this.collidedRectCirc(otherShape, collisionInfo);
  } else {
    status = this.collidedRectRect(this, otherShape, collisionInfo);
  }
  return status;
};*/

var SupportStruct = function () {
  this.mSupportPoint = null;
  this.mSupportPointDist = 0;
};
var tmpSupport = new SupportStruct();

/*Rectangle.prototype.findSupportPoint = function (dir, ptOnEdge) {
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
};*/

/**
 * Find the shortest axis that overlapping
 * @memberOf Rectangle
 * @param {Rectangle} otherRect  another rectangle that being tested
 * @param {CollisionInfo} collisionInfo  record the collision information
 * @returns {Boolean} true if has overlap part in all four directions.
 * the code is convert from http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032
 */
/*Rectangle.prototype.findAxisLeastPenetration = function (otherRect, collisionInfo) {

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
};*/
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
/*Rectangle.prototype.collidedRectRect = function (r1, r2, collisionInfo) {

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
};*/

/**
 * Check for collision between Rectangle and Circle
 * @param {Circle} otherCir circle to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf Rectangle
 */
/*Rectangle.prototype.collidedRectCirc = function (otherCir, collisionInfo) {

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
};*/