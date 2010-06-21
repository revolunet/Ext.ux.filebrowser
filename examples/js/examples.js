Ext.onReady(function() {

    var filebrowser = new Ext.ux.FileBrowser({
        renderTo:Ext.getBody()
        ,rootText:"Home"
        ,height:200
        ,width:200
        ,readOnly:true
        ,url:"php/getfiles.php"
    });

    var filebrowser2 = new Ext.ux.FileBrowser({
        renderTo:Ext.getBody()
        ,rootText:"Home"
        ,height:200
        ,width:200
        ,readOnly:true
        ,url:"php/getfiles.php"
    });

});