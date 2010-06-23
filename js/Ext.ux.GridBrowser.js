Ext.ux.GridBrowser = Ext.extend(Ext.grid.GridPanel, {

    border:false

    ,enableHdMenu:false

    ,viewConfig: {forceFit:true}

    ,enableDragDrop:true

    ,initComponent:function() {

        this.cm = new Ext.grid.ColumnModel([
            {id:"id", header:"Label", dataIndex:"text", sortable:true, renderer:this.fileRenderer}
	        ,{header:"Size", dataIndex:"size", align:"right", fixed:true, width:100, sortable:true, renderer:this.sizeRenderer}
        ]);

        this.selModel = new Ext.grid.RowSelectionModel({
            singleSelect:true
        });

        Ext.ux.GridBrowser.superclass.initComponent.apply(this, arguments);

        this.on({
            render:{fn:function(grid) {
                this.el.on({contextmenu:{fn:function(){return false;},stopEvent:true}});
                this.initializeDataViewDropZone(grid);
            }}
            ,rowdblclick:{fn:function(grid, rowIndex) {
                this.fireEvent("elementExecuted", grid.getStore().getAt(rowIndex).get("id"));
            }}
            ,rowclick:{fn:function(grid, rowIndex) {
                this.fireEvent("elementSelected", this.getStore().getAt(rowIndex).get("id"));
            }}
            ,rowcontextmenu:{fn:function(grid, index, e) {
                this.getSelectionModel().selectRow(index);
                if (!this.readOnly) {
                    var id = this.getStore().getAt(index).get("id");
                    this.fireEvent("elementContextMenu", id, e);
                }
            }}            
        });

    }

    ,sizeRenderer:function(value, metaData, record) {
        var html = '<div style="padding:2px 0 1px 0;">';
        if (record.data.leaf != undefined && record.data.leaf === true)
            html += (value/1000) + " Ko";
        return html+'</div>';
    }

    ,fileRenderer:function(value, metaData, record) {
        var html = "";
        if (record.data.leaf != undefined && record.data.leaf === true)
            html += '<div class="row-file '+record.data.iconCls+'" style="padding:2px 0 1px 20px;">'+value+'</div>';
        else html += '<div class="icon-row-folder">'+value+'</div>';
        return html;
    }

    ,initializeDataViewDropZone:function(grid) {
        new Ext.dd.DropTarget(grid.getView().scroller.dom, {
            ddGroup:grid.ddGroup
            ,notifyOver:function(ddSource, e, data) {
                if (
                    Ext.fly(e.getTarget()).hasClass("icon-row-folder") ||
                    Ext.fly(e.getTarget()).select("div.icon-row-folder").elements.length
                ) return Ext.dd.DropZone.prototype.dropAllowed;
                else return Ext.dd.DropZone.prototype.dropNotAllowed;
            }
            ,notifyDrop:function(ddSource, e, data){
                if (
                    Ext.fly(e.getTarget()).hasClass("icon-row-folder") ||
                    Ext.fly(e.getTarget()).select("div.icon-row-folder").elements.length
                ) {
                    var dragRecords =  ddSource.dragData.selections;
                    var targetRecord = grid.getStore().getAt(grid.getView().findRowIndex(e.getTarget()));
                    grid.fireEvent("filedrop", grid, targetRecord, dragRecords[0]);
                    return true
                }
            }
        });

    }

});
