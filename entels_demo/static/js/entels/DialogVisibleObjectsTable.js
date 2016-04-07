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

        constructor: function (objectsLayer) {
            this._objectsLayer = objectsLayer;
            this._bindEvents();
        },

        _bindEvents: function () {
            topic.subscribe('entels/open/visible-objects-table', lang.hitch(this, function () {
                this.open();
            }));
        },

        open: function () {
            var dialog = new Dialog({
                    title: 'Отображаемые объекты'
                }),
                objects,
                data = [];

            objects = this._objectsLayer.getVisibleObjects();

            array.forEach(objects, function (object) {
                data.push(object.properties);
            });

            var CustomGrid = declare([Grid, Keyboard, Selection, ColumnResizer]);
            var grid = new CustomGrid({
                id: 'visibleObjectsTable',
                columns: {
                    SCADA_ID: 'Код',
                    NAME: 'Название'
                },
                selectionMode: 'single',
                cellNavigation: false
            }, 'visibleObjectsTable');

            grid.objects = {};
            
            aspect.after(grid, "renderRow", function (row, args) {
                var feature = args[0],
                    state = feature.__type;
                domAttr.set(row, 'data-state', state);
                domClass.add(row, 'state-' + state);
                grid.objects[feature.SCADA_ID] = row;
                return row;
            });

            grid.renderArray(data);

            var changedSubscriber = topic.subscribe('map/objects/style/changed', function (id, state) {
                var row = grid.objects[id];
                if (row) {
                    domAttr.set(row, 'data-state', state);
                    domClass.add(row, 'state-' + state);
                }
            });

            aspect.before(dialog, "hide", function () {
                console.log(changedSubscriber);
            });

            dialog.show();
        }
    });
});