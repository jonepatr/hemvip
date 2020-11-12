function VideoVisualizer(_parent, _conditions) {
  this.parent = _parent;
  this.eventListeners = [];
  this.currentVideo = null;
  this.currentVideoIndex = null;

  this.conditions = _conditions;

  var mainDiv = $('<div id="main-video-frame"></div');

  var _videoElements = [];

  this.videoPlaceholder = $(
    '<div id="video-placeholder">When you press play on one of the buttons below, a video will appear here</div>'
  );
  mainDiv.append(this.videoPlaceholder);
  var self = this;
  this.conditions.forEach(function (condition, i) {
    videoElement = $('<div id="vimeo_video_player_'+i+'" class="video-element"></div>').get(0);

    videoElement.style.border = "5px solid " + condition.color;
    mainDiv.append(videoElement);
    _videoElements.push(videoElement);

    var player = new Vimeo.Player(videoElement, {url: condition.getFilepath(), height: 400, dnt: true})

    player.on("pause", function(e) {
      self.sendEvent({
        name: "pauseTriggered",
        index: self.currentVideoIndex,
        conditionLength: self.conditions.length,
        seconds: e.seconds
      });
    })

    player.on("play", function(e) {
      var event = {
        name: "playConditionTriggered",
        index: self.currentVideoIndex,
        length: self.conditions.length,
        seconds: e.seconds
      };
      self.sendEvent(event);
    })
    
  });
  this.videoElements = _videoElements;

  this.parent.append(mainDiv);
}

VideoVisualizer.prototype.playCondition = function (_index) {
  this.videoPlaceholder.get(0).style.display = "none";
  this.videoElements.forEach(function (videoElement, i) {
    if (i == _index) {
      videoElement.style.display = "block";
    } else {
      var player = new Vimeo.Player(videoElement);
      player.getPaused().then(function(paused) {
        if (!paused) {
          player.pause();
          player.setCurrentTime(0);
        }
      });
      videoElement.style.display = "none";
    }
  });
  this.currentVideo = this.videoElements[_index];
  this.currentVideoIndex = _index;

  (new Vimeo.Player(this.currentVideo)).play();

  return;
};

VideoVisualizer.prototype.pause = function () {
  (new Vimeo.Player(this.currentVideo)).pause();
  return;
};

VideoVisualizer.prototype.getConditions = function () {
  return this.conditions;
};

VideoVisualizer.prototype.removeEventListener = function (_index) {
  this.eventListeners[_index] = null;
};

VideoVisualizer.prototype.addEventListener = function (_listenerFunction) {
  this.eventListeners[this.eventListeners.length] = _listenerFunction;
  return this.eventListeners.length - 1;
};

VideoVisualizer.prototype.sendEvent = function (_event) {
  for (var i = 0; i < this.eventListeners.length; ++i) {
    if (this.eventListeners[i] === null) {
      continue;
    }
    this.eventListeners[i](_event);
  }
};
