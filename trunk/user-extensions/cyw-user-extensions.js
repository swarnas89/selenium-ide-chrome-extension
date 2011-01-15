//Assure that sidebar is closed
Selenium.prototype.doAssertFirstModificationPreview = function(){
   if(this.hasPreview()){
      this.doAssertFirstModificationTpl()
   }
}

Selenium.prototype.assureClosedSidebar = function(){
   var browserWin= Utils.getBrowserWin()
   if(browserWin.document.getElementById('sidebar-box').hidden==false){
      browserWin.toggleSidebar()
   }
}

Selenium.prototype.doCancelDialog= function(){
   var commands = []
   commands.push(new Command("sendKeys", "document.documentElement", "escape"))
   commands.push(new Command("selectWindow"))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doCancelScript= function(){
   var commands = []
   commands.push(new Command("resetNewPageLoaded"))
   commands.push(new Command("selectChromeWindow", "sidebar"))
   commands.push(new Command("clickXUL", "cancelBtn"))
   commands.push(new Command("selectWindow"))
   commands.push(new Command("waitForPageToLoad"))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doConfirmDialog= function(){
   var commands = []
   commands.push(new Command("sendKeys", "document.documentElement", "return"))
   commands.push(new Command("selectWindow"))
   IDEIncludeCommand.insertCommands(commands)
}

//Automatically confirms next dialog
Selenium.prototype.doConfirmNextDialog = function(dialogName){
   var commands = []
   commands.push(new Command("selectChromeWindow", dialogName))
   commands.push(new Command("sendKeys", "document.documentElement", "return"))
   commands.push(new Command("selectWindow"))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doCreateAction= function(locator, shortcutKey){
   var commands = []
   commands.push(new Command("selectWindow"))
   commands.push(new Command("mouseOver", locator))
   commands.push(new Command("sleep", "300"))
   commands.push(new Command("sendKeysAsync", locator, shortcutKey))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doCreateNewScript= function(){
//   this.doSetTimeout(10000)
   var commands = []
   commands.push(new Command("sendKeys", "document.documentElement", "F10, escape"))
   commands.push(new Command("selectChromeWindow", "sidebar", ""))
   commands.push(new Command("selectByLabelXUL", "scripts", "New*"))
   commands.push(new Command("selectWindow", null, null))
   IDEIncludeCommand.insertCommands(commands)
}


//Deletes all CYW Test Scripts
Selenium.prototype.doDeleteAllCywTestScripts = function() {
   var browserWin = Utils.getBrowserWin()   
   var scriptFiles = browserWin.customizeyourweb.CywConfig.getScriptFiles()
   scriptFiles.forEach(function(scriptFile){
      if(scriptFile.leafName.indexOf("file_G")!=-1){
         scriptFile.remove(false)
      }
   })
   browserWin.customizeyourweb.CywConfig.init()
}

Selenium.prototype.doDeleteLastAction = function(){
   var commands = []
   commands.push(new Command("focus", "actionsTreeView"))
   commands.push(new Command("sendKeys", "actionsTreeView", "end"))
   commands.push(new Command("sleep", "200"))
   commands.push(new Command("clickXUL", "deleteActionBtn"))
   commands.push(new Command("selectWindow"))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doDeleteScript = function(){
   this.replaceConfirmationOnDeletion()
   var commands = []
   commands.push(new Command("resetNewPageLoaded"))
   commands.push(new Command("selectChromeWindow", "sidebar"))
   commands.push(new Command("clickXUL", "deleteBtn"))
   commands.push(new Command("sendKeys", "document.documentElement", "F10"))
   commands.push(new Command("selectChromeWindow"))
   commands.push(new Command("sendKeys", "document.documentElement", "F5"))
   commands.push(new Command("waitForPageToLoad"))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doEditLastAction= function(){
   var commands = []
   commands.push(new Command("sendKeys", "document.documentElement", "F10, escape"))
   commands.push(new Command("selectChromeWindow", "sidebar", ""))
   commands.push(new Command("focus", "actionsTreeView"))
   commands.push(new Command("sendKeys", "actionsTreeView", "end"))
   commands.push(new Command("sleep", "200"))
   commands.push(new Command("clickXULAsync", "editActionBtn"))
   commands.push(new Command("selectChromeWindow", "CommonAttrEdit"))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.doLoadCywTemplate = function(path){
   var fileToLoad = FileUtils.getIncludeFile(path)
   var iOService = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);
   var url = iOService.newFileURI(fileToLoad).resolve("")
   var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
   var templateObj = new CywTestTemplateBase()
   subScriptLoader.loadSubScript(url, templateObj)
   for(var templFuncName in templateObj){
      Selenium.prototype[templFuncName] = templateObj[templFuncName]
   }
   commandFactory.registerAll(this)
}

Selenium.prototype.doSaveScript= function(){
   var commands = []
   commands.push(new Command("resetNewPageLoaded"))
   commands.push(new Command("selectChromeWindow", "sidebar"))
   commands.push(new Command("clickXUL", "saveBtn"))
   commands.push(new Command("selectWindow"))
   commands.push(new Command("waitForPageToLoad"))
   IDEIncludeCommand.insertCommands(commands)
}

//Starts editing and waits until sidebar is opened
Selenium.prototype.doStartEditing= function(){
//   this.doSetTimeout(10000)
   var commands = []
   commands.push(new Command("sendKeys", "document.documentElement", "F10, escape"))
   commands.push(new Command("selectChromeWindow", "sidebar", ""))
   IDEIncludeCommand.insertCommands(commands)
}

Selenium.prototype.replaceConfirmationOnClose= function(){
   var sidebarWin = Utils.getSidebarWin()
   if(!sidebarWin){
      return
   }
   //Replace confirmation and always return false (no saving)
   sidebarWin.customizeyourweb.CywSidebarWinHandler.isSaveScriptOnModification = function(){
      return false;
   }
}

Selenium.prototype.replaceConfirmationOnDeletion= function(){
   //Replace confirmation and always return true (delete script)
   Utils.getSidebarWin().customizeyourweb.CywSidebarWinHandler.isConfirmDeleteScript = function(){
      return true;
   }
}

Selenium.prototype.doRetargetAction = function(){
   var retargetLocator = this.getRetargetLocator()
   IDEIncludeCommand.insertCommands([
      new Command("mouseOver", retargetLocator),
      new Command("sleep", 200),
      new Command("sendKeys", "t")
   ])
}

Selenium.prototype.doSaveScript= function(){
   var commands = []
   commands.push(new Command("selectChromeWindow", "sidebar"))
   commands.push(new Command("resetNewPageLoaded"))
   commands.push(new Command("clickXUL", "saveBtn"))
   commands.push(new Command("selectWindow"))
   commands.push(new Command("waitForPageToLoad"))
   IDEIncludeCommand.insertCommands(commands)
}

//Shortcuts
//select common edit dialog
Selenium.prototype.doSced= function(){
   return this.doSelectChromeWindow("CommonAttrEdit")
}

//select content win
Selenium.prototype.doScw= function(){
   this.doSelectChromeWindow()
}

//select content win
Selenium.prototype.doSw= function(){
   this.doSelectWindow()
}

//select sidebar win
Selenium.prototype.doSsw= function(){
   var waitCondition = this.doSelectChromeWindow("sidebar")
   return waitCondition
   
}

//Set up test
Selenium.prototype.doSetUpTest= function(){
   this.replaceConfirmationOnClose()
   this.doDeleteAllCywTestScripts()
   this.assureClosedSidebar()
}

Selenium.prototype.doUndoLastCommand = function(){
   var commands = []
   commands.push(new Command("selectWindow"))
   commands.push(new Command("sendKeys", "document.documentElement", "ctrl+z"))
   IDEIncludeCommand.insertCommands(commands)
   
}

function CywTestTemplateBase (){
}
CywTestTemplateBase.prototype = {
   doCreateActionTpl: function(){
      throw new SeleniumError("doCreateActionTpl must be overridden")
   },
   
   doAssertNoModificationTpl: function(){
      throw new SeleniumError("doAssertNoModificationTpl must be overridden")
   },

   doFirstModificationTpl: function(){
   },
   
   doAssertFirstModificationTpl: function(){
      throw new SeleniumError("doAssertFirstModificationTpl must be overridden")
   },
   
   doSecondModificationTpl: function(){
   },
   
   doAssertRetargetModificationTpl: function(){
      throw new SeleniumError("doAssertSecondModificationTpl must be overridden")
   },

   doAssertSecondModificationTpl: function(){
      throw new SeleniumError("doAssertSecondModificationTpl must be overridden")
   },
   
   getRetargetLocator: function(){
      throw new SeleniumError("getRetargetLocator must be overridden")
   },
   
   hasPreview: function(){
      return false
   }
}
objectExtend(Selenium.prototype, CywTestTemplateBase.prototype)

