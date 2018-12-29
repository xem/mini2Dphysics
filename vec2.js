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