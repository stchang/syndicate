var svg = d3.select("svg#conversation-animation"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
           .distance(function(d) { return 200 / d.value; })
           .id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(0, 0))
    .on("tick", function () {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });

function obs(x) { return "(observe " + x + ")"; }
function entry(n,a) { return "(dns-entry " + n + " " + a + ")"; }
function laterThan(t) { return "(laterThan " + t + ")"; }

function mkProcess(n,c) { return {type: 'process', id: n, color: c}; }
function mkAssertion(n) { return {type: 'assertion', id: n}; }
function mkLink(s,t,v) { return {source: s, target: t, value: v || 1}; }

var matchWeight = 10;

var graph = {
  nodes: [
    mkProcess("Timer", "#FFC080"),
    mkProcess("Cache", "#C0C0FF"),
    mkProcess("Server", "#F0FFC0"),
    mkAssertion(obs(obs(entry("*","*")))),
    mkAssertion(obs(obs(laterThan("*"))))
  ],
  links: [
    mkLink("Timer", obs(obs(laterThan("*")))),
    mkLink("Cache", obs(obs(entry("*","*")))),
    mkLink("Server", obs(obs(entry("*","*")))),
  ]
};

var clientCounter = 1;
function clickHandler() {
  var currentCounter = clientCounter;
  clientCounter++;
  var c = "Client" + currentCounter;
  var n = "name" + currentCounter;

  graph.nodes.push(mkProcess(c, "#FFC0C0"));
  graph.nodes.push(mkAssertion(entry(n,"127.0.0."+currentCounter)));
  graph.nodes.push(mkAssertion(obs(entry(n,"*"))));
  graph.nodes.push(mkAssertion(obs(laterThan(currentCounter))));

  graph.links.push(mkLink("Cache", obs(entry(n,"*"))));
  graph.links.push(mkLink("Server", entry(n,"127.0.0."+currentCounter)));
  graph.links.push(mkLink(c, obs(entry(n,"*"))));
  graph.links.push(mkLink("Cache", obs(laterThan(currentCounter))));

  graph.links.push(mkLink(entry(n,"127.0.0."+currentCounter), obs(entry(n,"*")), matchWeight));
  graph.links.push(mkLink(obs(entry(n,"*")), obs(obs(entry("*","*"))), matchWeight));
  graph.links.push(mkLink(obs(laterThan(currentCounter)), obs(obs(laterThan("*"))), matchWeight));

  setTimeout(function () {
    graph.nodes.splice(graph.nodes.findIndex(function (n) { return n.id === c; }), 1);
    graph.links.splice(graph.links.findIndex(function (l) { return l.source.id === c; }), 1);
    setupGraph();
  }, 3000);

  setupGraph();
}

svg.on("click", clickHandler);
svg.on("doubleclick", clickHandler);

var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
    link = g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link"),
    node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

function setupGraph() {
  node = node.data(graph.nodes, function(d) { return d.id;});
  node.exit().remove();

  var group = node.enter().append("g")
      .attr("class", function(d) { return d.type; })
      .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

  group.append("circle")
    .attr("r", function(d) { return d.type === "process" ? 60 : 5 })
    .attr("fill", function(d) { return d.color || "red"; })

  group.append("text")
    .attr("stroke", "none")
    .attr("text-anchor", function(d) { return d.type === "process" ? "middle" : "start"; })
    .attr("dx", function(d) { return d.type === "process" ? 0 : 12 })
    .attr("dy", ".35em")
    .text(function(d) { return d.id; });

  node = group.merge(node);

  link = link.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });
  link.exit().remove();
  link = link.enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
    .merge(link);

  // Update and restart the simulation.
  simulation.nodes(graph.nodes);
  simulation.force("link").links(graph.links);
  simulation.alpha(1).restart();
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

setupGraph();
