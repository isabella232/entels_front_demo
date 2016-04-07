define([
        'dojo/query',
        'dojo/on',
        'dojo/dom-class',
        'dojo/dom-attr',
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/request/xhr',
        'entels/Loader',
        'dojo/topic',
        'dojox/lang/functional/object',
        'entels/Constants',
        'entels/VisibleObjectsTable'
    ],
    function (query, on, domClass, domAttr, declare, lang, array, xhr, Loader,
              topic, object, Constants, VisibleObjectsTable) {
        var _mapSidebar = L.Control.Sidebar.extend({
            _onClick: function () {
                var isActive = L.DomUtil.hasClass(this, 'active'),
                    noOpenable = L.DomUtil.hasClass(this, 'no-openable');

                if (noOpenable) {
                    var dataTrigger = domAttr.get(this, 'data-trigger');
                    if (dataTrigger) {
                        topic.publish(dataTrigger);
                    }
                    return false;
                }

                if (isActive) {
                    this._sidebar.close();
                } else {
                    this._sidebar.open(this.querySelector('a').hash.slice(1));
                }
            }
        });

        L.Control.MapSidebar = function (id, options) {
            return new _mapSidebar(id, options);
        };

        return declare('entels.MapSidebar', null, {
            _sidebar: null,

            constructor: function (divId, map, objectsLayer) {
                var visibleObjectsTable;

                domClass.remove(divId, 'unactive');
                this._sidebar = L.Control.MapSidebar(divId).addTo(map._lmap);

                visibleObjectsTable = new VisibleObjectsTable('sidebarVisibleObjectsTable', objectsLayer);

                this._sidebar.on('content', lang.hitch(this, function (sidebarEventObject) {
                    var id = sidebarEventObject.id;
                    if (id === 'visibleObjects') {
                        setTimeout(function () {
                            visibleObjectsTable.activate();
                        }, 1000);
                    } else {
                        visibleObjectsTable.deactivate();
                    }
                }));

                this._sidebar.on('closing', lang.hitch(this, function (sidebarEventObject) {
                    visibleObjectsTable.deactivate();
                }));
            }
        });
    });