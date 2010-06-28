Ext.onReady(function() {

    Ext.QuickTips.init();

    var filebrowser1 = new Ext.ux.FileBrowser({
        renderTo:"filebrowser1"
        ,rootText:"Home"
        ,height:290
        ,width:650
        ,readOnly:false
        ,enableBrowser:true
        ,browserDDGroup:"DDGroup1"
        ,enableUpload:true
        ,path:"/dev/Ext.ux.filebrowser/examples/files"
        ,url:"/dev/Ext.ux.filebrowser/examples/php/getfiles.php"
        ,uploadUrl:"/dev/Ext.ux.filebrowser/examples/php/upload.php"
    });

    var filebrowser2 = new Ext.ux.FileBrowser({
        renderTo:"filebrowser2"
        ,rootText:"Home"
        ,height:200
        ,width:200
        ,readOnly:false
        ,path:"/dev/Ext.ux.filebrowser/examples/files"
        ,url:"/dev/Ext.ux.filebrowser/examples/php/getfiles.php"
    });

    var filebrowser3 = new Ext.ux.FileBrowser({
        renderTo:"filebrowser3"
        ,rootText:"Home"
        ,height:200
        ,width:200
        ,url:"/dev/Ext.ux.filebrowser/examples/php/getfiles.php"
    });

});
