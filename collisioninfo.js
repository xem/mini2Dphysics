setInfo = function(info, d, n, s){
  info.D = d; // depth
  info.N = n; // normal
  info.S = s; // start
  info.E = s.add(n.scale(d)); // end
};

/*CollisionInfo.prototype.changeDir = function(){
  this.N = this.N.scale(-1);
  var n = this.S;
  this.S = this.E;
  this.E = n;
};*/