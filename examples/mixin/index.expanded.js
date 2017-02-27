"use strict";
var G = new Syndicate.Ground(function () {
  var shiftClicked = Syndicate.Struct.makeConstructor("shiftClicked", ["fragmentId"]);

  Syndicate.UI.spawnUIDriver();

  Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
    var uiRoot = new Syndicate.UI.Anchor();

    Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(uiRoot.html('#place', '<svg id="svgroot" width="100%" height="100%"/>'), 0); }));

    Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
      var ui = new Syndicate.UI.Anchor();
      Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#svgroot',
                     '<rect id="underlay" x="0" y="0" width="100%" height="100%" fill="grey"/>',
                     -1), 0); }));
      Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(ui.event('.', 'click', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: ui.event('.', 'click', (Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        var svg = document.getElementById('svgroot');
        var pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        pt = pt.matrixTransform(svg.getScreenCTM().inverse());
        spawnRectangle(pt.x, pt.y);
      }));
    } }); });

    Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
      Syndicate.Actor.declareField(this, "x", 50);
      Syndicate.Actor.declareField(this, "y", 50);
      var ui = new Syndicate.UI.Anchor();
      Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#svgroot',
                     '<circle fill="green" r=45 cx="'+this.x+'" cy="'+this.y+'"/>',
                     0), 0); }));
      draggableMixin(this, ui);
    } }); });

    ///////////////////////////////////////////////////////////////////////////

    function spawnRectangle(x0, y0) {
      var length = 90;
      Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build(function () { {
        Syndicate.Actor.declareField(this, "x", x0 - length / 2);
        Syndicate.Actor.declareField(this, "y", y0 - length / 2);
        var ui = new Syndicate.UI.Anchor();
        Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#svgroot',
                       '<rect fill="yellow" stroke="black" stroke-width="3" width="90" height="90"'+
                       ' x="'+this.x+'" y="'+this.y+'"/>',
                       0), 0); }));
        draggableMixin(this, ui);
        Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(ui.event('.', 'mousedown', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: ui.event('.', 'mousedown', (Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
          if (e.shiftKey) { Syndicate.Dataspace.send(shiftClicked(ui.fragmentId)); }
        }));
        Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(shiftClicked(ui.fragmentId), 0); }), (function() { var _ = Syndicate.__; return { assertion: shiftClicked(ui.fragmentId), metalevel: 0 }; }), (function() {}));
      } }); });
    }

    function draggableMixin(obj, ui) {
      idle();

      function idle() {
        (function () { Syndicate.Actor.Facet.build(function () { {
          Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(ui.event('.', 'mousedown', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: ui.event('.', 'mousedown', (Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
            dragging(e.clientX - obj.x, e.clientY - obj.y);
          }));
        } }); }).call(this);
      }

      function dragging(dx, dy) {
        (function () { Syndicate.Actor.Facet.build(function () { {
          Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(uiRoot.event('.', 'mousemove', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: uiRoot.event('.', 'mousemove', (Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
            obj.x = e.clientX - dx;
            obj.y = e.clientY - dy;
          }));
          Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(uiRoot.event('.', 'mouseup', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: uiRoot.event('.', 'mouseup', _), metalevel: 0 }; }), (function() {
            idle();
          }));
        } }); }).call(this);
      }
    }
  } }); });
}).startStepping();
