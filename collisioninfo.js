setInfo = function (info, d, n, s) {
  info.mDepth = d;
  info.mNormal = n;
  info.mStart = s;
  info.mEnd = s.add(n.scale(d));
};

/**
 * change the direction of normal
 * @memberOf CollisionInfo
 * @returns {void}
 */

/*CollisionInfo.prototype.changeDir = function () {
  this.mNormal = this.mNormal.scale(-1);
  var n = this.mStart;
  this.mStart = this.mEnd;
  this.mEnd = n;
};*/