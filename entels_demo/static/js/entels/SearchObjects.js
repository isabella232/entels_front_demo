define([
    'dojo/_base/declare',
    'dojo/dom',
    'dojo/on',
    'dojo/parser',
    'dojo/ready',
    'dojo/topic',
    'dojo/dom-attr',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dgrid/Grid',
    'dgrid/Keyboard',
    'dgrid/Selection',
    'dgrid/extensions/ColumnResizer',
    'dojo/text!./templates/SearchObjects.html'
], function (declare, dom, on, parser, ready, topic, domAttr, lang, array, _WidgetBase, _TemplatedMixin,
             Grid, Keyboard, Selection, ColumnResizer, template) {
    return declare('entels.SearchObjects', [_WidgetBase, _TemplatedMixin], {
        templateString: template,
        searchBtn: null,
        grid: null,
        layersInfo: null,

        constructor: function () {
            topic.subscribe('entels/layersInfo/ready', lang.hitch(this, function (map, layersInfo) {
                this.map = map;
                this.layersInfo = layersInfo;
            }));
        },

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
            this.filterCode = dom.byId('searchByCode');
            this.filterName = dom.byId('searchByName');
        },

        _bindEvents: function () {
            on(this.searchBtn, 'click', lang.hitch(this, function () {
                this._search();
            }));
            this.grid.on('.dgrid-row:click', lang.hitch(this, function (event) {
                var feature = this.grid.row(event).data;
                if (feature._geometry) {
                    this.map._lmap.setView(L.latLng(feature._geometry[1], feature._geometry[0]), 15);
                }
            }));
        },

        _search: function () {
            var layerId = this.layersInfo.getLayersIdByKeynames(['objects'])[0],
                filters = this._getFilters(),
                data = [],
                features,
                row_data;

            this.grid.refresh();

            this.layersInfo._ngwServiceFacade.findLayerObjects(layerId, filters)
                .then(lang.hitch(this, function (objects) {
                    features = objects.features;
                    array.forEach(features, function (feature) {
                        row_data = feature.properties;
                        row_data._geometry = feature.geometry.coordinates[0];
                        data.push(row_data);
                    }, this);
                    this.grid.renderArray(data);
                }));
        },

        _getFilters: function () {
            var code = domAttr.get(this.filterCode, 'value'),
                name = domAttr.get(this.filterName, 'value'),
                filters = {
                    'SCADA_ID': code,
                    'NAME': name
                };

            return filters;
        }
    });
});