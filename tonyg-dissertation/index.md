---
title: PhD Dissertation of Tony Garnock-Jones
layout: page
---

# Conversational Concurrency

by **Tony Garnock-Jones**  
PhD dissertation, supervised by Matthias Felleisen  
Northeastern University, December 2017

<span id="dissertation"></span>The dissertation itself is available in two formats:

 - [PDF]({{ site.baseurl
   }}/papers/conversational-concurrency-201712310922.pdf), for
   printing or offline use. (1.8MB)

 - [Single-page HTML](html/), for reading online.

On this page, you will find a
[recording](#dissertation-defense-talk-recording) of my dissertation
defense talk, the [slides](#dissertation-defense-slides) I used for my
talk, and the [proof scripts](#proofs) accompanying the dissertation.

### Dissertation defense talk recording

I defended my thesis on the 8th of December, 2017. The talk was
recorded. There is a copy on
[YouTube](https://www.youtube.com/watch?v=w8jgUFWVD5s) (also embedded
below), and another at the
[Internet Archive](https://archive.org/details/TonyGarnockJonesDoctoralDissertationDefense8Dec2017).
(The sound is *very* quiet on the recording.)

<p class="center"><iframe src="https://www.youtube.com/embed/w8jgUFWVD5s" width="640" height="480" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe></p>

### Dissertation defense slides

The slides from my defense talk are available
[here](html/presentation.html) (also embedded below). Use the `n` and
`p` keys to move to the next and previous slide, respectively.

<p class="center"><iframe src="html/presentation.html" width="640" height="480"></iframe></p>

### Proofs

The Coq scripts representing the proofs of some of the theorems from
my dissertation will be available here shortly.

<!-- ### Abstract -->

<!-- Concurrent computations resemble conversations. In a conversation, -->
<!-- participants direct utterances at others and, as the conversation -->
<!-- evolves, exploit the known common context to advance the conversation. -->
<!-- Similarly, collaborating software components share knowledge with each -->
<!-- other in order to make progress as a group towards a common goal. -->

<!-- This dissertation studies concurrency from the perspective of -->
<!-- cooperative knowledge-sharing, taking the conversational exchange of -->
<!-- knowledge as a central concern in the design of concurrent programming -->
<!-- languages. In doing so, it makes five contributions: -->

<!--  0. It develops the idea of a common dataspace as a medium for -->
<!--     knowledge exchange among concurrent components, enabling a new -->
<!--     approach to concurrent programming. -->

<!--     While dataspaces loosely resemble both “fact spaces” from the -->
<!--     world of Linda-style languages and Erlang's collaborative model, -->
<!--     they significantly differ in many details. -->

<!--  0. It offers the first crisp formulation of cooperative, -->
<!--     conversational knowledge-exchange as a mathematical model. -->

<!--  0. It describes two faithful implementations of the model for two -->
<!--     quite different languages. -->

<!--  0. It proposes a completely novel suite of linguistic constructs for -->
<!--     organizing the internal structure of individual actors in a -->
<!--     conversational setting. -->

<!--     The combination of dataspaces with these constructs is dubbed Syndicate. -->

<!--  0. It presents and analyzes evidence suggesting that the proposed -->
<!--     techniques and constructs combine to simplify concurrent -->
<!--     programming. -->

<!-- The dataspace concept stands alone in its focus on representation and -->
<!-- manipulation of conversational frames and conversational state and in -->
<!-- its integral use of explicit epistemic knowledge. The design is -->
<!-- particularly suited to integration of general-purpose I/O with -->
<!-- otherwise-functional languages, but also applies to actor-like -->
<!-- settings more generally. -->
