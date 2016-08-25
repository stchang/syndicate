"use strict";
var locationRecord = Syndicate.Struct.makeConstructor('location', ["id","email","timestamp","lat","lng"]);
var findMarker = Syndicate.Struct.makeConstructor("findMarker", ["id"]);

var brokerConnection = Syndicate.Broker.brokerConnection;
var toBroker = Syndicate.Broker.toBroker;
var fromBroker = Syndicate.Broker.fromBroker;

var G = new Syndicate.Ground(function () {
  Syndicate.UI.spawnUIDriver();
  Syndicate.Timer.spawnTimerDriver();
  Syndicate.Broker.spawnBrokerClientDriver();

  Syndicate.Actor.spawnActor(function() { Syndicate.Actor.Facet.build((function () { {
    var id = Syndicate.RandomID.randomId(4, true);

    var email_element = document.getElementById('my_email');
    if (localStorage.my_email) {
      email_element.value = localStorage.my_email;
    } else {
      localStorage.my_email = email_element.value = id;
    }

    var group_element = document.getElementById('group');
    var url_group_match = /group=(.*)$/.exec(document.location.search || '');
    if (url_group_match) {
      localStorage.group = group_element.value = url_group_match[1];
    } else if (localStorage.group) {
      group_element.value = localStorage.group;
    } else {
      localStorage.group = group_element.value = 'Public';
    }

    var mapInitialized = false;
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 42, lng: -71},
      zoom: 18
    });

    var infoWindow = new google.maps.InfoWindow();
    var geocoder = new google.maps.Geocoder();

    var wsurl_base = 'wss://demo-broker.syndicate-lang.org:8443/location/';
    Syndicate.Actor.declareField(this, "wsurl", wsurl_base + group_element.value.trim());

    var watchId = ('geolocation' in navigator)
        && navigator.geolocation.watchPosition(Syndicate.Dataspace.wrap(function (pos) {
          Syndicate.Dataspace.send(locationRecord(id,
                            email_element.value.trim(),
                            +new Date(),
                            pos.coords.latitude,
                            pos.coords.longitude));
          if (!mapInitialized && map) {
            mapInitialized = true;
            map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude});
          }
        }, function (err) {
          console.error(err);
          alert(err);
        }, {
          enableHighAccuracy: true,
          timeout: 15000
        }));

    Syndicate.Actor.declareField(this, "currentLocation", null);
    var selectedMarker = null;

    Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(brokerConnection(this.wsurl), 0); }));
    Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return (this.currentLocation) ? Syndicate.Patch.assert(toBroker(this.wsurl, this.currentLocation), 0) : Syndicate.Patch.emptyPatch; }));

    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('#my_email', 'change', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('#my_email', 'change', _), metalevel: 0 }; }), (function() {
      var v = email_element.value.trim();
      if (this.currentLocation) this.currentLocation = this.currentLocation.set(1, v);
      localStorage.my_email = v;
    }));

    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('#group', 'change', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('#group', 'change', _), metalevel: 0 }; }), (function() {
      localStorage.group = group_element.value.trim();
      this.wsurl = wsurl_base + group_element.value.trim();
    }));

    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('#findMarker', 'click', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('#findMarker', 'click', (Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
      Syndicate.Dataspace.send(findMarker(document.getElementById('markerList').value));
    }));
    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('#markerList', 'change', _), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('#markerList', 'change', (Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
      Syndicate.Dataspace.send(findMarker(document.getElementById('markerList').value));
    }));

    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub((locationRecord(_, _, _, _, _)), 0); }), (function() { var _ = Syndicate.__; return { assertion: ((Syndicate._$("loc",locationRecord(_, _, _, _, _)))), metalevel: 0 }; }), (function(loc) {
      this.currentLocation = loc;
    }));

    Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(fromBroker(this.wsurl, locationRecord(_, _, _, _, _)), 0); }), (function() { var _ = Syndicate.__; return { assertion: fromBroker(this.wsurl, locationRecord((Syndicate._$("id")), (Syndicate._$("email")), _, _, _)), metalevel: 0 }; }), (function(id, email) {
var _cachedAssertion1472127196930_0 = (function() { var _ = Syndicate.__; return fromBroker(this.wsurl, locationRecord(id, email, _, _, _)); }).call(this);
{ Syndicate.Actor.Facet.build((function () { {
      var ui = new Syndicate.UI.Anchor();
      var marker = new google.maps.Marker({
        map: map,
        clickable: true,
        icon: 'https://www.gravatar.com/avatar/' + md5(email.trim().toLowerCase()) + '?s=32&d=retro'
      });
      var latestTimestamp = null;
      var latestPosition = null;
      function selectMarker() {
        selectedMarker = marker;
        updateInfoWindow();
        infoWindow.open(map, marker);
      }
      function updateInfoWindow() {
        if (selectedMarker === marker && latestPosition && latestTimestamp) {
          geocoder.geocode({'location': latestPosition}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
              infoWindow.setContent(Mustache.render(document.getElementById('info').innerHTML, {
                email: email,
                timestamp: latestTimestamp ? latestTimestamp.toString() : '',
                address: results[0].formatted_address
              }));
            }
          });
        }
      }
      Syndicate.Actor.Facet.current.addInitBlock((function() {
        marker.addListener('click', Syndicate.Dataspace.wrap(function () {
          selectMarker();
        }));
      }));
      Syndicate.Actor.Facet.current.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(ui.html('#markerList',
                     Mustache.render(document.getElementById('markerList-option').innerHTML, {
                       id: id,
                       email: email
                     })), 0); }));
      Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(findMarker(id), 0); }), (function() { var _ = Syndicate.__; return { assertion: findMarker(id), metalevel: 0 }; }), (function() {
        selectMarker();
        if (latestPosition) map.panTo(latestPosition);
      }));
      Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(fromBroker(this.wsurl, locationRecord(id, email, _, _, _)), 0); }), (function() { var _ = Syndicate.__; return { assertion: fromBroker(this.wsurl, locationRecord(id, email, (Syndicate._$("timestamp")), (Syndicate._$("lat")), (Syndicate._$("lng")))), metalevel: 0 }; }), (function(timestamp, lat, lng) {
        latestTimestamp = new Date(timestamp);
        latestPosition = {lat: lat, lng: lng};
        marker.setPosition(latestPosition);
        marker.setTitle(email + ' ' + latestTimestamp.toTimeString());
        updateInfoWindow();
      }));
      Syndicate.Actor.Facet.current.addDoneBlock((function() {
        marker.setMap(null);
        if (selectedMarker === marker) selectedMarker = null;
      }));
    }
Syndicate.Actor.Facet.current.onEvent(Syndicate.Actor.PRIORITY_NORMAL, true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(_cachedAssertion1472127196930_0, 0); }), (function() { var _ = Syndicate.__; return { assertion: _cachedAssertion1472127196930_0, metalevel: 0 }; }), (function() {})); }).bind(this)); }}));
  } }).bind(this)); });
}).startStepping();
