// Globals
var c = a.getContext('2d')
var mGravity = new Vec2(0, 100);
var objects = [];

// Init scene
new Circle(new Vec2(400, 1100), 800, 0, .5, .5);
for (var i = 0; i < 30; i++) {
  var r1 = new Circle(new Vec2(Math.random() * 800, Math.random() * 450 / 2), Math.random() * 20 + 10, Math.random() * 30, Math.random(), Math.random());
}

// Loop
setInterval(
  function (){
    
    // Draw
    a.width ^= 0;
    for(var i = 0; i < objects.length; i++){
      c.strokeStyle = '#888';
      objects[i].draw(c);
    }
  
    // Compute collisions
    var i, j, k;
    var collisionInfo = new CollisionInfo();
    for (k = 0; k < 15; k++){
      for (i = 0; i < objects.length; i++){
        for (j = i + 1; j < objects.length; j++){
          // Test bounds (not needed if no rects)
          //if (objects[i].boundTest(objects[j])) {
            //if (objects[i].collisionTest(objects[j], collisionInfo)) {
            if(testCollision(objects[i], objects[j], collisionInfo)){
              
              //make sure the normal is always from object[i] to object[j] (can be disabled if no rects)
              //if (collisionInfo.getNormal().dot(objects[j].mCenter.subtract(objects[i].mCenter)) < 0) {
              //  collisionInfo.changeDir();
              //}
              resolveCollision(objects[i], objects[j], collisionInfo);
            }
          //}
        }
      }
    }
  
    // Update scene
    var i;
    for (i = 0; i < objects.length; i++){
      objects[i].update(c);
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
//r1.mVelocity = new Vec2(0,0);