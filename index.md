---
title: Home
layout: page
class: frontpage
link:
  ghrepo: 'https://github.com/tonyg/syndicate'
---

**noun**  
/ˈsindikit/

1. a self-organizing group of individuals, companies, corporations or
   entities formed to transact some specific business, to pursue or
   promote a shared interest. <small>—[Wikipedia](https://en.wikipedia.org/wiki/Syndicate)</small>

# Motivation

Every interactive program needs some way of

 - representing the *conversations* it is having as *concurrent
   components*

 - *mapping incoming events* to these components

 - managing the *shared understanding* that the components are
   building as they work towards the program's goal

 - cleaning up shared state after *partial failure* of a component

 - *scoping* interactions and shared state inside the program

Existing programming languages lack linguistic support for these
requirements, leaving the programmer to fend for themselves.

Syndicate is a language designed to help organise interactive
programs.

# Features

Syndicate is an Actor-based language offering

 - pub/sub pattern-based message routing, for mapping events to actors

 - *dataspaces*, stores for semi-structured data, for managing shared
   state

 - *state change notifications* for keeping actors informed of changes
   in dataspaces

 - integrated techniques for registering and discovering services and
   for cleaning up after both graceful and unexpected actor failures

 - recursive layering of groups of actors, each group with a private
   dataspace of its own, for organising larger programs

Together, these features help address the above challenges.

# Code

Syndicate is implemented both for [Racket](http://racket-lang.org/)
and for [ES5](https://en.wikipedia.org/wiki/ECMAScript).

<a href="{{ page.link.ghrepo }}"><img class="leftfloat" alt="Link to Syndicate github repo" src="{{ site.baseurl }}/img/GitHub-Mark-64px.png"></a>
The [Syndicate github repository]({{ page.link.ghrepo }}) contains
implementations along with some larger example programs.

<div class="clear"></div>

# Papers

<a href="{{ site.baseurl }}/papers/from-events-to-reactions-a-progress-report-20160301-1747.pdf"><img class="leftfloat" src="{{ site.baseurl }}/img/pdf_icon_gen_48x49.png"></a>
Tony Garnock-Jones, [“From Events To Reactions: A Progress Report”]({{
site.baseurl
}}/papers/from-events-to-reactions-a-progress-report-20160301-1747.pdf),
In: Proc. 9th Int. Workshop on Programming Language Approaches to
Concurrency and Communication-cEntric Software (PLACES 2016), April
2016, Eindhoven, Netherlands.

<div class="clear"></div>

<a href="{{ site.baseurl }}/papers/coordinated-concurrent-programming-in-syndicate-20160111-1409.pdf"><img class="leftfloat" src="{{ site.baseurl }}/img/pdf_icon_gen_48x49.png"></a>
Tony Garnock-Jones and Matthias Felleisen,
[“Coordinated Concurrent Programming in Syndicate”]({{ site.baseurl
}}/papers/coordinated-concurrent-programming-in-syndicate-20160111-1409.pdf),
In: Proc. 25th European Symposium on Programming (ESOP 2016), April
2016, Eindhoven, Netherlands.

<div class="clear"></div>
