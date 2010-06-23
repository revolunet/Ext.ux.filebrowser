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
            '<span class="x-editable">{[fm.ellipsis(values.text, 12)]}</span></div>',
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
        });
    }

    ,initializeDataViewDragZone:function(v) {
        v.dragZone = new Ext.dd.DragZone(v.getEl(), {
            getDragData: function(e) {
                var sourceEl = e.getTarget(v.itemSelector, 10);
                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return v.dragData = {
                        sourceEl:sourceEl,
                        repairXY:Ext.fly(sourceEl).getXY(),
                        ddel:d,
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
            getTargetFromEvent: function(e) {
	            return e.getTarget(v.itemSelector, 10);
            }
            ,onNodeOver:function(target, dd, e, data) {
	            if (Ext.fly(target).select("div.item").first().hasClass("folder"))
	                return Ext.dd.DropZone.prototype.dropAllowed;
	            else return false;
            }
            ,onNodeDrop:(function(target, dd, e, options) {
                var node = Ext.fly(target).select("div.item").first();
                if (node.hasClass("folder")) {
                    var record = v.getRecord(target);
                    v.fireEvent("filedrop", v, record, options.record);
                    return true;
                } else return false;
            }).createDelegate(this)
        });
    }

});
