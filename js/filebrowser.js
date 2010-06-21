Ext.onReady(function() {

    Ext.QuickTips.init();
    Ext.WindowMgr.zseed = 15000;

    var fileBrowser0 = new Ext.ux.FileBrowser({
        root:"test"
	,title:false
        ,rootText:'&nbsp;Poste de travail 0'
	,url:"/apps/filebrowser"
//	,url_view:"/apps/filebrowser/filesystem"
        ,floating:true
        ,x:25
        ,y:25
        ,width:300
        ,height:400
	,swfuploaderConfig:{
	    url:"/apps/swfuploader"
	    ,params:{from:"filebrowser", root:false}
	}
    });

    var fileBrowser1 = new Ext.ux.FileBrowser({
        root:"test"
        ,rootText:'&nbsp;Poste de travail 1'
	,url:"/apps/filebrowser"
//	,url_view:"/apps/filebrowser/view"
	,title:"File browser 1"
        ,statusBar:true
	,enableUpload:true
        ,floating:true
        ,x:335
        ,y:25
        ,width:300
        ,height:400
	,swfuploaderConfig:{
	    url:"/apps/swfuploader"
	    ,params:{from:"filebrowser", root:false}
	}
    });

    var fileBrowser2 = new Ext.ux.FileBrowser({
        root:"test"
        ,rootText:'&nbsp;Poste de travail 2'
	,url:"/apps/filebrowser"
//	,url_view:"."
        ,title:"File browser 2"
        ,enableBrowser:true
	,enableUpload:true
        ,statusBar:true
        ,floating:true
        ,x:25
        ,y:435
        ,width:610
        ,height:400
	,swfuploaderConfig:{
	    url:"/apps/swfuploader"
	    ,params:{from:"filebrowser", root:false, path:false}
	}
    });

    fileBrowser0.render("filebrowser0");
    fileBrowser1.render("filebrowser1");
    fileBrowser2.render("filebrowser2");
});
