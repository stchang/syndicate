---
title: Home
layout: page
class: frontpage
link:
  ghrepo: 'https://github.com/tonyg/syndicate'
  docs: 'http://docs.racket-lang.org/syndicate@syndicate/index.html'
---

**noun**  
/ˈsindikit/

1. a self-organizing group of individuals, companies, corporations or
   entities formed to transact some specific business, to pursue or
   promote a shared interest.
   <small>—[Wikipedia](https://en.wikipedia.org/wiki/Syndicate)</small>

<div></div>

<!-- # Motivation -->

<!-- Every interactive program needs some way of -->

<!--  - representing the *conversations* it is having as *concurrent -->
<!--    components* -->

<!--  - *mapping incoming events* to these components -->

<!--  - managing the *shared understanding* that the components are -->
<!--    building as they work towards the program's goal -->

<!--  - cleaning up shared state after *partial failure* of a component -->

<!--  - *scoping* interactions and shared state inside the program -->

<!-- Existing programming languages lack linguistic support for these -->
<!-- requirements, leaving the programmer to fend for themselves. -->

<!-- Syndicate is a language designed to help organise interactive -->
<!-- programs. -->

## Overview

Syndicate is an Actor-based programming language offering

 - pub/sub pattern-based message routing, for mapping events to actors

 - *dataspaces*, stores for semi-structured data, for managing shared
   state

 - *state change notifications* for keeping actors informed of changes
   in dataspaces

 - integrated techniques for registering and discovering services and
   for cleaning up after both graceful and unexpected actor failures

 - recursive layering of groups of actors, each group with a private
   dataspace of its own, for organising larger programs

<!-- Together, these features help address the above challenges. -->

Together, these features help programmers organise their interactive programs.

## Example

These two actors implement a toy “bank account” actor that listens for
`deposit` messages and maintains an `account` balance record in the
shared dataspace. The first is written using Syndicate implemented for
Racket, and the second using Syndicate for JavaScript.

{% capture racket_example1 %}{% include frontpage_racket_example1.md %}{% endcapture %}
{% capture javascript_example1 %}{% include frontpage_javascript_example1.md %}{% endcapture %}
{% capture racket_example2 %}{% include frontpage_racket_example2.md %}{% endcapture %}
{% capture javascript_example2 %}{% include frontpage_javascript_example2.md %}{% endcapture %}

<div class="frontpage_code_examples">
{{ racket_example1 | markdownify }}
{{ javascript_example1 | markdownify }}
</div>

The next two implement a client for the “bank account”. Each time the
balance in the shared dataspace changes, they print a message to the
console.

<div class="frontpage_code_examples">
{{ racket_example2 | markdownify }}
{{ javascript_example2 | markdownify }}
</div>

The full code for the Racket example is
[bank-account.rkt](https://github.com/tonyg/syndicate/blob/master/racket/syndicate/examples/actor/bank-account.rkt),
and for the JavaScript example,
[demo-bankaccount.js](https://github.com/tonyg/syndicate/blob/master/js/compiler/demo-bankaccount.js).

## Live Syndicate/js demos

[This page](examples/) links to in-browser runnable demos (and source
code) of Syndicate/js programs.

## Install

Follow the instructions [here](install/).

## Source Code

Syndicate is implemented both for [Racket](http://racket-lang.org/)
and for [JavaScript](https://en.wikipedia.org/wiki/ECMAScript).

<a href="{{ page.link.ghrepo }}"><img class="leftfloat" alt="Link to Syndicate github repo" src="{{ site.baseurl }}/img/GitHub-Mark-64px.png"></a>
The [Syndicate github repository]({{ page.link.ghrepo }}) contains
implementations along with some larger example programs.

<div class="clear"></div>

## Documentation

The system is still somewhat in flux, and documentation is still being
written. My [dissertation](tonyg-dissertation/) has a chapter
describing the Racket implementation of Syndicate and a chapter
including many examples demonstrating idioms of Syndicate programming.

<!-- A draft of the documentation for the Racket implementation of -->
<!-- Syndicate is available [here]({{ page.link.docs }}). -->

## Dissertation

A [resource page](tonyg-dissertation/) is available, including links
to the PDF and HTML versions of the dissertation document, a recording
of my defense talk, and the corresponding slides.

<a href="{{ site.baseurl }}/papers/conversational-concurrency-201712310922.pdf"><img class="leftfloat" src="{{ site.baseurl }}/img/pdf_icon_gen_48x49.png"></a>
Tony Garnock-Jones, [“Conversational Concurrency”]({{ site.baseurl
}}/papers/conversational-concurrency-201712310922.pdf), PhD
dissertation, December 2017, College of Computer and Information
Science, Northeastern University, Boston, Massachusetts. ([PDF]({{
site.baseurl }}/papers/conversational-concurrency-201712310922.pdf);
[HTML](tonyg-dissertation/html/); [Resources](tonyg-dissertation/))

<div class="clear"></div>

## Papers

<a href="{{ site.baseurl }}/papers/from-events-to-reactions-a-progress-report-20160301-1747.pdf"><img class="leftfloat" src="{{ site.baseurl }}/img/pdf_icon_gen_48x49.png"></a>
Tony Garnock-Jones, [“From Events To Reactions: A Progress Report”]({{
site.baseurl
}}/papers/from-events-to-reactions-a-progress-report-20160301-1747.pdf),
In: Proc. PLACES 2016 (workshop), April 2016, Eindhoven, Netherlands. ([PDF]({{ site.baseurl }}/papers/from-events-to-reactions-a-progress-report-20160301-1747.pdf); [Slides]({{ site.baseurl }}/papers/places-2016-slides.pdf))

<div class="clear"></div>

<a href="{{ site.baseurl }}/papers/coordinated-concurrent-programming-in-syndicate-20160111-1409.pdf"><img class="leftfloat" src="{{ site.baseurl }}/img/pdf_icon_gen_48x49.png"></a>
Tony Garnock-Jones and Matthias Felleisen,
[“Coordinated Concurrent Programming in Syndicate”]({{ site.baseurl
}}/papers/coordinated-concurrent-programming-in-syndicate-20160111-1409.pdf),
In: Proc. ESOP 2016, April 2016, Eindhoven, Netherlands. ([PDF]({{ site.baseurl }}/papers/coordinated-concurrent-programming-in-syndicate-20160111-1409.pdf); [Slides]({{ site.baseurl }}/papers/esop-2016-slides.pdf))

<div class="clear"></div>

<a href="{{ site.baseurl }}/papers/network-as-language-construct-20140117-1204.pdf"><img class="leftfloat" src="{{ site.baseurl }}/img/pdf_icon_gen_48x49.png"></a>
Tony Garnock-Jones, Sam Tobin-Hochstadt, and Matthias Felleisen,
[“The Network as a Language Construct”]({{ site.baseurl
}}/papers/network-as-language-construct-20140117-1204.pdf),
In: Proc. ESOP 2014, April 2016, Eindhoven, Netherlands. ([PDF]({{ site.baseurl }}/papers/network-as-language-construct-20140117-1204.pdf); [Slides]({{ site.baseurl }}/papers/esop-2014-slides.pdf))

<div class="clear"></div>

## Contact

Please feel free to email me at <a href="mailto:tonyg@leastfixedpoint.com">tonyg@leastfixedpoint.com</a>.
