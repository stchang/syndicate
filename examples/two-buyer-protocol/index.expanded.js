"use strict";
var Syndicate = require('../../src/main.js');
/// -->

/// # {{ page.title }}
///
/// This is an extended two-buyer book-purchase protocol, based
/// loosely on an example given in:
///
/// > K. Honda, N. Yoshida, and M. Carbone, “Multiparty asynchronous
/// > session types,” POPL 2008.

/// ## The Scenario
///
/// A book-seller responds to requests for book prices when asked. A
/// pair of prospective buyers run through a shopping list. For each
/// book, the first buyer offers to split the cost of the book with
/// the second. If the second has enough money left, it accepts;
/// otherwise, it rejects the offer, and the first buyer tries a
/// different split. If the second buyer agrees to a split, it then
/// negotiates the purchase of the book with the book-seller.

/// ## The Protocol

/// ### Role: SELLER
///
/// When interest in `bookQuote($title, _)` appears, asserts
/// `bookQuote(title, Maybe Float)`, `false` meaning not available,
/// and otherwise an asking-price.
///
/// When interest in `order($title, $offer-price, _, _)` appears,
/// asserts `order(title, offer-price, false, false)` for "no sale",
/// otherwise `order(title, offer-price, PositiveInteger, String)`, an
/// accepted sale.

/// ### Role: BUYER
///
/// Observes `bookQuote(title, $price)` to learn prices.
///
/// Observes `order(title, offer-price, $id, $delivery-date)` to make orders.

/// ### Role: SPLIT-PROPOSER
///
/// Observes `splitProposal(title, asking-price, contribution,
/// $accepted)` to make a split-proposal and learn whether it was
/// accepted or not.

/// ### Role: SPLIT-DISPOSER
///
/// When interest in `splitProposal($title, $asking-price,
/// $contribution, _)` appears, asserts `splitProposal(title,
/// askingPrice, contribution, true)` to indicate they are willing to
/// go through with the deal, in which case they then perform the role
/// of BUYER for title/asking-price, or asserts `splitProposal(title,
/// asking-price, contribution, false)` to indicate they are unwilling
/// to go through with the deal.

/// ## The Code

/// ### Type Declarations

/// First, we declare *assertion types* for our protocol.

var bookQuote = Syndicate.Struct.makeConstructor("bookQuote", ["title","price"]);
var order = Syndicate.Struct.makeConstructor("order", ["title","price","id","deliveryDate"]);

var splitProposal = Syndicate.Struct.makeConstructor("splitProposal", ["title","price","contribution","accepted"]);

/// ### Utilities

/// This routine is under consideration for possible addition to the
/// core library.
///
function whileRelevantAssert(P) {
  (function () { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(P, 0); }))
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.observe(P), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.observe(P), metalevel: 0 }; }), (function() {})).completeBuild(); }).call(this);
}

/// ### Implementation: SELLER

function seller() {
  Syndicate.Actor.spawnActor(function() {

/// We give our actor two state variables: a dictionary recording our
/// inventory of books (mapping title to price), and a counter
/// tracking the next order ID to be allocated.
///
/// We mark each property (entry) in the `books` table as a *field* so
/// that dependency-tracking on a per-book basis is enabled. As a result,
/// when a book is sold, any client still interested in its price will
/// learn that the book is no longer available.
///
/// We do not enable dependency-tracking for either the `books` table
/// itself or the `nextOrderId` field: nothing depends on tracking
/// changes in their values.

    this.books = {};
    Syndicate.Actor.declareField(this.books, "The Wind in the Willows", 3.95);
    Syndicate.Actor.declareField(this.books, "Catch 22", 2.22);
    Syndicate.Actor.declareField(this.books, "Candide", 34.95);
    this.nextOrderId = 10001483;

/// Looking up a price yields `false` if no such book is in our
/// inventory.

    this.priceOf = function (title) {
      return (title in this.books) && Syndicate.Actor.referenceField(this.books, title);
    };

/// The seller responds to interest in bookQuotes by asserting a
/// responsive record, if one exists.

    (function () { 
Syndicate.Actor.createFacet()
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.observe(bookQuote(_, _)), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.observe(bookQuote((Syndicate._$("title")), _)), metalevel: 0 }; }), (function(title) { 
var _cachedAssertion1470621742461_0 = (function() { var _ = Syndicate.__; return Syndicate.observe(bookQuote(title, _)); }).call(this);
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(bookQuote(title, this.priceOf(title)), 0); }))
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(_cachedAssertion1470621742461_0, 0); }), (function() { var _ = Syndicate.__; return { assertion: _cachedAssertion1470621742461_0, metalevel: 0 }; }), (function() {})).completeBuild(); })).completeBuild(); }).call(this);

/// It also responds to order requests.

    (function () { 
Syndicate.Actor.createFacet()
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.observe(order(_, _, _, _)), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.observe(order((Syndicate._$("title")), (Syndicate._$("offerPrice")), _, _)), metalevel: 0 }; }), (function(title, offerPrice) {

/// We cannot sell a book we do not have, and we will not sell for
/// less than our asking price.

        var askingPrice = this.priceOf(title);
        if ((askingPrice === false) || (offerPrice < askingPrice)) {
          whileRelevantAssert(
            order(title, offerPrice, false, false));
        } else {

/// But if we can sell it, we do so by allocating an order ID and
/// replying to the orderer.

          var orderId = this.nextOrderId++;
          Syndicate.Actor.deleteField(this.books, title);

          Syndicate.Actor.spawnActor(function() {
            whileRelevantAssert(
              order(title, offerPrice, orderId, "March 9th"));
          });
        }
      })).completeBuild(); }).call(this);
  });
}

