/*
 * Locator for anonymous elements within xbl
 * @parma String locator: xbl:<elementid>@<anonid>
 */
PageBot.prototype.locateElementByXbl = function(locator, document) {
   var parts = locator.split("@")
   Assert.equals(parts.length, 2)
   var xblElement = document.getElementById(parts[0])
   return document.getAnonymousElementByAttribute(xblElement, "anonid", parts[1])
}

SeleniumIDEChromePluginBackupObj = window.SeleniumIDEChromePluginBackupObj || {}
SeleniumIDEChromePluginBackupObj.decorateFunctionWithTimeout = Selenium.decorateFunctionWithTimeout 

Selenium.decorateFunctionWithTimeout = function(f, timeout, callback) {
   if(!timeout){
      var configuredTimeout = editor.app.getOptions().timout
      configuredTimeout = parseInt(configuredTimeout)
      if(isNaN(configuredTimeout)){
         timeout = Selenium.DEFAULT_TIMEOUT
      }else{
         timeout = configuredTimeout
      }
   }
   return SeleniumIDEChromePluginBackupObj.decorateFunctionWithTimeout(f, timeout, callback)
}

/*
 * Action for clicking on xul element using the click() method
 */
Selenium.prototype.doClickXUL = function(locator) {
   var element = this.browserbot.findElement(locator)   
   Assert.isTrue(element.click!=null, "No clickable element")
   element.click()
}

/*
 * Async click to avoid blocking of selenium if modal dialog is opened
 */
Selenium.prototype.doClickXULAsync = function(locator) {
   var executionWin = Utils.getSetTimeoutExecutionWin(this.browserbot.findElement(locator))
   var self = this
   executionWin.setTimeout(function(){
      self.doClickXUL(locator)}
   , 0)
}

Selenium.prototype.doResetNewPageLoaded = function(locator) {
   this.browserbot.newPageLoaded = false
}

/*
 * Selects listbox, menulist by label pattern
 */
Selenium.prototype.doSelectByLabelXUL = function(locator, pattern) {
   var list = this.browserbot.findElement(locator)
   Assert.isTrue(list.itemCount != undefined, "No list selected")
   for (var i = 0; i < list.itemCount; i++) {
      if(PatternMatcher.matches (pattern, list.getItemAtIndex(i).label)){
         list.selectedIndex = i
         return
      }
   }
}

/*
 * Selects chrome window
 * @param locator: null --> last browser win, sidebar --> sidebar win, name --> ww.getWindowByName
 */
Selenium.prototype.doSelectChromeWindow = function(locator) {
   var self = this
   return Selenium.decorateFunctionWithTimeout(function(){
      var chromeWin = null;
      if(locator == null || locator == ""){
         // make last browser win to current win
         chromeWin = Utils.getBrowserWin()         
      }else if(locator=="sidebar"){
         chromeWin = Utils.getSidebarWin()
      }else{
         var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                       .getService(Components.interfaces.nsIWindowWatcher);
         chromeWin = ww.getWindowByName(locator, null)
      }
      if(chromeWin == null || !Utils.isDocumentReady(chromeWin.document)){
         return false
      }
      var bb = self.browserbot
      bb.currentWindowName = locator;
      bb.currentWindow = chromeWin;
      bb.topFrame = chromeWin;
      bb.isSubFrameSelected = false;
      return true
   }, this.defaultTimeout)

}

/*
 * Selects tree cell by text pattern
 * @locator
 * @pattern @see PatternMatcher
 */
Selenium.prototype.doSelectTreeByCellText = function(locator, pattern) {
   var tree = this.browserbot.findElement(locator)
   var view = tree.view
   view.selection.clearSelection()
   var columns = tree.columns
   var rowCount = view.rowCount
   rowLoop:
   for(var i=0; i<rowCount; i++){
      for(var j=0; j<columns.length; j++){
         var cellText = view.getCellText(i, columns[j])
         if(PatternMatcher.matches (pattern, cellText)) {
            view.selection.rangedSelect(i, i, true)
            continue rowLoop;
         }
      }   
   }
}

/*
 * Sends key events to element
 * Supports modifiers
 * @param String locator: element locator
 * @param String value: key sequence in the following syntaxt ([Cltr+]? | [Shift+]? | [Alt+]? <KeyEvent.keyName>)
 *                      Multiple entries must be comma sepearted
 */
