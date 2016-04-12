<div id="sidebar" class="sidebar collapsed unactive">
    <div class="sidebar-tabs">
        <ul role="tablist">
            <li><a href="#search" role="tab"><i class="fa fa-search"></i></a></li>
            <li><a href="#visibleObjects" role="tab"><i class="fa fa-table"></i></a></li>
        </ul>
    </div>

    <!-- Tab panes -->
    <div class="sidebar-content">
        <div class="sidebar-pane" id="search">
            <h1 class="sidebar-header">
                Поиск
                <span class="sidebar-close"><i class="fa fa-caret-left"></i></span>
            </h1>
            <span data-dojo-type="entels/SearchObjects">press me</span>
        </div>
         <div class="sidebar-pane" id="visibleObjects">
             <h1 class="sidebar-header">
                Отображаемые объекты
                 <span class="sidebar-close"><i class="fa fa-caret-left"></i></span>
            </h1>
            <div id="sidebarVisibleObjectsTable"></div>
        </div>
    </div>
</div>