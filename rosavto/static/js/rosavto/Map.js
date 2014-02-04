define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/request/xhr',
    'rosavto/Loader',
    'http://cdn.leafletjs.com/leaflet-0.7.1/leaflet-src.js',
    'StompClient'
], function (declare, lang, xhr, Loader, leaflet, stomp) {
    return declare('rosavto.Map', [Loader], {
        _lmap: {},
        _baseLayers: {},
        _overlaylayers: {},
        _legend: null,

        constructor: function (domNode, settings) {
            if (!settings.zoomControl) {
                settings.zoomControl = false;
            }

            this._lmap = new L.Map(domNode, settings);

            if (settings.legend) {
                this._legend = L.control.layers(this._baseLayers, this._overlaylayers).addTo(this._lmap);
            }

            this.buildLoader(domNode);

            this.addOsmTileLayer();
        },

        addWmsLayer: function (url, name, settings) {
            var wmsLayer = L.tileLayer.wms(url, settings);

            this._lmap.addLayer(wmsLayer);
            this._baseLayers[name] = wmsLayer;
            if (this._legend) this._legend.addBaseLayer(wmsLayer, name);
        },

        addTileLayer: function (name, url, settings) {
            var tileLayer = new L.TileLayer(url, settings);
            this._lmap.addLayer(tileLayer);
            this._baseLayers[name] = tileLayer;
            if (this._legend) this._legend.addBaseLayer(tileLayer, name);
        },

        _ngwTileLayers: [],
        addNgwTileLayer: function (name, ngwUrl, idStyle, settings) {
            var ngwTilesUrl = ngwUrl + 'style/' + idStyle + '/tms?z={z}&x={x}&y={y}',
                ngwTileLayer = new L.TileLayer(ngwTilesUrl, settings);
            this._ngwTileLayers.push(idStyle);
            this._lmap.addLayer(ngwTileLayer);
            this._overlaylayers[name] = ngwTileLayer;
            if (this._legend) this._legend.addOverlay(ngwTileLayer, name);
        },

        addOsmTileLayer: function () {
            var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                settingsOsmLayer = {
                    attribution: 'Map data © OpenStreetMap contributors'
                };

            this.addTileLayer('Openstreetmap', osmUrl, settingsOsmLayer);
        },

        createGeoJsonLayer: function (name, url, style) {
            xhr(application_root + url, {
                handleAs: 'json'
            }).then(lang.hitch(this, function (geoJson) {
                    if (geoJson.features) {
                        var layer = L.geoJson(geoJson.features, {
                            style: style,
                            pointToLayer: function (feature, latlng) {
                                return L.circle(latlng, 25, style);
                            }
                        });

                        layer.addTo(this._lmap);

                        this._overlaylayers[name] = layer;
                        if (this._legend) this._legend.addOverlay(layer, name);
                    }
                }));
        },

        addGeoJsonLayer: function (name, geoJsonLayer) {
            geoJsonLayer.addTo(this._lmap);
            this._overlaylayers[name] = geoJsonLayer;
            if (this._legend) this._legend.addOverlay(geoJsonLayer, name);
        },

        showObjectAsMarker: function (url, id, isPopup) {
            xhr(application_root + url + id, {
                handleAs: 'json'
            }).then(lang.hitch(this, function (geoJson) {
                    if (geoJson.features) {
                        var layer = new L.geoJson(geoJson.features, {
                            onEachFeature: function (feature, layer) {
                                if (isPopup) {
                                    layer.bindPopup('id: ' + feature.id);
                                }
                            }
                        });
                        this._lmap.addLayer(layer);
                    }
                }));
        },

        _realTimeLayers: {},
        _subscribeUrl: {},
        addRealtimeLayer: function (layerName, settings) {
            var layer = L.layerGroup([]).addTo(this._lmap),
                callback = lang.hitch(this, function (message) {
                    var body = JSON.parse(message.body);
                    if (body.latitude == undefined || body.longitude == undefined) {
                        this._deleteMarker(layerName, body[settings.id]);
                    } else {
                        this._renderMarker(layerName, body[settings.id], [body.latitude, body.longitude],
                            body[settings.styleField]);
                    }
                });

            this._realTimeLayers[layerName] = {
                layer: layer,
                settings: settings,
                markers: {} // Map of markers: id of entity to id of map
            };

            if (this._lmap.getZoom() >= settings.minVisibleZoom)
                this._subscribeForRealtimeLayer(callback, this._realTimeLayers[layerName].settings.subscribeUrl);

            this._lmap.on('dragend zoomend', lang.hitch(this, function () {
                var realTimeLayer = this._realTimeLayers[layerName];
                if (this._lmap.getZoom() < realTimeLayer.settings.minVisibleZoom) {
                    realTimeLayer.layer.clearLayers();
                    realTimeLayer.markers = {};
                    this._unsubscribeForRealtimeLayer();
                    return;
                }
                this._subscribeForRealtimeLayer(callback,
                    realTimeLayer.settings.subscribeUrl);
            }));
        },

        _renderMarker: function (layerName, markerId, latlng, type) {
            var realtimeLayer = this._realTimeLayers[layerName];
            if (!realtimeLayer) return;

            if (realtimeLayer.markers[markerId]) {
                realtimeLayer.layer.getLayer(realtimeLayer.markers[markerId]).setLatLng(latlng);
            } else {
                var marker = L.marker(latlng, {
                    icon: L.divIcon({
                        className: realtimeLayer.settings.styles[type].className
                    })
                });
                realtimeLayer.layer.addLayer(marker);
                realtimeLayer.markers[markerId] = L.stamp(marker);
                marker.markerId = markerId;
                marker.on('click', function (e) {
                    MonitoringCard.showCard(e.target.markerId);
                });
            }
        },

        _deleteMarker: function (layerName, markerId) {
            var realtimeLayer = this._realTimeLayers[layerName];
            if (!realtimeLayer) return;

            if (realtimeLayer.markers[markerId]) {
                realtimeLayer.layer.removeLayer(realtimeLayer.markers[markerId]);
                delete realtimeLayer.markers[markerId];
            }
        },

        _lastMapBounds: null,
        _lastSubscribedId: null,
        _subscribeForRealtimeLayer: function (callback, subscribeUrl) {
            var bounds = this._lmap.getBounds(),
                boundsHeaders = {
                    'LatitudeFrom': bounds.getSouth(),
                    'LatitudeTo': bounds.getNorth(),
                    'LongitudeFrom': bounds.getWest(),
                    'LongitudeTo': bounds.getEast()
                };

            if (bounds.equals(this._lastMapBounds)) return;

            this._lastMapBounds = bounds;

            var me = this;
            stomp.connect().then(function (client) {
                if (me._lastSubscribedId) {
                    client.unsubscribe(me._lastSubscribedId);
                    me._lastSubscribedId = null;
                }
                me._lastSubscribedId = client.subscribe(subscribeUrl, callback, boundsHeaders).id;
            });
        },

        _unsubscribeForRealtimeLayer: function () {
            var me = this;
            if (this._lastSubscribedId) {
                stomp.connect().then(function (client) {
                    client.unsubscribe(me._lastSubscribedId);
                    me._lastSubscribedId = null;
                });
            }
        },

        _customizableGeoJsonLayer: null,
        createCustomizableGeoJsonLayer: function (styles, callback) {
            if (this._customizableGeoJsonLayer) return;

            var type,
                style,
                marker;

            this._customizableGeoJsonLayer = new L.GeoJSON(null, {
                pointToLayer: function (feature, latLng) {
                    type = feature.properties.type;
                    style = styles[type];

                    if (style['Point'] && feature.geometry.type === 'Point') {
                        marker = L.marker(latLng, {icon: L.divIcon(style['Point'])});
                        return marker;
                    }
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function (e) {
                        callback.call(this.feature, e);
                    });
                }
            });

            this._lmap.addLayer(this._customizableGeoJsonLayer);
        },

        addCustomizableGeoJsonData: function (data) {
            if (!this._customizableGeoJsonLayer) return false;

            this._customizableGeoJsonLayer.addData(data);
        }
    });
});