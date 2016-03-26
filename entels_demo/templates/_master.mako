<!DOCTYPE html>
<html <%block name="html_attrs"/>>
<head>
    <title><%block name="title"/></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

    <link rel="icon" type="image/png" href="${request.static_url('entels_demo:static/nextgis-favicon-16_16.png')}">

    <link type="text/css" rel="stylesheet"
          href="${request.static_url('entels_demo:static/contrib/materialize/css/customize.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('entels_demo:static/js/leaflet/leaflet.easybutton/easy-button.css')}"/>
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/js/leaflet/leaflet.css')}"/>
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/css/entels/objects-icons.css')}"/>
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/css/entels/styles.css')}"/>
    <link rel="stylesheet"
          href="${request.static_url('entels_demo:static/js/leaflet/leaflet.tooltip/leaflet.tooltip.css')}"/>
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/contrib/prismjs/prism.css')}"/>
    <link rel="stylesheet"
          href="http://ajax.googleapis.com/ajax/libs/dojo/1.9.7/dijit/themes/claro/claro.css"/>
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/js/dgrid/css/dgrid.css')}">
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/js/leaflet/sidebar-v2/css/leaflet-sidebar.min.css')}">
    <link rel="stylesheet" href="${request.static_url('entels_demo:static/contrib/font-awesome/css/font-awesome.min.css')}">
    <%block name="css"/>
</head>
<body id="NxgDemo" class="claro">
        <%block name="content"/>
</body>

<script type="text/javascript"
        src="${request.static_url('entels_demo:static/contrib/jquery/jquery-2.1.3.min.js')}"></script>
<script type="text/javascript"
        src="${request.static_url('entels_demo:static/contrib/materialize/js/materialize.min.js')}"></script>
<script type="text/javascript"
        src="${request.static_url('entels_demo:static/contrib/materialize/js/init.js')}"></script>

<script>
    var application_root = '${request.application_url}',
            application_lang = '${lang}',
            proxyNgwUrl = '${request.registry.settings['proxy_ngw']}',
            proxyScadaUrl = '${request.registry.settings['proxy_scada']}',
            scadaWebSockectUrl = '${request.registry.settings['scada_web_sockects']}',
            dojoConfig = {
                isDebug: true,
                async: true,
                ##                 cacheBust: true,
                                baseUrl: '${request.static_url('entels_demo:static/js')}',
                packages: [
                    {name: 'mustache', location: 'mustache'},
                    {name: 'leaflet', location: 'leaflet'},
                    {name: 'entels', location: 'entels'},
                    {name: 'pages', location: 'pages'},
                    {name: 'dgrid', location: 'dgrid'},
                    {name: 'dstore', location: 'dstore'}
                ],
                has: {
                    'dojo-firebug': true,
                    'dojo-debug-messages': true
                }
            };
</script>
<script src="${request.static_url('entels_demo:static/contrib/prismjs/prism.js')}"></script>
<script src="//ajax.googleapis.com/ajax/libs/dojo/1.9.7/dojo/dojo.js"></script>
    <%block name="inlineScripts"/>
</html>