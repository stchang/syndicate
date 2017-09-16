"use strict";
importScripts("../../dist/syndicate.js");

var G = new Syndicate.WorkerGround(function () {
  Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
    var ui = new Syndicate.UI.Anchor();
    Syndicate.Actor.declareField(this, "counter", 0);

    Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#counter-holder', '<div><p>The current count is: '+this.counter+'</p></div>'), 1); }));

    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub('bump_count', 1); }), (function() { var _ = Syndicate.__; return { assertion: 'bump_count', metalevel: 1 }; }), (function() {
      this.counter++;
    }));
  } }); });
});

G.startStepping();
