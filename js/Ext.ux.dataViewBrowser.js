Ext.ux.dataViewBrowser = Ext.extend(Ext.DataView, {
    singleSelect:true

    ,overClass:'x-view-over'

    ,itemSelector:'div.thumb-wrap'

    ,readOnly:false

    ,initComponent:function() {
        this.tpl = new Ext.XTemplate (
            '<tpl for=".">',
            '<div class="thumb-wrap" id="{id}">',
            '<div class="thumb">',
            '<div class="item {[values.leaf  ? values.iconCls ? values.iconCls+"-64" : "file" : "folder"]}"></div>',
            '</div>',
            '<span class="x-editable" ext:qtip="{values.text}">{[fm.ellipsis(values.text, 12)]}</span></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
        );

        //        this.DragSelect = new Ext.DataView.DragSelector();

        this.LabelEdit = new Ext.DataView.LabelEditor({
            dataIndex:'id'
            ,readOnly:this.readOnly
            ,listeners:{
                    complete:{scope:this, fn:function(ed, value) {
                        var oldName = ed.activeRecord.data.text;
                        ed.activeRecord.set('text', value);
                        this.fireEvent("fileRename", ed.activeRecord, oldName, value);
                    }}
            }
        });

        this.plugins = [/*this.DragSelect, */this.LabelEdit];

        Ext.ux.dataViewBrowser.superclass.initComponent.apply(this, arguments);

        this.on({
            render:{fn:function(dataView, index, node) {
                this.el.on({
                    contextmenu:{fn:function(){return false;},stopEvent:true}
                });
                this.initializeDataViewDragZone(dataView);
                this.initializeDataViewDropZone(dataView);
            }}
            ,dblclick:{fn:function(dataView, index, node) {
                this.fireEvent("elementExecuted", node.id);
            }}
            ,selectionchange:{fn:function(dataView, selections) {
                if (selections.length)
                    this.fireEvent("elementSelected", selections[0].id);
            }}
            ,contextmenu:{fn:function(dataView, index, node, e) {
                this.select(node);
                if (!this.readOnly)
                    this.fireEvent("elementContextMenu", node.id, e);
            }}
            ,containercontextmenu:{fn:function(dataView, e) {
                this.fireEvent("viewContextMenu", e);
            }}
        });
    }

    ,initializeDataViewDragZone:function(v) {
        v.dragZone = new Ext.dd.DragZone(v.getEl(), {
            ddGroup:v.browserDDGroup
            ,getDragData: function(e) {
                var sourceEl = e.getTarget(v.itemSelector, 10);
                if (sourceEl) {
                    var node = Ext.DomHelper.createDom({tag:"div", class:"browser-view"});
                    var clearNode = Ext.DomHelper.createDom({tag:"div", style:"clear:both"});
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    node.appendChild(d);
                    node.appendChild(clearNode);
                    return v.dragData = {
                        sourceEl:sourceEl,
                        repairXY:Ext.fly(sourceEl).getXY(),
                        ddel:node,
                        record:v.getRecord(sourceEl)
                    };
                } else return false;
            }
            ,getRepairXY: function() {
                return this.dragData.repairXY;
            }
        });
    }

    ,initializeDataViewDropZone:function(v) {
        v.dropZone = new Ext.dd.DropZone(v.getEl(), {
            ddGroup:v.browserDDGroup
            ,getTargetFromEvent: function(e) {
	            //return e.getTarget(v.itemSelector, 10);
                return e.getTarget();
            }
            ,onNodeOver:function(target, dd, e, options) {
                var t = e.getTarget(v.itemSelector, 10);
//                console.log("over", arguments, t);

                if (t) {
                    var targetRecord = v.getRecord(t);
                    var rowIndex = v.store.indexOf(targetRecord);
                }

                if (options.node) {
                    if (targetRecord && rowIndex !== false) {
                        var targetNode = options.node.ownerTree.getNodeById(targetRecord.get("id"));
                        var targetPath = v.getNodePath(targetNode);
                    }
                    var inStore = v.store.find("id", options.node.attributes.id);
                    if (
                        !t || 
                        (inStore < 0 &&
                        (rowIndex === false || (targetRecord && targetRecord.get("leaf") === true)))
                        || ((targetRecord && targetRecord.get("leaf") !== true) &&
                           (targetPath+"/"+options.node.attributes.text !== options.node.attributes.path))
                    )
                        return Ext.dd.DropZone.prototype.dropAllowed;
                    return Ext.dd.DropZone.prototype.dropNotAllowed;
                } else {
                    if (
                        t && targetRecord
                        && targetRecord.get("leaf") !== true
                        && targetRecord.get("id") !== options.record.get("id")

                    ) return Ext.dd.DropZone.prototype.dropAllowed;
                    else return Ext.dd.DropZone.prototype.dropNotAllowed;
                }

            }
            ,onNodeDrop:(function(target, dd, e, options) {
                var t = e.getTarget(v.itemSelector, 10);

                if (t) {
                    var targetRecord = v.getRecord(t);
                    var rowIndex = v.store.indexOf(targetRecord);
                }

                if (options.node) {
                    if (targetRecord && rowIndex !== false) {
                        var targetNode = options.node.ownerTree.getNodeById(targetRecord.get("id"));
                        var targetPath = v.getNodePath(targetNode);
                    }
                    var inStore = v.store.find("id", options.node.attributes.id);
                    if (
                        !t ||
                        (inStore < 0 &&
                        (rowIndex === false || (targetRecord && targetRecord.get("leaf") === true)))
                        || ((targetRecord && targetRecord.get("leaf") !== true) &&
                           (targetPath+"/"+options.node.attributes.text !== options.node.attributes.path))
                    ) {
                        var dragRecord = new Ext.util.MixedCollection();
                        dragRecord.addAll({
                            id:options.node.attributes.id
                            ,text:options.node.attributes.text
                            ,isNode:true
                        });
                        v.fireEvent("filedrop", v, targetRecord, dragRecord);
                        return true;
                    }
                    return false;
                } else {

                    if (
                        t && targetRecord
                        && targetRecord.get("leaf") !== true
                        && targetRecord.get("id") !== options.record.get("id")

                    ) {
                        v.fireEvent("filedrop", v, targetRecord, options.record);
                        return true;
                    } else return false;

                }

            }).createDelegate(this)
        });
    }

});
