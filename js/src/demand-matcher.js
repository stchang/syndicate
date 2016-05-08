var Immutable = require('immutable');
var Trie = require('./trie.js');
var Patch = require('./patch.js');
var Util = require('./util.js');

function DemandMatcher(demandSpec, supplySpec, options) {
  options = Util.extend({
    metaLevel: 0,
    onDemandIncrease: function (captures) {
      console.error("Syndicate: Unhandled increase in demand", captures);
    },
    onSupplyDecrease: function (captures) {
      console.error("Syndicate: Unhandled decrease in supply", captures);
    }
  }, options);
  this.metaLevel = options.metaLevel;
  this.onDemandIncrease = options.onDemandIncrease;
  this.onSupplyDecrease = options.onSupplyDecrease;
  this.demandSpec = demandSpec;
  this.supplySpec = supplySpec;
  this.demandPattern = Trie.projectionToPattern(demandSpec);
  this.supplyPattern = Trie.projectionToPattern(supplySpec);
  this.demandProjection = Patch.prependAtMeta(demandSpec, this.metaLevel);
  this.supplyProjection = Patch.prependAtMeta(supplySpec, this.metaLevel);
  this.demandProjectionNames = Trie.projectionNames(this.demandProjection);
  this.supplyProjectionNames = Trie.projectionNames(this.supplyProjection);
  this.currentDemand = Immutable.Set();
  this.currentSupply = Immutable.Set();
}

DemandMatcher.prototype.boot = function () {
  return Patch.sub(this.demandPattern, this.metaLevel)
    .andThen(Patch.sub(this.supplyPattern, this.metaLevel));
};

DemandMatcher.prototype.handleEvent = function (e) {
  if (e.type === "stateChange") {
    this.handlePatch(e.patch);
  }
};

DemandMatcher.prototype.handlePatch = function (p) {
  var self = this;

  var dN = self.demandProjectionNames.length;
  var sN = self.supplyProjectionNames.length;
  var addedDemand = Trie.trieKeys(Trie.project(p.added, self.demandProjection), dN);
  var removedDemand = Trie.trieKeys(Trie.project(p.removed, self.demandProjection), dN);
  var addedSupply = Trie.trieKeys(Trie.project(p.added, self.supplyProjection), sN);
  var removedSupply = Trie.trieKeys(Trie.project(p.removed, self.supplyProjection), sN);

  if (addedDemand === null) {
    throw new Error("Syndicate: wildcard demand detected:\n" +
		    self.demandSpec + "\n" +
		    p.pretty());
  }
  if (addedSupply === null) {
    throw new Error("Syndicate: wildcard supply detected:\n" +
		    self.supplySpec + "\n" +
		    p.pretty());
  }

  self.currentSupply = self.currentSupply.union(addedSupply);
  self.currentDemand = self.currentDemand.subtract(removedDemand);

  removedSupply.forEach(function (captures) {
    if (self.currentDemand.has(captures)) {
      self.onSupplyDecrease(Trie.captureToObject(captures, self.supplyProjectionNames));
    }
  });
  addedDemand.forEach(function (captures) {
    if (!self.currentSupply.has(captures)) {
      self.onDemandIncrease(Trie.captureToObject(captures, self.demandProjectionNames));
    }
  });

  self.currentSupply = self.currentSupply.subtract(removedSupply);
  self.currentDemand = self.currentDemand.union(addedDemand);
};

///////////////////////////////////////////////////////////////////////////

module.exports.DemandMatcher = DemandMatcher;
