function Logger() {}

Logger.prototype.log = function(message) {
  window.console.log(message);
};

window.logger = new Logger()
