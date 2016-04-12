define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/query',
    'dojo/topic',
    'dojo/aspect',
    'dojo/_base/lang',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/on',
    'dgrid/Grid',
    'dgrid/Keyboard',
    'dgrid/Selection',
    'dgrid/extensions/ColumnResizer',
    'entels/Dialog'
], function (declare, array, query, topic, aspect, lang, domAttr, domClass, _Widget,
             _TemplatedMixin, _WidgetsInTemplateMixin, on,
             Grid, Keyboard, Selection, ColumnResizer, Dialog) {
    return declare([], {
        _objectsLayer: null,
        _objectChangedHandler: null,
        _objectsRenderedHandler: null,
        _grid: null,

        constructor: function (divId, objectsLayer) {
            this._objectsLayer = objectsLayer;
            
            var CustomGrid = declare([Grid, Keyboard, Selection, ColumnResizer]);
            this._grid = new CustomGrid({
                id: 'visibleObjectsTable',
                columns: {
                    SCADA_ID: 'Код',
                    NAME: 'Название'
                },
                selectionMode: 'single',
                cellNavigation: false
            }, divId);
            
            this._grid.objects = {};
            
            aspect.after(this._grid, "renderRow", lang.hitch(this, function (row, args) {
                var feature = args[0],
                    state = feature.__type;
                domAttr.set(row, 'data-state', state);
                domClass.add(row, 'state-' + state);
                this._grid.objects[feature.SCADA_ID] = row;
                return row;
            }));

            this._grid.on('.dgrid-row:click', lang.hitch(this, function (event) {
                var feature = this._grid.row(event).data;
                if (feature._geometry) {
                    objectsLayer._map.setView(L.latLng(feature._geometry[1], feature._geometry[0]), 15);
                }
            }));
        },
        
        activate: function () {
            this.fillObjects();
            this._objectChangedHandler = topic.subscribe('map/objects/style/changed', lang.hitch(this, function (id, state) {
                var row = this._grid.objects[id],
                    oldState;
                if (row) {
                    oldState = domAttr.get(row, 'data-state');
                    domClass.remove(row, 'state-' + oldState);
                    domAttr.set(row, 'data-state', state);
                    domClass.add(row, 'state-' + state);
                }
            }));
            
            this._objectsRenderedHandler = topic.subscribe('map/objects/rendered', lang.hitch(this, function () {
                this.fillObjects();
            }));
        },
        
        deactivate: function () {
            if (this._objectChangedHandler) {
                this._objectChangedHandler.remove();
            }
            if (this._objectsRenderedHandler) {
                this._objectChangedHandler.remove();
            }
            this.clear();
        },
        
        fillObjects: function () {
            var data = [],
                objects = this._objectsLayer.getVisibleObjects(),
                row_data;
            
            array.forEach(objects, function (object) {
                row_data = object.properties;
                row_data._geometry = object.geometry.coordinates[0];
                data.push(row_data);
            });
            
            this._grid.objects = {};

            this._grid.refresh();
            this._grid.renderArray(data);
        },
        
        clear: function () {
            this._grid.refresh();
            this._grid.renderArray([]);
        }
    });
});