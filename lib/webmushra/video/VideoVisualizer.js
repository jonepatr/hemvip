function VideoVisualizer(_variableName, _parent, _conditions) {
  this.variableName = _variableName;
  this.parent = _parent;
  this.eventListeners = [];
  this.currentVideo = null;
  this.conditions = _conditions;

  var mainDiv = $('<div id="parentWavesurfer" style="height: 480px; display: block; width: 100%; backgrond-color: red"></div');

  var _videoElements = []

  this.conditions.forEach(function (condition, i) {
    var display = 'style="display: none; height: 100%;"';
    var videoElement = $(
      '<video src="' + condition.getFilepath() + '" ' + display + '  controls></video>'
    ).get(0);
    mainDiv.append(videoElement);
    _videoElements.push(videoElement)
  });
  this.videoElements = _videoElements

  this.parent.append(mainDiv);

}

VideoVisualizer.prototype.playCondition = function (_index) {

  this.videoElements.forEach(function (videoElement, i) {
    if (i == _index) {
      videoElement.style.display = "block";
    } else {
      videoElement.pause();
      videoElement.currentTime = 0;
      videoElement.style.display = "none";
    }
  });
  this.currentVideo = this.videoElements[_index]
  
  this.currentVideo.play()
  var event = {
    name: "playConditionTriggered",
    index: _index,
    length: this.conditions.length,
  };
  this.sendEvent(event);

  return;
};

VideoVisualizer.prototype.pause = function () {
  this.currentVideo.pause()
  var event = {
    name: "pauseTriggered",
    conditionLength: this.conditions.length,
  };
  this.sendEvent(event);
  return;
};

VideoVisualizer.prototype.stop = function () {
  this.currentVideo.pause()
  this.currentVideo.currentTime = 0;
  this.currentVideo = null;

  var event = {
    name: "stopTriggered",
    conditionLength: this.conditions.length,
  };
  this.sendEvent(event);

  return;
};

VideoVisualizer.prototype.getConditions = function () {
  return this.conditions;
};

VideoVisualizer.prototype.removeEventListener = function(_index) {
  this.eventListeners[_index] = null;  
};


VideoVisualizer.prototype.addEventListener = function(_listenerFunction) {
  this.eventListeners[this.eventListeners.length] = _listenerFunction;
  return this.eventListeners.length-1;
};

VideoVisualizer.prototype.sendEvent = function(_event) {
  for (var i = 0; i < this.eventListeners.length; ++i) {
  	if (this.eventListeners[i] === null) {
  		continue;
  	}
    this.eventListeners[i](_event);
  }
};