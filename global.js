// Vec2 lib
var Vec2 = (x,y) => ({x,y});
var length = v => dot(v,v)**.5;
var add = (v,w) => Vec2(v.x + w.x, v.y + w.y);
var substract = (v,w) => add(v, scale(w, -1));
var scale = (v,n) => Vec2(v.x * n, v.y * n);
var dot = (v,w) => v.x * w.x + v.y * w.y;
var cross = (v,w) => v.x * w.y - v.y * w.x;
var rotate = (v, center, angle, x = v.x - center.x, y = v.y - center.y) => Vec2(x * Math.cos(angle) - y * Math.sin(angle) + center.x, x * Math.sin(angle) + y * Math.cos(angle) + center.y);
var normalize = v => scale(v, 1 / (length(v) || 1));
var distance = (v,w) => length(substract(v,w));

// Globals
var mGravity = Vec2(0, 100);
var objects = [];

// Collision info helpers
var setInfo = function(d, n, s){
  collisionInfo = {
    D: d, // depth
    N: n, // normal
    S: s, // start
    E: add(s, scale(n, d)) // end
  }
};

/*CollisionInfo.prototype.changeDir = function(){
  this.N = this.N.scale(-1);
  var n = this.S;
  this.S = this.E;
  this.E = n;
};*/

// Init scene
Circle(Vec2(400, 1100), 800, 0, .5, .5);
for (var i = 0; i < 30; i++){
  var r1 = Circle(Vec2(Math.random() * 800, Math.random() * 450 / 2), Math.random() * 20 + 10, Math.random() * 30, Math.random(), Math.random());
}

// Loop
setInterval(
  function(){
    
    // Draw
    a.width ^= 0;
    for(var i = 0; i < objects.length; i++){
      c.strokeStyle = '#888';
      drawCircle(objects[i]);
    }
  
    // Compute collisions
    var i, j, k;
    collisionInfo = {};
    for (k = 0; k < 15; k++){
      for (i = 0; i < objects.length; i++){
        for (j = i + 1; j < objects.length; j++){
          // Test bounds (not needed if no rects)
          //if (objects[i].boundTest(objects[j])) {
            //if (objects[i].collisionTest(objects[j], collisionInfo)) {
            if(testCollision(objects[i], objects[j], collisionInfo)){
              
              //make sure the normal is always from object[i] to object[j] (can be disabled if no rects)
              //if (collisionInfo.getNormal().dot(objects[j].C.subtract(objects[i].C)) < 0) {
              //  collisionInfo.changeDir();
              //}
              resolveCollision(objects[i], objects[j], collisionInfo);
            }
          //}
        }
      }
    }
  
    // Update scene
    for (var i = 0; i < objects.length; i++){
      updateRigidShape(objects[i]);
    }
  },
  16
);


// Init rects (hidden for now)
//var r1 = new Rectangle(new Vec2(500, 200), 400, 20, 0, 0.3, 0);
//r1.rotate(2.8);
//var r2 = new Rectangle(new Vec2(200, 400), 400, 20, 0, 1, 0.5);
//var r3 = new Rectangle(new Vec2(100, 200), 200, 20, 0);
//var r4 = new Rectangle(new Vec2(10, 360), 20, 100, 0, 0, 1);
//var r1 = new Rectangle(new Vec2(Math.random() * mWidth, Math.random() * mHeight / 2), Math.random() * 50 + 10, Math.random() * 50 + 10, Math.random() * 30, Math.random(), Math.random());
//r1.V = new Vec2(0,0);