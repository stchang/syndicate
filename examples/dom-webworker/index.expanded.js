"use strict";
document.addEventListener('DOMContentLoaded', function () {
  var G = new Syndicate.Ground(function () {
    Syndicate.UI.spawnUIDriver();

    Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
      var ui = new Syndicate.UI.Anchor();
      Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.observe('bump_count'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.observe('bump_count'), metalevel: 0 }; }), (function() {
var _cachedAssertion1505589933589_0 = (function() { var _ = Syndicate.__; return Syndicate.observe('bump_count'); }).call(this);
{ Syndicate.Actor.Facet.build(function () { { // wait for the worker to boot and start listening
        Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#clicker-holder',
                       '<button><span style="font-style: italic">Click me!</span></button>'), 0); }));
      }
Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(_cachedAssertion1505589933589_0, 0); }), (function() { var _ = Syndicate.__; return { assertion: _cachedAssertion1505589933589_0, metalevel: 0 }; }), (function() {})); }); }}));
      Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('#clicker-holder > button', 'click', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('#clicker-holder > button', 'click', _), metalevel: 0 }; }), (function() {
        Syndicate.Dataspace.send('bump_count');
      }));
    } }); });

    Syndicate.Dataspace.spawn(new Syndicate.Worker('worker.expanded.js'));
  }).startStepping();

  G.dataspace.setOnStateChange(function (mux, patch) {
    document.getElementById('spy-holder').innerText = Syndicate.prettyTrie(mux.routingTable);
  });
});
