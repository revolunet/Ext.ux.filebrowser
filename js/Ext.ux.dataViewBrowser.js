Ext.ux.dataViewBrowser = Ext.extend(Ext.DataView, {
    hidden:false
    ,multiSelect:true
    ,overClass:'x-view-over'
    ,itemSelector:'div.thumb-wrap'
    ,readonly:false
    // ,plugins:[
        // new Ext.DataView.DragSelector()
        // ,new Ext.DataView.LabelEditor({dataIndex:'id'})
    // ]
    ,tpl:new Ext.XTemplate (
        '<tpl for=".">',
        '<div class="thumb-wrap" id="{id}">',
        '<div class="thumb">',
        '<div class="item {[values.leaf  ? "file" : "folder"]}"></div>',
        '</div>',
        '<span class="x-editable">{[fm.ellipsis(values.text, 12)]}</span></div>',
        '</tpl>',
        '<div class="x-clear"></div>'
    )
    ,listeners:{
        render:{fn:function(dataView, index, node) {
        	this.el.on({contextmenu:{fn:function(){return false;},stopEvent:true}});
        }}
        ,dblclick:{fn:function(dataView, index, node) {
            this.fireEvent("elementExecuted", node.id);
        }}
        ,selectionchange:{fn:function(dataView, selections) {
            if (selections.length) this.fireEvent("elementSelected", selections[0].id);
        }}
        ,contextmenu:{fn:function(dataView, index, node, e) {
            this.select(node);
            if (!this.readonly)
                this.fireEvent("elementContextMenu", node.id, e);
            }}
    }

   ,initComponent:function() {

        this.DragSelect = new Ext.DataView.DragSelector();
        this.LabelEdit = new Ext.DataView.LabelEditor({
            dataIndex:'id'
	    ,readonly:this.readonly
	    ,listeners:{
                complete:{scope:this, fn:function(ed, value) {
                    var oldName = ed.activeRecord.data.text;
                    ed.activeRecord.set('text', value);
                    this.fireEvent("fileRename", ed.activeRecord, oldName, value);
                }}
            }
        });

        Ext.apply(this, {plugins:[this.DragSelect, this.LabelEdit]});
        Ext.ux.dataViewBrowser.superclass.initComponent.apply(this, arguments);
    }
});