Selenium.prototype.doSendKeys = function(locator, value) {
   var element = null
   if(locator==null || locator.length==0){
      element = this.browserbot.currentWindow.document.documentElement;
   }else{
      element = this.browserbot.findElement(locator);
   }
   element.focus()
   //Replace whitespace
   var keySeq = value.replace(/\s*/g, "")
   var keys = keySeq.split(",")
   for (var i = 0; i < keys.length; i++) {
      var keyParts = keys[i].toUpperCase().split("+")
      var keyEventName = "DOM_VK_" + keyParts.pop()
      var keyCode = KeyEvent[keyEventName]
      var controlKeyDown = keyParts.indexOf("CTRL")!=-1
      var altKeyDown = keyParts.indexOf("ATL")!=-1
      var shiftKeyDown = keyParts.indexOf("SHIFT")!=-1
      var metaKeyDown = keyParts.indexOf("META")!=-1

      var keyEvents = ["keydown", "keypress", "keyup"]
      for (var j = 0; j < keyEvents.length; j++) {
         Utils.triggerKeyEvent(element, keyEvents[j], keyCode, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown)
      }
   }
}

/*
 * Async verions of doSendKeys for avoiding blocking in case of opening a modal dialog
 */ 
Selenium.prototype.doSendKeysAsync = function(locator, value) {
   var executionWin = Utils.getSetTimeoutExecutionWin(this.browserbot.findElement(locator))
   var self = this
   executionWin.setTimeout(function(){
      self.doSendKeys(locator, value)}
   , 0)
}

/*
 * Non-busy sleep
 */
Selenium.prototype.doSleep = function(msec){
   Assert.notNull(msec)
   Assert.isTrue(msec.replace(/\d*/g,"").length==0, "No timeout specified or timeout not nummeric")
   var start = (new Date()).getTime()
   return Selenium.decorateFunctionWithTimeout(function () {
      var current = (new Date()).getTime()
      return (current - start) > msec
   }, 9999999);
   
}

/*
 * Utility functions
 */
Utils = {
   /*
    * Returns last browser win
    */
   getBrowserWin: function(){
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      return wm.getMostRecentWindow('navigator:browser');
   },
   
   /*
    * Determines which window must be used for timeout to not block selenium
    * @returns: window to use for setTimeout
    */
   getSetTimeoutExecutionWin: function(element){
      var win = element.ownerDocument.defaultView
      browserWin = Utils.getBrowserWin()
      var executionWin = null
      if(browserWin.gBrowser.getBrowserForDocument(win.top.document)!=null){
         //content win
         var executionWin = browserWin
      }else{
         //chrome win
         executionWin = win 
      }
      return executionWin 
   },
   
   /*
    * Returns sidebar win if it is completely loaded otherwise null
    * @retuns: sidebar win if open and completely loaded or null
    */
   getSidebarWin: function(){
      var browserWin = this.getBrowserWin()
      if(browserWin.document.getElementById("sidebar-box").hidden){
         return null
      }
      var sidebarWin = browserWin.document.getElementById("sidebar").contentWindow
      if(sidebarWin && sidebarWin.location.href!="about:blank" && sidebarWin.document.readyState == "complete"){
         return sidebarWin
      }else{
         null
      }
   },
   
   isDocumentReady: function(document){
      return document.readyState == "complete"
   },
   
   /*
    * Triggers key event on provided element
    */
   triggerKeyEvent: function(element, eventType, keyCode, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
      var doc = element.ownerDocument
      var evt = doc.createEvent('KeyEvents');
      evt.initKeyEvent(eventType, true, true, doc.defaultView, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, keyCode, keyCode);
      element.dispatchEvent(evt);
   }
}

/*
 * Extensions for Assert
 */
Assert.isTrue = function(condition, message){
   if(!condition){
      Assert.fail(message)
   }
}

Assert.notNull = function(params, message){
   message = message || "Param is null"
   for (var i = 0; i < params.length; i++) {
      if(params[i]==null){
         Assert.fail(message)
      }
   }
}

/*
 * @param String locator: absolute or relative path to file which should be included into TestCase; relative paths are evaluated relative to 
 *                         testcase.file.parent
 * @returns nsIFile 
 */
FileUtils.getIncludeFile = function(locator){
   //Check if absolute path
   var absolutePath = false
   var file = null
   try{
      file = FileUtils.getFile(locator)
      absolutePath = file.exists()
   }catch(e){}
   if(absolutePath){
      return file
   }
   //Is relative path
   var currentTestDir = testCase.file.parent
   file = FileUtils.appendRelativePath(currentTestDir, locator)
   if(file.exists()){
      return file
   }else{
      var msg = "File not exists for path: " + locator
      if(file){
         msg += " Evaluated file path: " + file.path
      }
      throw new SeleniumError(msg)
   }
}