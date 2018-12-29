// Vec2 lib
Vec2 = (x,y) => ({x,y});

length = v => dot(v,v)**.5;

add = (v,w) => Vec2(v.x + w.x, v.y + w.y);

substract = (v,w) => add(v, scale(w, -1));

scale = (v,n) => Vec2(v.x * n, v.y * n);

dot = (v,w) => v.x * w.x + v.y * w.y;

cross = (v,w) => v.x * w.y - v.y * w.x;

rotate = (v, center, angle) => {
  var r = [];
  var x = v.x - center.x;
  var y = v.y - center.y;
  r[0] = x * Math.cos(angle) - y * Math.sin(angle);
  r[1] = x * Math.sin(angle) + y * Math.cos(angle);
  r[0] += center.x;
  r[1] += center.y;
  return Vec2(r[0], r[1]);
};

normalize = v => scale(v, 1 / (length(v) || 1));

distance = (v,w) => length(substract(v,w));