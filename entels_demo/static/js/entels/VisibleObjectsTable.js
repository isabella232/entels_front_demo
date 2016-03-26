define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/query',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/on',
    'dgrid/Grid',
    'dgrid/Keyboard',
    'dgrid/Selection',
    'entels/Dialog'
], function (declare, array, query, topic, array, lang, html, _Widget,
             _TemplatedMixin, _WidgetsInTemplateMixin, on,
             Grid, Keyboard, Selection, Dialog) {
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

            // Create a new constructor by mixing in the components
            var CustomGrid = declare([Grid, Keyboard, Selection]);

            // Now, create an instance of our custom grid which
            // have the features we added!
            var grid = new CustomGrid({
                columns: {
                    NAME: 'Название',
                    SCADA_ID: 'Код'
                },
                // for Selection; only select a single row at a time
                selectionMode: 'single',
                // for Keyboard; allow only row-level keyboard navigation
                cellNavigation: false
            }, 'visibleObjectsTable');
            grid.renderArray(data);

            dialog.show();
        }
    });
});