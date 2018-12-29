function RigidShape(center, mass, friction=.8, restitution=.2) {
  this.mCenter = center;
  this.mInertia = 0;
  this.mFriction = friction;
  this.mRestitution = restitution;
  this.mVelocity = new Vec2(0, 0);
  this.mInvMass = mass ? 1 / mass : 0;
  this.mAcceleration = mass ? mGravity : new Vec2(0, 0);
  this.mAngle = 0;
  this.mAngularVelocity = 0;
  this.mAngularAcceleration = 0;
  this.mBoundRadius = 0;
  objects.push(this);
}

/*RigidShape.prototype.updateMass = function (delta) {
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
    this.mAcceleration = mGravity;
  }
  this.updateInertia();
};

RigidShape.prototype.updateInertia = function () {};
*/

RigidShape.prototype.update = function () {
  var dt = .016;
  //v += a*t
  this.mVelocity = this.mVelocity.add(this.mAcceleration.scale(dt));
  //s += v*t 
  this.move(this.mVelocity.scale(dt));
  this.mAngularVelocity += this.mAngularAcceleration * dt;
  this.rotate(this.mAngularVelocity * dt);
};

/*RigidShape.prototype.boundTest = function (otherShape) {
  var vFrom1to2 = otherShape.mCenter.subtract(this.mCenter);
  var rSum = this.mBoundRadius + otherShape.mBoundRadius;
  var dist = vFrom1to2.length();
  if (dist > rSum) {
    //not overlapping
    return false;
  }
  return true;
};*/

var Circle = function (center, radius, mass, friction, restitution) {
  RigidShape.call(this, center, mass, friction, restitution);
  this.mType = "Circle";
  this.mRadius = radius;
  this.mBoundRadius = radius;
  this.mStartpoint = new Vec2(center.x, center.y + radius);
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

Circle.prototype.draw = function () {
  c.beginPath();

  // circle
  c.arc(this.mCenter.x, this.mCenter.y, this.mRadius, 0, Math.PI * 2, true);

  // line
  c.moveTo(this.mStartpoint.x, this.mStartpoint.y);
  c.lineTo(this.mCenter.x, this.mCenter.y);
  
  c.closePath();
  c.stroke();
};

//rotate angle in counterclockwise
Circle.prototype.rotate = function(angle){
  this.mAngle += angle;
  this.mStartpoint = this.mStartpoint.rotate(this.mCenter, angle);
  return this;
};

Circle.prototype.updateInertia = function(){
    // this.mInvMass is inverted!!
    // Inertia=mass * radius^2
    // 12 is a constant value that can be changed
    this.mInertia = this.mInvMass ? (1 / this.mInvMass) * (this.mRadius * this.mRadius) / 12 : 0;
};

testCollision = function(c1, c2, info){
  var status;
  
  // Circle vs circle
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
    setInfo(info, rSum - dist, vFrom1to2.normalize(), c2.mCenter.add(radiusC2));
  } else {
    //same position
    if (c1.mRadius > c2.mRadius) {
      setInfo(info, rSum, new Vec2(0, -1), c1.mCenter.add(new Vec2(0, c1.mRadius)));
    } else {
      setInfo(info, rSum, new Vec2(0, -1), c2.mCenter.add(new Vec2(0, c2.mRadius)));
    }
  }
  return true;
  
  
  
  //if (shape2.mType === "Circle") {
  //  status = collidedCircCirc(shape1, shape2, info);
  //} else {
  //  status = shape2.collidedRectCirc(shape1, info);
  //}
  //return status;
}


var resolveCollision = function (s1, s2, collisionInfo) {
  if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
    return;
  }

  //  correct positions
  var s1InvMass = s1.mInvMass;
  var s2InvMass = s2.mInvMass;
  var num = collisionInfo.mDepth / (s1InvMass + s2InvMass) * .8; // .8 = poscorrectionrate = percentage of separation to project objects
  var correctionAmount = collisionInfo.mNormal.scale(num);
  s1.move(correctionAmount.scale(-s1InvMass));
  s2.move(correctionAmount.scale(s2InvMass));
  
  var n = collisionInfo.mNormal;

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