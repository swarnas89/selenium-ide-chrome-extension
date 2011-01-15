SeleniumIDEChromePluginBackupObj = window.SeleniumIDEChromePluginBackupObj || {}
/*
 * Include Command for Firefox IDE Addon only
 * @param locator: absolute or relative (to current testcase) file path
 */
 
function IDEIncludeCommand() {}

IDEIncludeCommand.prototype = {
   alreadyIncluded: function(index){
      var commands = testCase.commands
      if(index != commands.length){
        var nextCommand = testCase.commands[index + 1]
        if(nextCommand && nextCommand.isIncluded){
           //do noting the command is already included
           return true
        }
      }
      return false
   },
   
   doInclude: function(locator){
      var index = testCase.debugContext.debugIndex 
      if(this.alreadyIncluded(index)){
         return
      }
      var incldudedNsIFile = FileUtils.getIncludeFile(locator)
      //Create Testcase
      var includedTestCase = editor.app.getCurrentFormat().loadFile(incldudedNsIFile);
      this.insertNewCommandsAt(includedTestCase.commands, index)
   },
   
   insertNewCommandsAt: function(newCommands, index){
      newCommands.forEach(function(command){
         command.isIncluded = true
      })
      var cmdsBefore = testCase.commands.slice(0,index + 1);     
      var cmdsBehind = testCase.commands.slice(index + 1, testCase.commands.length);     
      testCase.commands = cmdsBefore.concat(newCommands).concat(cmdsBehind);//Injection
      
      editor.view.refresh();//Must refresh to syncup UI
   }
}

IDEIncludeCommand.insertCommands = function(newCommands){
   IDEIncludeCommand.insertCommandsAt(newCommands)
}

IDEIncludeCommand.insertCommandsAt = function(newCommands, index){
   index = arguments.length>=2 ? index : testCase.debugContext.debugIndex
   var ideIncludeCommand = new IDEIncludeCommand()
   if(!ideIncludeCommand.alreadyIncluded(index)){
      ideIncludeCommand.insertNewCommandsAt(newCommands, index)
   }
}

Selenium.prototype.doInclude = function(locator) {
    var ideIncludeCommand = new IDEIncludeCommand();
    ideIncludeCommand.doInclude(locator);
}

