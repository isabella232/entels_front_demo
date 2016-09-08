<%block name="title">Карта на всю страницу</%block>

<%inherit file="../_master.mako"/>

<%block name="html_attrs">class="full-screen"</%block>

<%block name="content">
    <div class="map-container">
        <%include file="sidebar.mako"/>
        <div id="map">
            <p class="loaded-status">Построение демо-карты...</p>
        </div>
    </div>
</%block>


<%block name="inlineScripts">
    <script src="${request.static_url('entels_demo:static/js/pages/entels_map.js')}"></script>
</%block>