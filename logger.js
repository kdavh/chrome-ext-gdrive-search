function Logger(log_area) {
  this.setLogArea(log_area);
}

Logger.prototype.setLogArea = function(log_area) {
  this.log_area = log_area;
}

Logger.prototype.log = function(message, currentWindow, currentAppWindowId) {

  currentWindow.console.log(message);

  if (this.log_area) {
    // convert the message to string, if necessary
    var messageStr = message;
    if (typeof(message) != 'string') {
      messageStr = JSON.stringify(message);
    }

    // log to the textarea HTML element
    this.log_area.innerText += messageStr;

    // if this is not the window with the log area, log to its console too
    if (this.log_area.ownerDocument &&
        this.log_area.ownerDocument.defaultView &&
        this.log_area.ownerDocument.defaultView != currentWindow) {
      this.log_area.ownerDocument.defaultView.console.log(
        "[WIN:"+currentAppWindowId+"]",message);
    }

  }
};
