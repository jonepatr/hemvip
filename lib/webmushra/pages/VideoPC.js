/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function VideoPC(
  _pageManager,
  _pageTemplateRenderer,
  _session,
  _config,
  _pageConfig,
  _errorHandler,
  _language
) {
  this.isMushra = false;
  this.pageManager = _pageManager;
  this.pageTemplateRenderer = _pageTemplateRenderer;
  this.session = _session;
  this.config = _config;
  this.pageConfig = _pageConfig;
  this.errorHandler = _errorHandler;
  this.language = _language;
  this.div = null;
  this.videoVisualizer = null;
  this.interactionTracker = [];
  this.watched = false;
  this.currentItem = null;
  this.playedStimuli = [];
  this.tdLoop2 = null;
  this.reportButtonUnlockTimeout = 5000; // milliseconds

  this.conditions = [];

  function newStimulus(i, key, video, atVal) {
    var stimulus = new Stimulus(key, video);
    if (atVal) {
      stimulus.at = true;
      stimulus.atVal = atVal;
    }
    return stimulus;
  }

  var i = 0;
  for (var item in this.pageConfig.stimuli) {
    key = this.pageConfig.stimuli[item][0];
    stimuli = this.pageConfig.stimuli[item][1];
    if (key.search("attn") != -1) {
      var stimulus = newStimulus(
        i,
        key,
        stimuli,
        true
      );
    } else {
      var stimulus = newStimulus(i, key, stimuli);
    }
    this.conditions[this.conditions.length] = stimulus;
    i++;
  }

  // data
  this.ratings = [];

  this.time = 0;
  this.startTimeOnPage = null;
}

VideoPC.prototype.getName = function () {
  return this.pageConfig.name;
};

VideoPC.prototype.init = function () {
  if (this.pageConfig.strict !== false) {
    this.checkNumConditions(this.conditions);
  }
};
function createXPathFromElement(elm) { 
  var allNodes = document.getElementsByTagName('*'); 
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
  { 
      if (elm.hasAttribute('id')) { 
              var uniqueIdCount = 0; 
              for (var n=0;n < allNodes.length;n++) { 
                  if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                  if (uniqueIdCount > 1) break; 
              }
              if ( uniqueIdCount == 1) { 
                  segs.unshift('id(' + elm.getAttribute('id') + ')'); 
                  return segs.join('/'); 
              } else { 
                  segs.unshift(elm.localName.toLowerCase() + '[@id=' + elm.getAttribute('id') + ']'); 
              } 
      } else if (elm.hasAttribute('class')) { 
          segs.unshift(elm.localName.toLowerCase() + '[@class=' + elm.getAttribute('class') + ']'); 
      } else { 
          for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
              if (sib.localName == elm.localName)  i++; }
              segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
      }
  }
  return segs.length ? '/' + segs.join('/') : null;
}

