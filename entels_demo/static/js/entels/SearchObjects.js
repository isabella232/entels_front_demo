define([
    'dojo/_base/declare',
    'dojo/dom',
    'dojo/on',
    'dojo/parser',
    'dojo/ready',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dgrid/Grid',
    'dgrid/Keyboard',
    'dgrid/Selection',
    'dgrid/extensions/ColumnResizer',
    'dojo/text!./templates/SearchObjects.html'
], function (declare, dom, on, parser, ready, lang, array, _WidgetBase, _TemplatedMixin,
             Grid, Keyboard, Selection, ColumnResizer, template) {
    return declare('entels.SearchObjects', [_WidgetBase, _TemplatedMixin], {
        templateString: template,
        searchBtn: null,
        grid: null,

        postCreate: function () {
            var CustomGrid = declare([Grid, Keyboard, Selection, ColumnResizer]);
            this.grid = new CustomGrid({
                columns: {
                    NAME: 'Название',
                    SCADA_ID: 'Код'
                },
                selectionMode: 'single',
                cellNavigation: false
            }, 'searchResultTable');

            this._setDom();
            this._bindEvents();
        },

        _setDom: function () {
            this.searchBtn = dom.byId('searchBtn');
        },

        _bindEvents: function () {
            on(this.searchBtn, 'click', lang.hitch(this, function () {
                this._search();
            }));
        },

        _search: function () {
            var objects,
                data = [];

            objects = entels.layer.getVisibleObjects();

            array.forEach(objects, function (object) {
                data.push(object.properties);
            });

            this.grid.renderArray(data);
        }
    });
});