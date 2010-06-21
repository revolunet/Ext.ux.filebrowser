/*
 * url = "/apps/filebrowser"
 *
 * cmd = get (&path)
 * cmd = move (&oldname, &newname)
 * cmd = rename (&oldname, &newname)
 * cmd = delete (&path)
 * cmd = view (&path)
 *
 * baseParams: root
 *
 */


Ext.ux.FileBrowser = Ext.extend(Ext.Panel, {

    layout:"border"
    ,cls:"browser-view"
    ,readOnly:false
    ,data:[]
    ,url_view:""
    ,historyCurrentId:false
    ,historyPreviousId:[]
    ,historyNextId:[]
    ,tmpRecords:[]
    ,enableBrowser:false
    ,statusBar:false
    ,fileTreePanel:false
    ,enableUpload:false

    ,initComponent:function() {

        /*
        ** FileTreePanel
        */
        this.fileTreePanel = new Ext.ux.FileTreePanel({
            autoScroll:true
            ,readOnly:this.readOnly
            ,region:"center"
            ,border:false
            ,method:'post'
            ,rootPath:''
            ,url:this.url
            ,rootText:this.rootText
            ,cmdParams:{root:this.root}
            ,listeners:{
                click:{scope:this, fn:this.treePanelClick}
                ,dblclick:{scope:this, fn:this.treePanelDbLClick}
                ,startdrag:{scope:this, fn:this.startDragNode || false}
                ,load:{scope:this, fn:this.treePanelLoad}
                ,download:{scope:this, fn:this.downloadItem}
                ,rename:{scope:this, fn:this.renameItem}
                ,newdir:{scope:this, fn:function(treepanel, node){
                  this.load(node.parentNode);
                }}
                ,render:{scope:this, fn:function(){
                    this.fileTreePanel.loader.baseParams.root = this.root;
                    this.fileTreePanel.setReadOnly(this.readOnly);
                    this.enableUploadSystem();
                }}
            }
    	    ,onDblClick:function(node, e) {
	        	return false;
	        }
        });

        this.fileTreePanel.loader.on("beforeload", function() {
            this.fileTreePanel.loader.baseParams.root = this.root;
            return true;
        },this);

        /**************************************************
         * ************************************************
         * STATUS BAR SETTINGS
         * ************************************************
         **************************************************/

        if (this.statusBar) {
          this.StatusBarSize = new Ext.Toolbar.TextItem('Size:');
          console.log("StatusBarSize", this.StatusBarSize);
          this.StatusSpacer = new Ext.Toolbar.Spacer();
          this.StatusBarDetails = new Ext.Toolbar.TextItem('Details: ');

          if (typeof this.statusBar == "object") {
            this.bbar = this.statusBar;
            this.statusBar.insertCmpStatus(this.StatusBarSize, this, true);
            this.statusBar.insertCmpStatus(this.StatusSpacer, this);
            this.statusBar.insertCmpStatus(this.StatusBarDetails, this, true);
          } else {
            this.bbar = new Ext.ux.StatusBar({
                items:[
                    this.StatusBarDetails
                    ," "
                    ,this.StatusBarSize
                ]
            });
          }

        }

        /**************************************************
         * ************************************************
         * END OF STATUS BAR SETTINGS
         * ************************************************
         **************************************************/


        /**************************************************
         * ************************************************
         * UPLOAD SETTINGS
         * ************************************************
         **************************************************/

        if (!this.readOnly && this.enableUpload) {

            this.queuePanel = new Ext.Panel({
                region:"south"
                ,layout:"fit"
                ,border:false
                ,height:100
                ,collapsed:true
                ,collapseMode:"mini"
                //	    ,autoScroll:true
                ,split:true
            });

            var panelConfig = [{
                layout:"border"
                ,border:false
                ,items:[
                  this.fileTreePanel
                  ,this.queuePanel
                ]
            }];

            this.uploadMgr = new Ext.ux.upload.Uploader({
                url:this.swfuploaderConfig.url
                ,swfUrl:"/apps/extplugins/static/js/Ext.ux.upload/examples/swf/swfupload.swf"
                ,maxFiles:10
                ,maxFileSize:100000
                ,allowedFileTypes:"*.*"
            });

            this.uploadMgr.setLogFrame(this.queuePanel);

            this.uploadMgr.on({
                scope:this
                ,beforeupload:function() {
                    this.queuePanel.expand(false);
                    //var node = this.fileTreePanel.getContextMenu().node;
                    var node = this.fileTreePanel.getNodeById(this.historyCurrentId);
                    console.log("NODE", this.historyCurrentId, node);
                    if (node.isLeaf()) node = node.parentNode;
                    var path = (node.isRoot) ? "" : this.getNodePath(node);
                    var url = this.swfuploaderConfig.url+path;
                    this.uploadMgr.setUploadUrl(url);
                }
                ,uploadcomplete:function(uploadMgr, conn, file) {
                    //var node = this.fileTreePanel.getContextMenu().node;
                    var node = this.fileTreePanel.getNodeById(this.historyCurrentId);
                    if (node.isLeaf()) node = node.parentNode;
                    node.reload(this.load.createDelegate(this));
                }
                ,queuecomplete:function() {
                    this.queuePanel.collapse.defer(2000, this.queuePanel);
                }
            });

        } else var panelConfig = this.fileTreePanel;

        /**************************************************
        * ************************************************
        * END OF UPLOAD SETTINGS
        * ************************************************
        **************************************************/


	/**************************************************
	 * ************************************************
	 * FILE BROWSER SETTINGS
	 * ************************************************
	 **************************************************/

        if (this.enableBrowser) {

            /*
            ** data store used by all browser views
            */
            this.dataViewRecord = Ext.data.Record.create([
                {name:'id'}
                ,{name:'text'}
                ,{name:'leaf'}
                ,{name:'size'}
            ]);

            this.dataViewStore = new Ext.data.Store({
                reader:new Ext.data.JsonReader({}, this.dataViewRecord)
                ,id:"id"
            });

            /*
            ** dataViewBrowser
            */
            this.fileBrowserIcones = new Ext.ux.dataViewBrowser({
                store:this.dataViewStore
                ,readOnly:this.readOnly
            });

            this.fileBrowserIcones.on({
                render:{scope:this, fn:function() {
                    this.relayEvents(this.fileBrowserIcones, ["elementSelected", "elementExecuted", "elementContextMenu", "fileRename"]);
                }}
            });

            /*
            ** GridBrowser
            */
            this.fileBrowserList = new Ext.ux.GridBrowser({
                store:this.dataViewStore
                ,readOnly:this.readOnly
                ,autoHeight:true
            });

            this.fileBrowserList.on({
                render:{scope:this, fn:function() {
                    this.relayEvents(this.fileBrowserList, ["elementSelected", "elementExecuted", "elementContextMenu"]);
                }}
            });

	    this.toolsMenuItems = [
	      {text:"Icones", view:"icones", iconCls:"icon-view", handler:this.switchView, scope:this}
	      ,{text:"List", view:"list", iconCls:"icon-list", handler:this.switchView, scope:this}
	    ];

            this.tbar = new Ext.Toolbar({items:[
                {tooltip:"Previous", iconCls:"icon-previous", disabled:true, handler:this.historyPrevious, scope:this}
                ,"-"
                ,{tooltip:"Next", iconCls:"icon-next", disabled:true, handler:this.historyNext, scope:this}
                ,"-"
                ,{tooltip:"Parent folder", iconCls:"icon-up", handler:this.folderUp, scope:this}

                ,"->"
                ,{
                    text:"Tools"
		    ,iconCls:"icon-wrench-orange"
                    ,menu:this.toolsMenuItems
                }
            ]});

            this.browser = new Ext.Panel({
                region:"center"
                ,layout:"fit"
                ,border:false
		,autoScroll:true 
		//,plugins:[this.uploadMgr]
		,plugins:this.uploadMgr ? [this.uploadMgr] : []
                ,items:[this.fileBrowserIcones, this.fileBrowserList]
                ,listeners:{
                  resize:{scope:this, fn:function() {this.previewItem(this.previewNode, true);}}
                }
            });

            Ext.apply(this, {items:[{
                region:"west"
                ,layout:"fit"
                ,border:false
                ,width:200
                ,split:true
                ,collapsible:true
		,items:panelConfig
            }, this.browser]});

        } else {

            Ext.apply(this, {items:[{
                region:"center"
                ,layout:"fit"
                ,border:false
                ,items:panelConfig
            }]});
        }

      	/**************************************************
	 * ************************************************
	 * END OF FILE BROWSER SETTINGS
	 * ************************************************
	 **************************************************/

        Ext.ux.FileBrowser.superclass.initComponent.apply(this, arguments);
    }

    /**************************************************
     * ************************************************
     * FILE BROWSER LISTENERS
     * ************************************************
     **************************************************/

    ,listeners:{
      afterrender:function() {
        if (this.statusBar && typeof this.statusBar != "object") {
	  console.log("StatusBarSize 2", this.StatusBarSize);
//          Ext.fly(this.StatusBarSize.getEl()).addClass('x-status-text-panel').createChild({cls:'spacer'});
//          Ext.fly(this.StatusBarDetails.getEl()).addClass('x-status-text-panel').createChild({cls:'spacer'});
        }
      }
      ,dialogComplete:function(){this.onDialogComplete();}
      ,queueComplete:function(){this.onQueueComplete();}
//      ,uploadSuccess:function(file){this.onUploadSuccess(file);}
      ,fileRename:function(record, oldValue, newValue) {
        var node =  this.fileTreePanel.getNodeById(record.data.id);
        node.text = newValue;
        node.setText(newValue);
        this.fileTreePanel.onEditComplete({editNode: node}, newValue, oldValue);
      }
      ,elementSelected:function(id) {
        if (this.browser) this.browser.getEl().unmask();
	var treeNode = this.fileTreePanel.getNodeById(id);
	this.setDetails(treeNode);
      }
      ,elementExecuted:function(id) {
        var treeNode = this.fileTreePanel.getNodeById(id);
        if (!treeNode.isLeaf()) {
          treeNode.expand();
          this.fileTreePanel.fireEvent("click", treeNode, {history:false});
        } else this.previewItem(treeNode);
      }
      ,elementContextMenu:function(id, e) {
        var treeNode = this.fileTreePanel.getNodeById(id);
        var text = treeNode.attributes.text;
        var menu = this.fileTreePanel.getContextMenu();
	menu.node = treeNode;
//        menu.getItemByCmd('nodename').setText(Ext.util.Format.ellipsis(text, 22));
        menu.showAt(e.xy);
      }
    }

    /**************************************************
     * ************************************************
     * END OF FILE BROWSER LISTENERS
     * ************************************************
     **************************************************/

    ,switchView:function(button) {
        if (button.view == "list") {
            this.fileBrowserIcones.hide();
            this.fileBrowserList.show();
        } else if (button.view == "icones") {
            this.fileBrowserList.hide();
            this.fileBrowserIcones.show();
        }
    }

    ,folderUp:function() {
        var treeNode = this.fileTreePanel.getNodeById(this.historyCurrentId);
        if (!treeNode.isRoot) {
            treeNode.parentNode.select();
            this.historyPreviousId.push(this.historyCurrentId);
            this.historyCurrentId = treeNode.parentNode.id;
            this.fileTreePanel.fireEvent("click", treeNode.parentNode, {history:true});
        }
    }

    ,iconUpload:function() {
        var treeNode = this.fileTreePanel.getNodeById(this.historyCurrentId);
        if (!treeNode.isRoot) {
            treeNode.parentNode.select();
            this.historyPreviousId.push(this.historyCurrentId);
            this.historyCurrentId = treeNode.parentNode.id;
            this.fileTreePanel.fireEvent("click", treeNode.parentNode, {history:true});
        }
    }


    ,historyPrevious:function() {
        var treeNode = this.fileTreePanel.getNodeById(this.historyPreviousId[this.historyPreviousId.length - 1]);
        if (!this.historyNextId.length) this.getTopToolbar().items.items[2].enable();
        this.historyNextId.push(this.historyCurrentId);
        this.historyPreviousId.pop();
        if (!this.historyPreviousId.length) this.getTopToolbar().items.items[0].disable();
        treeNode.select();
        this.fileTreePanel.fireEvent("click", treeNode, {history:true});
    }

    ,historyNext:function() {
        var treeNode = this.fileTreePanel.getNodeById(this.historyNextId[this.historyNextId.length - 1]);
        if (!this.historyPreviousId.length) this.getTopToolbar().items.items[0].enable();
        this.historyPreviousId.push(this.historyCurrentId);
        this.historyNextId.pop();
        if (!this.historyNextId.length) this.getTopToolbar().items.items[2].disable();
        treeNode.select();
        this.fileTreePanel.fireEvent("click", treeNode, {history:true});
    }

    ,setdataViewElement:function(node) {
        this.tmpRecords.push(new this.dataViewRecord({
            id:node.attributes.id
            ,text:node.attributes.text
            ,leaf:node.attributes.leaf
            ,size:node.attributes.size
	    ,iconCls:node.attributes.iconCls
        }));
    }

    ,clearTmpRecords:function() {
        while (this.tmpRecords.length) {
            this.tmpRecords.shift();
        }
    }

    ,load:function(node) {
      if (this.enableBrowser) {
        this.dataViewStore.removeAll();
        this.clearTmpRecords();
        node.eachChild(this.setdataViewElement, this);
        this.dataViewStore.add(this.tmpRecords);
      }
    }

    ,reload:function() {
        this.dataViewStore.removeAll();
        this.dataViewStore.add(this.tmpRecords);
    }

    ,setDetails:function(node) {
        if (this.statusBar) {
            var size = (node.attributes.size == undefined) ? "unknown" : node.attributes.size / 1000 + " Ko";
            var text = (this.enableBrowser) ? node.attributes.text : Ext.util.Format.ellipsis(node.attributes.text, 20);
            Ext.fly(this.StatusBarDetails.getEl()).update("Details: "+text);
            Ext.fly(this.StatusBarSize.getEl()).update("Size: "+size);
        }
    }

    ,getImage:function(node) {
/*
	var path = this.getNodePath(node);
	Ext.Ajax.request({
            url:this.url
	    ,params:{cmd:"view", file:path, root:this.root}
            ,scope:this
	    ,node:node
            ,success:this.previewItem
            ,failure:this.error
        });
*/
    }

    ,renameItem:function(treepanel, node, newname, oldname) {
      var index = this.dataViewStore.find("id", node.id);
      if (index > -1) {
	var record = this.dataViewStore.getAt(index);
	record.set("text", newname.split("/")[1]);
      }
    }

    ,downloadItem:function(node) {
      var filepath = "/apps/filebrowser?"
        + "cmd=download"
        + "&file="+this.getNodePath(node)
        + "&root="+this.root;
      window.open(filepath);
    }

      ,previewItem:function(node, resize) {
	if (!node || !this.browser) {return false;}
//	var node = options.node;
	this.previewNode = node;
	this.browser.getEl().unmask();

	if (new RegExp(/\w+\.*(gif|png|jpg)$/).test(node.attributes.text.toLowerCase())) {
            var filepath = "/apps/filebrowser?"
                       + "cmd=view"
                       + "&file="+this.getNodePath(node)
                       + "&root="+this.root;
            //if (filepath.substring(0,1)=="/") filepath=filepath.substring(1);
            var path = filepath;
            var box = this.browser.getBox();
            var html = '<div id="image-preview-ct" style="border:0px"><div id="image-preview-tbar" style="border:0px"></div><img src="'+filepath+'" style="';
            html += 'width:'+(box.width - 30)+'px;';
            html += 'height:'+(box.height - 30)+'px;"';
            html += ' /></div>';

            this.browser.getEl().mask(html, "image-preview");

            var tb = new Ext.Toolbar({
                  renderTo:"image-preview-tbar"
              ,width:(box.width - 30)
              ,hidden:true
              ,hideMode:"visibility"
              ,items:["->", {
                iconCls:"icon-close"
                    ,handler:function() {
                      this.browser.getEl().unmask();
                  this.previewNode = false;
                    }
                    ,scope:this
                  }]
              ,listeners:{
                    render:function(tb) {
                      var box = tb.getBox();
                      tb.getEl().setStyle({position:"absolute"});
                    }
                  }
                });

            Ext.get("image-preview-ct").on({
                  mouseover:{fn:function() {
                tb.show();
                  }}
              ,mouseout:{fn:function() {
                tb.hide();
                  }}
                });
	} else if (!resize && new RegExp(/\w+\.*(eml)$/).test(node.attributes.text.toLowerCase())) {
	  var emailPreview = new Ext.ux.IFrameComponent({url:"/apps/filebrowser/preview?root="+this.root+"&path="+this.getNodePath(node)});
	  new Ext.Window({
	    title:"Apercu email"
	    ,layout:"fit"
	    ,iconCls:"icon-email"
	    ,width:800
	    ,height:500
	    ,items:emailPreview
	  }).show();
	} else if (!resize){
         var filepath = "/apps/filebrowser?"
              + "cmd=download"
              + "&file="+this.getNodePath(node)
              + "&root="+this.root;
	 window.open(filepath);
      }
    }

    ,treePanelClick:function(node, event) {
      this.previewNode = false;
      if (this.enableBrowser && !node.isLeaf()) {
        if (!event.history) {
	  if (!this.historyPreviousId.length) this.getTopToolbar().items.items[0].enable();
          this.historyPreviousId.push(this.historyCurrentId);
        }
	this.historyCurrentId = node.id;
	if (!node.isExpanded()) {
	  node.expand(false, true, this.load.createDelegate(this));
	} else this.load(node);
      }

      this.fireEvent("elementSelected", node.id);
    }

    ,treePanelDbLClick:function(node, event) {
      this.fireEvent("elementExecuted", node.id);
    }

    ,startDragNode:function(treePanel, node) {
	this.fireEvent("startDradElement");
	node.attributes.root = treePanel.cmdParams.root;
	node.attributes.path = this.getNodePath(node);
    }

    ,treePanelLoad:function(node) {
        if (this.enableBrowser) {
            if (node.isRoot) {
              this.historyCurrentId = node.id;
              node.expand(false, true, this.load.createDelegate(this));
              node.select();
              this.fireEvent("elementSelected", node.id);
            }
        }
    }

    ,getNodePath:function(node) {
	var path = "";
	var tab = node.getPath().split("/");
	for (var i = 1; i < tab.length; i++) {
	    var tmpNode = this.fileTreePanel.getNodeById(tab[i]);
	    if (this.fileTreePanel.root.id == tmpNode.id) continue;
	    path += "/" + tmpNode.attributes.text;
	}
	return path;
    }
/*
    ,onDialogComplete:function() {
      var node = this.fileTreePanel.getContextMenu().node;
      if (node.isLeaf()) node = node.parentNode;
      var swf = this.uploader.uploader;
      var path = (node.isRoot) ? "" : this.getNodePath(node);
      Ext.apply(this.swfuploaderConfig.params, {root:this.root, path:path});
      swf.setPostParams(this.swfuploaderConfig.params);
      swf.startUpload();
    }

    ,onQueueComplete:function() {
      var node = this.fileTreePanel.getContextMenu().node;
      if (node.isLeaf()) node = node.parentNode;
      node.reload(this.load.createDelegate(this));
    }
				    */
    ,enableUploadSystem:function() {
      if (this.enableUpload) {
	var item = new Ext.menu.Item({
	  text:"Upload"
	  ,plugins:[this.uploadMgr]
	});
        var menu = this.fileTreePanel.getContextMenu();
        menu.add("-");
        menu.add(item);
	/*
        this.uploader = new Ext.ux.SwfUploaderMenuItem({
          statusBar:this.getBottomToolbar()
	  ,queuePanel:this.uploaderQueue
	  ,uploadUrl:this.swfuploaderConfig.url
	  ,buttonImage:"/apps/filebrowser/static/img/swfuploader.png"
	  ,alignTop:-2
	  ,alignLeft:-3
	  ,itemWidth:186
	  ,itemHeight:24
	  ,listeners:{
            render:{scope:this, fn:function() {
              this.relayEvents(this.uploader, ["uploadSuccess", "queueComplete", "dialogComplete"]);
            }}
          }
        });
        var menu = this.fileTreePanel.getContextMenu();
        menu.add("-");
        menu.add(this.uploader);
//        menu.add("-");
//        menu.add(this.uploader);
	 */
      }
    }

});

Ext.reg('FileBrowser', Ext.ux.FileBrowser);