VideoPC.prototype.render = function (_parent) {
  var div = $("<div></div>");
  var global = this;
  _parent.append(div);
  var content;
  if (this.pageConfig.content === null) {
    content = "";
  } else {
    content = this.pageConfig.content;
  }

  var p = $("<p>" + content + "</p>");


  var interactionTracker = this.interactionTracker;

  function track(type_, el, extra) {
    var t = (new Date().getTime()) / 1000;
    interactionTracker.push([type_, el, t, extra]);
  }

  function recordEvent(e) {
    track(e.type, createXPathFromElement(e.target));
  }

  $(div).on("click", recordEvent);

  global.ratings.push({name: global.conditions[0].getId(), value: null});
  global.ratings.push({name: global.conditions[1].getId(), value: null});

  var cp = $("<input type='radio' id='left-video' name='selection' value='left-video'><label for='left-video'>The character in the video on the <i>left</i></label>");
  cp.click(function(){
        global.ratings[0].value = true;
        global.ratings[1].value = false;
        if(global.watched){
          global.pageTemplateRenderer.unlockNextButton();
        }
  });
  var cr = $("<input type='radio' id='right-video' name='selection' value='right-video'><label for='right-video'>The character in the video on the <i>right</i></label>");
  cr.click(function(){
    global.ratings[0].value = false;
    global.ratings[1].value = true;
    if(global.watched){
        global.pageTemplateRenderer.unlockNextButton();
    }
  });
  var eq = $("<input type='radio' id='both-video' name='selection' value='both-video'><label for='both-video'>They are equal</label>");
  eq.click(function(){
    global.ratings[0].value = false;
    global.ratings[1].value = false;
    if(global.watched){
        global.pageTemplateRenderer.unlockNextButton();
    }
  });

  div.append(p);
  /* We always put video1 on the left and video2 on the right */
  this.videoVisualizer = new VideoPCVisualizer(div, this.conditions);
  this.videoVisualizer.addEventListener(
    function (_event) {
      if (_event.name == "playConditionTriggered") {
        var index = _event.index;
        track("play_video", "video_" + index, _event.seconds);
        if(this.playedStimuli.includes(_event.index) === false){
            this.playedStimuli.push(_event.index);
        }
      } else if (_event.name == "pauseTriggered") {
        track("pause_video", "video_" + _event.index, _event.seconds);
        if(this.playedStimuli.length == 2) {
            this.watched = true;
        }
      }
    }.bind(this)
  );

  var cb = $("<div id='video-checkbox'></div>");
  var left = $("<div id='cbleft'></div>");
  var right = $("<div id='cbright'></div>");
  var equal = $("<div id='cbequal'></div>");
  div.append(cb);

  cb.append(left);
  cb.append(right);
  cb.append(equal);
  left.append(cp);
  right.append(cr);
  equal.append(eq);

};

VideoPC.prototype.save = function () {
  this.time += new Date() - this.startTimeOnPage;
  var scales = $(".scales");
  var global = this;

  $.post("/partial", data={
      ratings: JSON.stringify(global.ratings),
      user_id: this.config.userId,
      test_id: this.config.testId,
      page_id: this.pageConfig.id,
      interaction: JSON.stringify($.extend(true,{},this.interactionTracker)),
      navigator: this.session.navigator
  });
};

VideoPC.prototype.postCheck = function() {
  var atKey = null;
  var atVal = null;
  var remoteFailService = this.config.remoteFailService;
  var userId = this.config.userId;
  var testId = this.config.testId;
  var session = this.session;
  var global = this;
  var isReported = false;

  for (key in this.conditions) {
    if (this.conditions[key].at) {
      atKey = this.conditions[key].getId();
      atVal = this.conditions[key].atVal;
    }
  }

  for (var i = 0; i < global.ratings.length; ++i) {
    if (global.ratings[i].value == 99) { // Set in PageManager.js when report button is pressed
      isReported = true;
    }
  }
  
  if (atKey && !isReported) {
    this.pageManager.failedAttnChecks++;
  }

  if (!atKey && isReported) {
    this.pageManager.falseReports++;
  }

  return this.pageManager.tryTerminateStudy(remoteFailService, userId, testId, session);

};

VideoPC.prototype.load = function () {
  this.startTimeOnPage = new Date();
  this.pageTemplateRenderer.lockNextButton();
  this.pageTemplateRenderer.lockReportButton();
  var global = this;
  setTimeout(this.pageTemplateRenderer.unlockReportButton, global.reportButtonUnlockTimeout);
};

VideoPC.prototype.store = function () {
  var trial = new Trial();
  trial.type = this.pageConfig.type;
  trial.id = this.pageConfig.id;
  trial.interaction = $.extend(true,{},this.interactionTracker);
  this.interactionTracker = [];
  var i;
  for (i = 0; i < this.ratings.length; ++i) {
    var rating = this.ratings[i];
    var ratingObj = new MUSHRARating();
    ratingObj.stimulus = rating.name;
    ratingObj.score = rating.value;
    ratingObj.time = this.time;
    trial.responses[trial.responses.length] = ratingObj;
  }
  this.session.trials[this.session.trials.length] = trial;
};

/** 
VideoPC.prototype.render = function (_parent) {
    _parent.append(this.content);
    return;
};*/

VideoPC.prototype.checkNumConditions = function (_conditions) {
  if (_conditions.length > 8) {
    this.errorHandler.sendError("Number of conditions must be no more than 6.");
    return false;
  }
  return true;
};
