function RigidShape(center, mass, friction=.8, restitution=.2) {
  this.C = center;
  this.I = 0;
  this.F = friction;
  this.R = restitution;
  this.V = Vec2(0, 0);
  this.IM = mass ? 1 / mass : 0;
  this.A = mass ? mGravity : Vec2(0, 0);
  this.AN = 0;
  this.AV = 0;
  this.AA = 0;
  this.B = 0;
  objects.push(this);
}

/*RigidShape.prototype.updateMass = function (delta) {
  var mass;
  if (this.IM !== 0) {
    mass = 1 / this.IM;
  } else {
    mass = 0;
  }
  mass += delta;
  if (mass <= 0) {
    this.IM = 0;
    this.V = new Vec2(0, 0);
    this.A = new Vec2(0, 0);
    this.AV = 0;
    this.AA = 0;
  } else {
    this.IM = 1 / mass;
    this.A = mGravity;
  }
  this.updateInertia();
};

RigidShape.prototype.updateInertia = function () {};
*/

RigidShape.prototype.update = function () {
  var dt = .016;
  //v += a*t
  this.V = add(this.V, scale(this.A, dt));
  //s += v*t 
  this.move(scale(this.V, dt));
  this.AV += this.AA * dt;
  this.rotate(this.AV * dt);
};

/*RigidShape.prototype.boundTest = function (otherShape) {
  var vFrom1to2 = otherShape.C.subtract(this.C);
  var rSum = this.B + otherShape.B;
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
  this.B = radius;
  this.SP = Vec2(center.x, center.y + radius);
  this.updateInertia();
};

var prototype = Object.create(RigidShape.prototype);
prototype.constructor = Circle;
Circle.prototype = prototype;

Circle.prototype.move = function (s){
  this.SP = add(this.SP, s);
  this.C = add(this.C, s);
  return this;
};

Circle.prototype.draw = function () {
  c.beginPath();

  // circle
  c.arc(this.C.x, this.C.y, this.mRadius, 0, Math.PI * 2, true);

  // line
  c.moveTo(this.SP.x, this.SP.y);
  c.lineTo(this.C.x, this.C.y);
  
  c.closePath();
  c.stroke();
};

//rotate angle in counterclockwise
Circle.prototype.rotate = function(angle){
  this.AN += angle;
  this.SP = rotate(this.SP, this.C, angle);
  return this;
};

Circle.prototype.updateInertia = function(){
    // this.IM is inverted!!
    // Inertia=mass * radius^2
    // 12 is a constant value that can be changed
    this.I = this.IM ? (1 / this.IM) * (this.mRadius * this.mRadius) / 12 : 0;
};

testCollision = function(c1, c2, info){
  var status;
  
  // Circle vs circle
  var vFrom1to2 = substract(c2.C, c1.C);
  var rSum = c1.mRadius + c2.mRadius;
  var dist = length(vFrom1to2);
  if (dist > Math.sqrt(rSum * rSum)) {
    //not overlapping
    return false;
  }
  if (dist !== 0) {
    // overlapping bu not same position
    var normalFrom2to1 = normalize(scale(vFrom1to2, -1));
    var radiusC2 = scale(normalFrom2to1, c2.mRadius);
    setInfo(info, rSum - dist, normalize(vFrom1to2), add(c2.C, radiusC2));
  } else {
    //same position
    if (c1.mRadius > c2.mRadius) {
      setInfo(info, rSum, Vec2(0, -1), add(c1.C, Vec2(0, c1.mRadius)));
    } else {
      setInfo(info, rSum, Vec2(0, -1), add(c2.C,Vec2(0, c2.mRadius)));
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
  if ((s1.IM === 0) && (s2.IM === 0)) {
    return;
  }

  //  correct positions
  var s1InvMass = s1.IM;
  var s2InvMass = s2.IM;
  var num = collisionInfo.D / (s1InvMass + s2InvMass) * .8; // .8 = poscorrectionrate = percentage of separation to project objects
  var correctionAmount = scale(collisionInfo.N, num);
  s1.move(scale(correctionAmount, -s1InvMass));
  s2.move(scale(correctionAmount, s2InvMass));
  
  var n = collisionInfo.N;

  //the direction of collisionInfo is always from s1 to s2
  //but the Mass is inversed, so start scale with s2 and end scale with s1
  var start = scale(collisionInfo.S, s2.IM / (s1.IM + s2.IM));
  var end = scale(collisionInfo.E, s1.IM / (s1.IM + s2.IM));
  var p = add(start, end);
  //r is vector from center of object to collision point
  var r1 = substract(p, s1.C);
  var r2 = substract(p, s2.C);

  //newV = V + AV cross R
  var v1 = add(s1.V, Vec2(-1 * s1.AV * r1.y, s1.AV * r1.x));
  var v2 = add(s2.V, Vec2(-1 * s2.AV * r2.y, s2.AV * r2.x));
  var relativeVelocity = substract(v2, v1);

  // Relative velocity in normal direction
  var rVelocityInNormal = dot(relativeVelocity, n);

  //if objects moving apart ignore
  if (rVelocityInNormal > 0) {
    return;
  }

  // compute and apply response impulses for each object  
  var newRestituion = Math.min(s1.R, s2.R);
  var newFriction = Math.min(s1.F, s2.F);

  //R cross N
  var R1crossN = cross(r1, n);
  var R2crossN = cross(r2, n);

  // Calc impulse scalar
  // the formula of jN can be found in http://www.myphysicslab.com/collision.html
  var jN = -(1 + newRestituion) * rVelocityInNormal;
  jN = jN / (s1.IM + s2.IM +
      R1crossN * R1crossN * s1.I +
      R2crossN * R2crossN * s2.I);

  //impulse is in direction of normal ( from s1 to s2)
  var impulse = scale(n, jN);
  // impulse = F dt = m * ?v
  // ?v = impulse / m
  s1.V = substract(s1.V, scale(impulse, s1.IM));
  s2.V = add(s2.V, scale(impulse, s2.IM));
  s1.AV -= R1crossN * jN * s1.I;
  s2.AV += R2crossN * jN * s2.I;
  var tangent = substract(relativeVelocity, scale(n, dot(relativeVelocity, n)));

  //relativeVelocity.dot(tangent) should less than 0
  tangent = scale(normalize(tangent), -1);
  var R1crossT = cross(r1, tangent);
  var R2crossT = cross(r2, tangent);
  var jT = -(1 + newRestituion) * dot(relativeVelocity, tangent) * newFriction;
  jT = jT / (s1.IM + s2.IM + R1crossT * R1crossT * s1.I + R2crossT * R2crossT * s2.I);

  //friction should less than force in normal direction
  if (jT > jN) {
    jT = jN;
  }

  //impulse is from s1 to s2 (in opposite direction of velocity)
  impulse = scale(tangent, jT);
  s1.V = substract(s1.V, scale(impulse, s1.IM));
  s2.V = add(s2.V, scale(impulse,s2.IM));
  s1.AV -= R1crossT * jT * s1.I;
  s2.AV += R2crossT * jT * s2.I;
};