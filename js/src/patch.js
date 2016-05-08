"use strict";

var Route = require("./route.js");
var Immutable = require("immutable");

var __ = Route.__;
var _$ = Route._$;

function Patch(added, removed) {
  this.added = added;
  this.removed = removed;
}

var emptyPatch = new Patch(Route.emptyTrie, Route.emptyTrie);
var removeEverythingPatch = new Patch(Route.emptyTrie, Route.compilePattern(true, __));
var trueLabel = Route.trieSuccess(true);

var observe = Route.makeStructureConstructor('observe', ['assertion']);
var atMeta = Route.makeStructureConstructor('atMeta', ['assertion']);
var advertise = Route.makeStructureConstructor('advertise', ['assertion']);

function prependAtMeta(p, level) {
  while (level--) {
    p = atMeta(p);
  }
  return p;
}

function stripAtMeta(p, level) {
  while (level--) {
    if (atMeta.isClassOf(p)) {
      p = p.assertion;
    } else {
      return null;
    }
  }
  return p;
}

function observeAtMeta(p, level) {
  if (level === 0) {
    return Route.compilePattern(true, observe(p));
  } else {
    return Route._union(
      Route.compilePattern(true, observe(prependAtMeta(p, level))),
      Route.compilePattern(true, atMeta(Route.embeddedTrie(observeAtMeta(p, level - 1)))));
  }
}

function _check(p) {
  if (p instanceof Patch) {
    throw new Error("Cannot construct patch pattern using an embedded patch");
  }
  return p;
}

function assert(p, metaLevel) {
  return new Patch(Route.compilePattern(true, prependAtMeta(_check(p), metaLevel || 0)),
		   Route.emptyTrie);
}

function retract(p, metaLevel) {
  return new Patch(Route.emptyTrie,
		   Route.compilePattern(true, prependAtMeta(_check(p), metaLevel || 0)));
}

function sub(p, metaLevel) {
  return new Patch(observeAtMeta(_check(p), metaLevel || 0), Route.emptyTrie);
}

function unsub(p, metaLevel) {
  return new Patch(Route.emptyTrie, observeAtMeta(_check(p), metaLevel || 0));
}

function pub(p, metaLevel) {
  return assert(advertise(_check(p)), metaLevel);
}

function unpub(p, metaLevel) {
  return retract(advertise(_check(p)), metaLevel);
}

///////////////////////////////////////////////////////////////////////////

Patch.prototype.equals = function (other) {
  if (!(other instanceof Patch)) return false;
  return Immutable.is(this.added, other.added) && Immutable.is(this.removed, other.removed);
};

Patch.prototype.isEmpty = function () {
  return this.added === Route.emptyTrie && this.removed === Route.emptyTrie;
};

Patch.prototype.isNonEmpty = function () {
  return !this.isEmpty();
};

Patch.prototype.hasAdded = function () {
  return this.added !== Route.emptyTrie;
};

Patch.prototype.hasRemoved = function () {
  return this.removed !== Route.emptyTrie;
};

Patch.prototype.lift = function () {
  return new Patch(Route.compilePattern(true, atMeta(Route.embeddedTrie(this.added))),
		   Route.compilePattern(true, atMeta(Route.embeddedTrie(this.removed))));
};

var atMetaProj = atMeta(_$);
Patch.prototype.drop = function () {
  return new Patch(Route.project(this.added, atMetaProj),
		   Route.project(this.removed, atMetaProj));
};

Patch.prototype.strip = function () {
  return new Patch(Route.relabel(this.added, function (v) { return true; }),
		   Route.relabel(this.removed, function (v) { return true; }));
};

Patch.prototype.label = function (labelValue) {
  return new Patch(Route.relabel(this.added, function (v) { return labelValue; }),
		   Route.relabel(this.removed, function (v) { return labelValue; }));
};

Patch.prototype.limit = function (bound) {
  return new Patch(Route.subtract(this.added, bound, function (v1, v2) { return Route.emptyTrie; }),
		   Route.intersect(this.removed, bound,
                                   function (v1, v2) { return Route.trieSuccess(v1); }));
};

