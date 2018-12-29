function RigidShape(center, mass, friction=.8, restitution=.2){
  var shape = {};
  shape.C = center; // center
  shape.I = 0; // inertia
  shape.F = friction; // friction
  shape.R = restitution; // restitution (bouncing)
  shape.V = Vec2(0, 0); // velocity (speed)
  shape.IM = mass ? 1 / mass : 0; // inverseMass (0 if immobile)
  shape.A = mass ? mGravity : Vec2(0, 0); // acceleration
  shape.AN = 0; // angle
  shape.AV = 0; // angle velocity
  shape.AA = 0; // angle acceleration
  shape.B = 0; // bounds radius
  objects.push(shape);
  return shape;
};

var updateRigidShape = function(shape){
  var dt = .016;
  //v += a*t
  shape.V = add(shape.V, scale(shape.A, dt));
  //s += v*t 
  moveCircle(shape, scale(shape.V, dt));
  shape.AV += shape.AA * dt;
  rotateCircle(shape, shape.AV * dt);
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

var Circle = function(center, radius, mass, friction, restitution){
  var shape = RigidShape(center, mass, friction, restitution);
  shape.T = "Circle"; // type
  shape.RA = radius; // radius
  shape.B = radius; // bounding radius
  shape.SP = Vec2(center.x, center.y + radius); // start point (for the line)
  updateInertiaCircle(shape);
};

var moveCircle = function(circle, s){
  circle.SP = add(circle.SP, s);
  circle.C = add(circle.C, s);
};

var drawCircle = function(circle){
  c.beginPath();

  // circle
  c.arc(circle.C.x, circle.C.y, circle.RA, 0, 7);

  // line
  c.moveTo(circle.SP.x, circle.SP.y);
  c.lineTo(circle.C.x, circle.C.y);
  
  c.closePath();
  c.stroke();
};

//rotate angle in counterclockwise
var rotateCircle = function(circle, angle){
  circle.AN += angle;
  circle.SP = rotate(circle.SP, circle.C, angle);
};

var updateInertiaCircle = function(circle){
  // this.IM is inverted!!
  // Inertia=mass * radius^2
  // 12 is a constant value that can be changed
  circle.I = circle.IM ? (1 / circle.IM) * (circle.RA * circle.RA) / 12 : 0;
};

var testCollision = function(c1, c2, info){
  var status;
  
  // Circle vs circle
  //if (c1.T === "Circle" && c2.T === "Circle") {
  var vFrom1to2 = substract(c2.C, c1.C);
  var rSum = c1.RA + c2.RA;
  var dist = length(vFrom1to2);
  if (dist > Math.sqrt(rSum * rSum)) {
    //not overlapping
    return false;
  }
  if (dist !== 0) {
    // overlapping bu not same position
    var normalFrom2to1 = normalize(scale(vFrom1to2, -1));
    var radiusC2 = scale(normalFrom2to1, c2.RA);
    setInfo(rSum - dist, normalize(vFrom1to2), add(c2.C, radiusC2));
  } else {
    //same position
    if (c1.RA > c2.RA) {
      setInfo(rSum, Vec2(0, -1), add(c1.C, Vec2(0, c1.RA)));
    } else {
      setInfo(rSum, Vec2(0, -1), add(c2.C,Vec2(0, c2.RA)));
    }
  }
  return true;
};


var resolveCollision = function (s1, s2, collisionInfo) {
  if ((s1.IM === 0) && (s2.IM === 0)) {
    return;
  }

  //  correct positions
  var s1InvMass = s1.IM;
  var s2InvMass = s2.IM;
  var num = collisionInfo.D / (s1InvMass + s2InvMass) * .8; // .8 = poscorrectionrate = percentage of separation to project objects
  var correctionAmount = scale(collisionInfo.N, num);
  moveCircle(s1, scale(correctionAmount, -s1InvMass));
  moveCircle(s2, scale(correctionAmount, s2InvMass));
  
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