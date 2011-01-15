SeleniumIDEChromePluginBackupObj = window.SeleniumIDEChromePluginBackupObj || {}

SeleniumIDEOverlay = {
   filterIncludedCommands: function(commands){
      filteredCommands = []
      commands.forEach(function(command) {
        if (!command.isIncluded) {
           filteredCommands.push(command)
        }
      })
      //Clear current commands array, no new array could be constructed as reference is used in tree
      while(commands.length > 0){
         commands.shift()
      }
      for (var i = 0; i < filteredCommands.length; i++) {
         commands.push(filteredCommands[i])
      }
   }
}

//SourceView Overlay
SeleniumIDEChromePluginBackupObj.sourceView_refresh_org = SeleniumIDEChromePluginBackupObj.sourceView_refresh_org || SourceView.prototype.refresh
SourceView.prototype.refresh = function() {
//   var commandsBackup = this.testCase.commands
   //FilterCommands
   SeleniumIDEOverlay.filterIncludedCommands(this.testCase.commands)
   SeleniumIDEChromePluginBackupObj.sourceView_refresh_org.call(this)
  // this.testCase.commands = commandsBackup
}

SeleniumIDEChromePluginBackupObj.format_saveAs_org = Format.prototype.saveAs  
Format.prototype.saveAs = function(testCase, filename, exportTest) {
   SeleniumIDEOverlay.filterIncludedCommands(testCase.commands)
      editor.view.refresh();//Must refresh to syncup UI
   return SeleniumIDEChromePluginBackupObj.format_saveAs_org.call(this, testCase, filename, exportTest)
}