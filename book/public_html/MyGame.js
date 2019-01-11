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