var metaLabelSet = Immutable.Set(["meta"]);
Patch.prototype.computeAggregate = function (label, base, removeMeta /* optional flag */) {
  return new Patch(Route.subtract(this.added, base, addCombiner),
		   Route.subtract(this.removed, base, removeCombiner));

  function addCombiner(v1, v2) {
    if (removeMeta && Immutable.is(v2, metaLabelSet)) {
      return Route.trieSuccess(v1);
    } else {
      return Route.emptyTrie;
    }
  }

  function removeCombiner(v1, v2) {
    if (v2.size === 1) {
      return Route.trieSuccess(v1);
    } else {
      if (removeMeta && v2.size === 2 && v2.has("meta")) {
	return Route.trieSuccess(v1);
      } else {
	return Route.emptyTrie;
      }
    }
  }
};

Patch.prototype.applyTo = function (base) {
  return Route._union(Route.subtract(base, this.removed), this.added);
};

Patch.prototype.updateInterests = function (base) {
  return Route._union(Route.subtract(base,
                                     this.removed,
                                     function (v1, v2) { return Route.emptyTrie; }),
		      this.added,
		      function (v1, v2) { return trueLabel; });
};

Patch.prototype.unapplyTo = function (base) {
  return Route._union(Route.subtract(base, this.added), this.removed);
};

Patch.prototype.andThen = function (nextPatch) {
  return new Patch(nextPatch.updateInterests(this.added),
		   Route._union(Route.subtract(this.removed,
					       nextPatch.added,
					       function (v1, v2) { return Route.emptyTrie; }),
				nextPatch.removed,
				function (v1, v2) { return trueLabel; }));
};

function patchSeq(/* patch, patch, ... */) {
  var p = emptyPatch;
  for (var i = 0; i < arguments.length; i++) {
    p = p.andThen(arguments[i]);
  }
  return p;
}

function computePatch(oldBase, newBase) {
  return new Patch(Route.subtract(newBase, oldBase),
		   Route.subtract(oldBase, newBase));
}

function biasedIntersection(object, subject) {
  subject = Route.trieStep(subject, observe.meta.arguments.length, observe.meta);
  return Route.intersect(object, subject, function (v1, v2) { return Route.trieSuccess(v1); });
}

Patch.prototype.viewFrom = function (interests) {
  return new Patch(biasedIntersection(this.added, interests),
		   biasedIntersection(this.removed, interests));
};

Patch.prototype.unsafeUnion = function (other) {
  // Unsafe because does not necessarily preserve invariant that added
  // and removed are disjoint.
  return new Patch(Route._union(this.added, other.added),
		   Route._union(this.removed, other.removed));
};

Patch.prototype.project = function (compiledProjection) {
  return new Patch(Route.project(this.added, compiledProjection),
		   Route.project(this.removed, compiledProjection));
};

Patch.prototype.projectObjects = function (compiledProjection) {
  return [Route.projectObjects(this.added, compiledProjection),
	  Route.projectObjects(this.removed, compiledProjection)];
};

Patch.prototype.pretty = function () {
  return ("<<<<<<<< Removed:\n" + Route.prettyTrie(this.removed) + "\n" +
	  "======== Added:\n" + Route.prettyTrie(this.added) + "\n" +
	  ">>>>>>>>");
}

///////////////////////////////////////////////////////////////////////////

module.exports.Patch = Patch;
module.exports.emptyPatch = emptyPatch;
module.exports.removeEverythingPatch = removeEverythingPatch;

module.exports.observe = observe;
module.exports.atMeta = atMeta;
module.exports.advertise = advertise;

module.exports.prependAtMeta = prependAtMeta;
module.exports.stripAtMeta = stripAtMeta;
module.exports.observeAtMeta = observeAtMeta;
module.exports.assert = assert;
module.exports.retract = retract;
module.exports.sub = sub;
module.exports.unsub = unsub;
module.exports.pub = pub;
module.exports.unpub = unpub;

module.exports.patchSeq = patchSeq;
module.exports.computePatch = computePatch;
module.exports.biasedIntersection = biasedIntersection;
