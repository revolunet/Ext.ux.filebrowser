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
                this.initializeDropZone(grid);
                //this.initializeDragZone(grid)
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
            ,contextmenu:{fn:function(e) {
                if (!this.readOnly) {
                    this.fireEvent("viewContextMenu", e);
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

    ,getDragDropText : function(){
        var records = this.selModel.getSelections();
        var html = "";
        Ext.each(records, function(record) {
            var iconCls = record.get("leaf") === true ? "row-file" : "icon-row-folder";
            html += '<div class="'+iconCls+' '+record.get("iconCls")+'">'+record.get("text")+'</div>';
        }, this);
        return html;
    }

    ,initializeDropZone:function(grid) {
        new Ext.dd.DropTarget(grid.getView().scroller.dom, {
            ddGroup:grid.ddGroup
            ,notifyOver:function(ddSource, e, data) {
                var rowIndex = grid.getView().findRowIndex(e.getTarget());
                var targetRecord = grid.getStore().getAt(rowIndex);

                if (data.node) {
                    if (targetRecord && rowIndex !== false) {
                        var targetNode = data.node.ownerTree.getNodeById(targetRecord.get("id"));
                        var targetPath = grid.getNodePath(targetNode);
                    }
                    var inStore = grid.getStore().find("id", data.node.attributes.id);
                    if (
                        (inStore < 0 &&
                        (rowIndex === false || (targetRecord && targetRecord.get("leaf") === true)))
                        || ((targetRecord && targetRecord.get("leaf") !== true) &&
                           (targetPath+"/"+data.node.attributes.text !== data.node.attributes.path))
                    )
                        return Ext.dd.DropZone.prototype.dropAllowed;
                    return Ext.dd.DropZone.prototype.dropNotAllowed;
                } else {
                    var dragRecords =  ddSource.dragData.selections;
                    if (
                        dragRecords && targetRecord &&
                        dragRecords[0].get("id") !== targetRecord.get("id") &&
                        (
                            Ext.fly(e.getTarget()).hasClass("icon-row-folder") ||
                            Ext.fly(e.getTarget()).select("div.icon-row-folder").elements.length
                        )
                    ) return Ext.dd.DropZone.prototype.dropAllowed;
                    else return Ext.dd.DropZone.prototype.dropNotAllowed;
                }

            }
            ,notifyDrop:function(ddSource, e, data){
                var rowIndex = grid.getView().findRowIndex(e.getTarget());
                var targetRecord = grid.getStore().getAt(rowIndex);

                if (data.node) {
                    if (targetRecord && rowIndex !== false) {
                        var targetNode = data.node.ownerTree.getNodeById(targetRecord.get("id"));
                        var targetPath = grid.getNodePath(targetNode);
                    }
                    var inStore = grid.getStore().find("id", data.node.attributes.id);
                    if (
                        (inStore < 0 &&
                        (rowIndex === false || (targetRecord && targetRecord.get("leaf") === true)))
                        || ((targetRecord && targetRecord.get("leaf") !== true) &&
                           (targetPath+"/"+data.node.attributes.text !== data.node.attributes.path))
                    ) {
                        var dragRecord = new Ext.util.MixedCollection();
                        dragRecord.addAll({
                            id:data.node.attributes.id
                            ,text:data.node.attributes.text
                            ,isNode:true
                        });
                        if (targetRecord && targetRecord.get("leaf") === true) targetRecord = null;
                        grid.fireEvent("filedrop", grid, targetRecord, dragRecord);
                        return true;
                    } return false;
                } else {
                    var dragRecords =  ddSource.dragData.selections;
                    if (
                        dragRecords[0].get("id") !== targetRecord.get("id") &&
                        (
                            Ext.fly(e.getTarget()).hasClass("icon-row-folder") ||
                            Ext.fly(e.getTarget()).select("div.icon-row-folder").elements.length
                        )
                    ) {
                        grid.fireEvent("filedrop", grid, targetRecord, dragRecords[0]);
                        return true
                    } else return false;
                }

            }
        });

    }

});
