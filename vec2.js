// Vec2 lib
Vec2 = (x,y) => ({x,y});
length = v => dot(v,v)**.5;
add = (v,w) => Vec2(v.x + w.x, v.y + w.y);
substract = (v,w) => add(v, scale(w, -1));
scale = (v,n) => Vec2(v.x * n, v.y * n);
dot = (v,w) => v.x * w.x + v.y * w.y;
cross = (v,w) => v.x * w.y - v.y * w.x;
rotate = (v, center, angle, x = v.x - center.x, y = v.y - center.y) => Vec2(x * Math.cos(angle) - y * Math.sin(angle) + center.x, x * Math.sin(angle) + y * Math.cos(angle) + center.y);
normalize = v => scale(v, 1 / (length(v) || 1));
distance = (v,w) => length(substract(v,w));