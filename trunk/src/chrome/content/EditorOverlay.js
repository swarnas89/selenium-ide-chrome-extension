var EditorOverlay = {
   
   focusTable: function(){
      document.getElementById('commands').focus()
   },
   
   getCurrentTreeViewIndex: function(){
      return editor.treeView.tree.currentIndex      
   },
   
   getCommandTree: function(){
      return document.getElementById('commands')
   },
   
   init: function(){
      //Append Controllers
      document.getElementById('commands').controllers.insertControllerAt(0, this.tableController)
      document.getElementById('commandTarget').controllers.insertControllerAt(0, this.commandEditController)
      document.getElementById('commandValue').controllers.insertControllerAt(0, this.commandEditController)
      window.controllers.appendController(this.windowController)
      
     
     //Load last test suite
     this.loadLastTestSuite()
      
     //Focus Tables
     this.focusTable()
     
   },
   
   insertCommandAfter: function(){
      var treeView = editor.treeView
      var currentIndex = this.getCurrentTreeViewIndex()
      if (currentIndex >= 0) {
         treeView.insertAt(currentIndex+1, new Command());
         treeView.selection.select(currentIndex+1);
      }else{
         //Insert at end
         var endIndex = editor.treeView.rowCount-1
         treeView.insertAt(endIndex, new Command());
         treeView.selection.select(endIndex);
      }
      document.getElementById('commandAction').focus()
   },
   
   loadLastTestSuite: function(){
      var lastTestSuites = SeleniumIDE.Preferences.getArray("recentTestSuites")
      if(lastTestSuites.length > 0){
         editor.loadRecentSuite(lastTestSuites[0])
      }
   },

   moveCommand: function(upDown){
      var treeView = editor.treeView
      var selection = treeView.selection
      if(selection.getRangeCount()==0){
         return
      }
      var currentIndex = selection.currentIndex
      selection.clearSelection()
      selection.select(currentIndex)
      treeView.cut()
      var newCurrentIndex = upDown=="down"?++currentIndex: --currentIndex
      treeView.insertAt(newCurrentIndex, treeView.clipboard[0])
      selection.select(newCurrentIndex)
   },
   
   moveDown: function(){
      if(this.getCurrentTreeViewIndex() == editor.treeView.rowCount-1){
         return
      }
      this.moveCommand('down')
   },
   
   moveUp: function(){
      if(this.getCurrentTreeViewIndex() == 0){
         return
      }
      this.moveCommand('up')
   },
   
   commandEditController: {
      supportsCommand : function(cmd) {
         return ["cmd_insert_by_enter"].indexOf(cmd) != -1
      },
   
      isCommandEnabled : function(cmd){
         return true
      },
      
      doCommand : function(cmd) {
         switch (cmd) {
            case "cmd_insert_by_enter": 
               EditorOverlay.insertCommandAfter(); 
               break;
            default: 
         }
      },
      
      onEvent : function(evt) {}
   },

   tableController: {
      supportsCommand : function(cmd) {
         return ["cmd_move_down", "cmd_move_up"].indexOf(cmd) != -1
      },
   
      isCommandEnabled : function(cmd){
         return true
      },
      
      doCommand : function(cmd) {
         switch (cmd) {
            case "cmd_move_down":
               EditorOverlay.moveDown(); 
               break;
            case "cmd_move_up":
               EditorOverlay.moveUp(); 
               break;
            default: 
         }
      },
      
      onEvent : function(evt) {}
   },

   windowController: {
      supportsCommand : function(cmd) {
         return ["cmd_insert", "cmd_focus_table"].indexOf(cmd) != -1
      },
   
      isCommandEnabled : function(cmd){
         return true
      },
      
      doCommand : function(cmd) {
         switch (cmd) {
            case "cmd_focus_table": 
               EditorOverlay.focusTable(); 
               break;
            case "cmd_insert": 
               EditorOverlay.insertCommandAfter(); 
               break;
            default: 
         }
      },
      
      onEvent : function(evt) {}
   }
}

window.addEventListener("load", function(){EditorOverlay.init();}, false)