/// ### Implementation: SPLIT-PROPOSER and book-quote-requestor

function buyerA() {
  Syndicate.Actor.spawnActor(function() {
    var self = this;

/// Our actor remembers which books remain on its shopping list, and
/// tries to buy them one at a time, sharing costs with `buyerB`.

    self.titles = ["Catch 22",
                   "Encyclopaedia Brittannica",
                   "Candide",
                   "The Wind in the Willows"];

/// JavaScript's callback-oriented blocking means that we express our
/// loop in almost a tail-recursive style, using helper functions
/// `buyBooks` and `trySplit`.

    buyBooks();

    function buyBooks() {
      if (self.titles.length === 0) {
        console.log("A has bought everything they wanted!");
        return;
      }

      var title = self.titles.shift();

/// First, retrieve a quote for the title, and analyze the result.

      (function () { 
Syndicate.Actor.createFacet()
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(bookQuote(title, _), 0); }), (function() { var _ = Syndicate.__; return { assertion: bookQuote(title, (Syndicate._$("price"))), metalevel: 0 }; }), (function(price) {
          if (price === false) {
            console.log("A learns that "+title+" is out-of-stock.");
            buyBooks();
          } else {
            console.log("A learns that the price of "+title+
                        " is "+price);

/// Next, repeatedly make split offers to a SPLIT-DISPOSER until
/// either one is accepted, or the contribution from the
/// SPLIT-DISPOSER becomes pointlessly small. We start the process by
/// offering to split the price of the book evenly.

            trySplit(title, price, price / 2);
          }
        })).completeBuild(); }).call(this);
    }

    function trySplit(title, price, contribution) {
      console.log("A makes an offer to split the price of "+title+
                  " contributing "+contribution);

/// If we are about to offer to split the price, but the other buyer
/// would contribute less than 10c, then it's not worth bothering; we
/// may as well buy it ourselves. Another version of the program could
/// perform the BUYER role here.

      if (contribution > (price - 0.10)) {
        console.log("A gives up on "+title+".");
        buyBooks();
      } else {

/// Make our proposal, and wait for a response.

        (function () { 
Syndicate.Actor.createFacet()
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(splitProposal(title, price, contribution, true), 0); }), (function() { var _ = Syndicate.__; return { assertion: splitProposal(title, price, contribution, true), metalevel: 0 }; }), (function() {
              console.log("A learns that the split-proposal for "+
                          title+" was accepted");
              buyBooks();
            }))
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(splitProposal(title, price, contribution, false), 0); }), (function() { var _ = Syndicate.__; return { assertion: splitProposal(title, price, contribution, false), metalevel: 0 }; }), (function() {
              console.log("A learns that the split-proposal for "+
                          title+" was rejected");
              trySplit(title,
                       price,
                       contribution + ((price - contribution) / 2));
            })).completeBuild(); }).call(this);
      }
    }
  });
}

/// ### Implementation: SPLIT-DISPOSER and BUYER

function buyerB() {
  Syndicate.Actor.spawnActor(function() {

/// This actor maintains a record of the amount of money it has left
/// to spend.

    this.funds = 5.00;

/// It spends its time waiting for a SPLIT-PROPOSER to offer a
/// `splitProposal`.

    (function () { 
Syndicate.Actor.createFacet()
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.observe(splitProposal(_,
                                        _,
                                        _,
                                        _)), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.observe(splitProposal((Syndicate._$("title")),
                                        (Syndicate._$("price")),
                                        (Syndicate._$("theirContribution")),
                                        _)), metalevel: 0 }; }), (function(title, price, theirContribution) {
        var myContribution = price - theirContribution;
        console.log("B is being asked to contribute "+myContribution+
                    " toward "+title+" at price "+price);

/// We may not be able to afford contributing this much.

        if (myContribution > this.funds) {
          console.log("B hasn't enough funds ("+this.funds+
                      " remaining)");
          whileRelevantAssert(
            splitProposal(title, price, theirContribution, false));
        } else {

/// But if we *can* afford it, update our remaining funds and spawn a
/// small actor to handle the actual purchase now that we have agreed
/// on a split.

          var remainingFunds = this.funds - myContribution;
          console.log("B accepts the offer, leaving them with "+
                      remainingFunds+" remaining funds");
          this.funds = remainingFunds;

          Syndicate.Actor.spawnActor(function() {
            (function () { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(splitProposal(title,
                                   price,
                                   theirContribution,
                                   true), 0); }))
.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(order(title, price, _, _), 0); }), (function() { var _ = Syndicate.__; return { assertion: order(title, price, (Syndicate._$("id")), (Syndicate._$("date"))), metalevel: 0 }; }), (function(id, date) {
                console.log("The order for "+title+" has id "+id+
                            ", and will be delivered on "+date);
              })).completeBuild(); }).call(this);
          });
        }
      })).completeBuild(); }).call(this);
  });
}

/// ### Starting Configuration

new Syndicate.Ground(function () {
  seller();
  buyerA();
  buyerB();
}).startStepping();
