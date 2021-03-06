"use strict";

var Immutable = require('immutable');
var Dataspace = require('./dataspace.js').Dataspace;

function Ground(bootFn) {
  var self = this;
  this.stepperId = null;
  this.stepping = false;
  this.startingFuel = 100;
  this.baseStack = Immutable.List.of({ dataspace: this, activePid: -1 });
  Dataspace.withDataspaceStack(this.baseStack, function () {
    self.dataspace = new Dataspace(bootFn);
  });
}

Ground.prototype.step = function () {
  var self = this;
  return Dataspace.withDataspaceStack(this.baseStack, function () {
    return self.dataspace.step();
  });
};

Ground.prototype.checkPid = function (pid) {
  if (pid !== -1) console.error('Weird pid in Ground', pid);
};

Ground.prototype.markRunnable = function (pid) {
  this.checkPid(pid);
  this.startStepping();
};

Ground.prototype.startStepping = function () {
  var self = this;
  if (this.stepperId) return;

  if (this.stepping) return;
  this.stepping = true;
  try {
    var stillBusy = false;
    for (var fuel = this.startingFuel; fuel > 0; fuel--) {
      stillBusy = this.step();
      if (!stillBusy) break;
    }
    if (stillBusy) {
      this.stepperId = setTimeout(function () {
        self.stepperId = null;
        self.startStepping();
      }, 0);
    }
  } catch (e) {
    this.stepping = false;
    throw e;
  }
  this.stepping = false;

  return this; // because the syndicatec compiler chains startStepping after the ctor
};

Ground.prototype.stopStepping = function () {
  if (this.stepperId) {
    clearTimeout(this.stepperId);
    this.stepperId = null;
  }
};

Ground.prototype.kill = function (pid, exn) {
  this.checkPid(pid);
  console.log("Ground dataspace terminated");
  this.stopStepping();
};

Ground.prototype.enqueueAction = function (pid, action) {
  this.checkPid(pid);

  switch (action.type) {
  case 'stateChange':
    if (action.patch.isNonEmpty()) {
      console.error('You have subscribed to a nonexistent event source.',
		    action.patch.pretty());
    }
    break;

  case 'message':
    console.error('You have sent a message into the outer void.', action);
    break;

  default:
    console.error('Internal error: unexpected action at ground level', action);
    break;
  }
};

///////////////////////////////////////////////////////////////////////////

module.exports.Ground = Ground;
