"use strict";
new Syndicate.Ground(function () {
  Syndicate.UI.spawnUIDriver();

  Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
    var ui = new Syndicate.UI.Anchor();
    Syndicate.Actor.declareField(this, "counter", 0);
    Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#button-label', '' + this.counter), 0); }));
    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('#counter', 'click', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('#counter', 'click', _), metalevel: 0 }; }), (function() {
      this.counter++;
    }));
  } }); });
}).startStepping();
