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

<div class="linkbuttons"><a href="{{ page.link.ghrepo }}"><img alt="Link to Syndicate github repo" src="{{ site.baseurl }}/img/GitHub-Mark-64px.png"></a></div>

# Motivation

Syndicate is an Actor-based language with features specifically
designed to help programmers organise their interactive programs.

# Trying it out

The [Syndicate github repository](https://github.com/tonyg/syndicate)
contains Syndicate implementations for both
[Racket](http://racket-lang.org/) and
[ES5](https://en.wikipedia.org/wiki/ECMAScript).

...
which includes

 - the implementation of the `#lang syndicate` language, in the
   [`syndicate` directory](https://github.com/tonyg/syndicate/tree/master/syndicate/).

 - a TCP echo server example, which listens for connections on port
   5999 by default, in
   [`syndicate/examples/echo.rkt`](https://github.com/tonyg/syndicate/tree/master/syndicate/examples/echo.rkt).
   Connect to it using, for example, `telnet localhost 5999`.

 - a handful of other examples, in
   [`syndicate/examples/`](https://github.com/tonyg/syndicate/tree/master/syndicate/examples/).

## Compiling and running the code

You will need Racket version 6.3 or later.

Once you have Racket installed, run

    raco pkg install syndicate

to install the package from the Racket package repository, or

    raco pkg install

from the root directory of the Git checkout to install the package
from a local snapshot. (Alternatively, `make link` does the same thing.)
This will make `#lang syndicate` available to programs.

At this point, you may load and run any of the example `*.rkt` files
in the
[`syndicate/examples/`](https://github.com/tonyg/syndicate/tree/master/syndicate/examples/)
directory.
