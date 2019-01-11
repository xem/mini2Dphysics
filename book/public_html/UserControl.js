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