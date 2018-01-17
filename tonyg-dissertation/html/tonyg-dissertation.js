window.addEventListener('load', function () {
  function createDom(html) {
    var container = document.createElement('div');
    container.innerHTML = html;
    return container.firstChild;
  }

  var linkElement = createDom('<a class="auto-anchor">'+
                              '<span class="auto-anchor-inner">'+
                              '<span class="auto-anchor-anchor">'+
                              '⚓'+
                              '</span>'+
                              '</span>'+
                              '</a>');
  var linkElementInner = linkElement.getElementsByClassName('auto-anchor-inner')[0];
  linkElement.addEventListener('mouseleave', function (evt) {
    hideLinkElement();
  });

  function hideLinkElement() {
    if (linkElement.parentNode) {
      linkElement.parentNode.removeChild(linkElement);
    }
  }

  function hasMathJaxClass(e) {
    return ((e.nodeType === Node.ELEMENT_NODE) && e.className.startsWith('mathjax-'));
  }

  function findMathJaxContainer(e) {
    while (e) {
      if (hasMathJaxClass(e)) { return e; }
      e = e.parentNode;
    }
    return null;
  }

  function uninterestingNode(e) {
    return (e.tagName === 'A');
  }

  function placeLinkElement(evt) {
    var t = evt.target;
    t = findMathJaxContainer(t) || t;
    while (t && !t.id) {
      if (t.tagName === 'A') return;
      t = t.parentNode;
    }
    if (t) {
      if (t.tagName === 'A') return;
      var targetHasEmbeddedLabelAnchors = (t.getElementsByClassName('label-anchor').length > 0);
      if (targetHasEmbeddedLabelAnchors) {
        hideLinkElement();
      } else {
        var s = window.getComputedStyle(t);
        t.insertBefore(linkElement, t.firstChild);
        // linkElementInner.style.background = 'rgba(0,0,255,0.2)';
        linkElementInner.style.height = t.offsetHeight + 'px';
        linkElement.href = '#' + t.id;
      }
    }
  }

  var es = document.getElementsByTagName('*');
  for (var i = 0; i < es.length; i++) {
    var e = es[i];
    if (e.id) {
      if (!findMathJaxContainer(e.parentNode)) {
        e.addEventListener('mouseover', placeLinkElement);
        e.addEventListener('mouseleave', hideLinkElement);
      }
    }
  }
});
