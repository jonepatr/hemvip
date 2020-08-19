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

function VideoPage(
  _pageManager,
  _pageTemplateRenderer,
  _session,
  _config,
  _pageConfig,
  _errorHandler,
  _language
) {
  this.isMushra = true;
  this.pageManager = _pageManager;
  this.pageTemplateRenderer = _pageTemplateRenderer;
  this.session = _session;
  this.config = _config;
  this.pageConfig = _pageConfig;
  this.errorHandler = _errorHandler;
  this.language = _language;
  this.div = null;
  this.videoVisualizer = null;
  this.interactionTracker = []

  this.currentItem = null;
  this.playedStimuli = [];
  this.tdLoop2 = null;

  this.conditions = [];

  var colors = shuffle([
    "orange",
    "red",
    "green",
    "yellow",
    "blue",
    "purple",
    "fuchsia",
    "aqua",
  ]);

  function newStimulus(i, key, video, atVal) {
    var stimulus = new Stimulus(key, video);
    stimulus.color = colors[i];
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
    if (key == "at") {
      var stimulus = newStimulus(
        i,
        key,
        stimuli,
        this.pageConfig.stimuli[item][2]
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

VideoPage.prototype.getName = function () {
  return this.pageConfig.name;
};

VideoPage.prototype.init = function () {
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
              }; 
              if ( uniqueIdCount == 1) { 
                  segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                  return segs.join('/'); 
              } else { 
                  segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
              } 
      } else if (elm.hasAttribute('class')) { 
          segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
      } else { 
          for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
              if (sib.localName == elm.localName)  i++; }; 
              segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
      }; 
  }; 
  return segs.length ? '/' + segs.join('/') : null; 
}; 
VideoPage.prototype.render = function (_parent) {
  var div = $("<div></div>");
  _parent.append(div);
  var content;
  if (this.pageConfig.content === null) {
    content = "";
  } else {
    content = this.pageConfig.content;
  }

  var p = $("<p>" + content + "</p>");
  div.append(p);

  var tableUp = $("<div id='mainUp'></div>");
  var tableDown = $("<table id='mainDown' align = 'center'></table>");
  div.append(tableUp);
  div.append($("<p><b><i>" + this.pageConfig.question + "<i></b></p>"));
  div.append(tableDown);
  var trMushra = $("<tr></tr>");
  tableDown.append(trMushra);
  var tdMushra = $("<td id='td_Mushra' colspan='2'></td>");
  trMushra.append(tdMushra);

  var tableMushra = $("<table id='mushra_items'></table>");
  tdMushra.append(tableMushra);

  var trConditionNames = $("<tr></tr>");
  tableMushra.append(trConditionNames);

  var tdConditionNamesReference = $("<td></td>");

  trConditionNames.append(tdConditionNamesReference);

  var tdConditionNamesScale = $("<td id='conditionNameScale'></td>");
  trConditionNames.append(tdConditionNamesScale);

  var conditions = this.conditions;
  var i;
  for (i = 0; i < conditions.length; ++i) {
    var str = "";
    if (this.pageConfig.showConditionNames === true) {
      str = "<br/>" + conditions[i].id;
    }
    td = $(
      "<td>" +
        this.pageManager.getLocalizer().getFragment(this.language, "cond") +
        (i + 1) +
        str +
        "</td>"
    );
    trConditionNames.append(td);
  }

  var trConditionPlay = $("<tr></tr>");
  tableMushra.append(trConditionPlay);

  var tdConditionPlayReference = $("<td></td>");
  trConditionPlay.append(tdConditionPlayReference);

  var tdConditionPlayScale = $("<td></td>");
  trConditionPlay.append(tdConditionPlayScale);

  for (i = 0; i < conditions.length; ++i) {
    td = $("<td></td>");
    var buttonPlay = $(
      "<button data-role='button' class='center audioControlElement' onclick='" +
        this.pageManager.getPageVariableName(this) +
        ".btnCallbackCondition(" +
        i +
        ");'>" +
        this.pageManager
          .getLocalizer()
          .getFragment(this.language, "playButton") +
        "</button>"
    );
    buttonPlay.attr("id", "buttonConditions" + i);
    td.append(buttonPlay);
    trConditionPlay.append(td);
    // (function(i) {
    // Mousetrap.bind(String(i + 1), function() { this.pageManager.getCurrentPage().btnCallbackCondition(i); });
    // })(i);
  }

  // ratings
  var trConditionRatings = $("<tr id='tr_ConditionRatings'></tr>");
  tableMushra.append(trConditionRatings);

  var tdConditionRatingsReference = $("<td id='refCanvas'></td>");
  trConditionRatings.append(tdConditionRatingsReference);

  var tdConditionRatingsScale = $("<td id='spaceForScale'></td>");
  trConditionRatings.append(tdConditionRatingsScale);

  for (i = 0; i < conditions.length; ++i) {
    td = $(
      "<td class='spaceForSlider'> \
      <span class='slider-color-" +
        conditions[i].color +
        "'><input type='range' name='" +
        conditions[i].getId() +
        "' class='scales' value='0' min='0' max='100' data-vertical='true' data-highlight='true' style='display : inline-block; float : none;'/></span> \
    </td>"
    );
    $(".ui-slider-handle").unbind("keydown");
    trConditionRatings.append(td);
  }
  var interactionTracker = this.interactionTracker

  function track(type_, el, extra) {
    var t = (new Date().getTime()) / 1000
    interactionTracker.push([type_, el, t, extra])
  }

  function recordEvent(e) {
    track(e.type, createXPathFromElement(e.target))
  }

  $(div).on("click", recordEvent);

  

  this.videoVisualizer = new VideoVisualizer(tableUp, this.conditions);
  this.videoVisualizer.addEventListener(
    function (_event) {
      if (_event.name == "playConditionTriggered") {
        var index = _event.index;
        track("play_video", "video_" + index, _event.seconds)
        var activeSlider = $(".scales").get(index);
        var selector = "#buttonConditions" + index;

        this.playedStimuli.push(index);
        if (new Set(this.playedStimuli).size == $(".scales").length) {
          this.pageTemplateRenderer.unlockNextButton();
        }

        if ($("#buttonStop").attr("active") == "true") {
          $.mobile.activePage
            .find("#buttonStop") //remove color from Stop
            .removeClass("ui-btn-b")
            .addClass("ui-btn-a")
            .attr("data-theme", "a");
          $("#buttonStop").attr("active", "false");
        }

        var k;
        for (k = 0; k < _event.length; k++) {
          active = "#buttonConditions" + k;
          if ($(active).attr("active") == "true") {
            $.mobile.activePage
              .find(active) // remove color from conditions
              .removeClass("ui-btn-b")
              .addClass("ui-btn-a")
              .attr("data-theme", "a");
            $(active).attr("active", "false");
            break;
          }
        }

        $(activeSlider).slider("enable");
        $(activeSlider).attr("active", "true");
        $.mobile.activePage
          .find(selector) //add color to conditions
          .removeClass("ui-btn-a")
          .addClass("ui-btn-b")
          .attr("data-theme", "b");
        $.mobile.activePage.find(selector).focus();
        $(selector).attr("active", "true");
      } else if (_event.name == "pauseTriggered") {
        track("pause_video", "video_" + _event.index, _event.seconds)
      }
    }.bind(this)
  );
};

VideoPage.prototype.pause = function () {
  this.videoVisualizer.pause();
};

VideoPage.prototype.btnCallbackCondition = function (_index) {
  this.currentItem = _index;

  var label = $("#buttonConditions" + _index).text();
  if (
    label ==
    this.pageManager.getLocalizer().getFragment(this.language, "pauseButton")
  ) {
    this.videoVisualizer.pause();
    $("#buttonConditions" + _index).text(
      this.pageManager.getLocalizer().getFragment(this.language, "playButton")
    );
  } else if (
    label ==
    this.pageManager.getLocalizer().getFragment(this.language, "playButton")
  ) {
    $(".audioControlElement").text(
      this.pageManager.getLocalizer().getFragment(this.language, "playButton")
    );
    this.videoVisualizer.playCondition(_index);
    $("#buttonConditions" + _index).text(
      this.pageManager.getLocalizer().getFragment(this.language, "pauseButton")
    );
  }
};

VideoPage.prototype.renderCanvas = function (_parentId) {
  $("#mushra_canvas").remove();
  parent = $("#" + _parentId);
  var canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.zIndex = 0;
  canvas.setAttribute("id", "mushra_canvas");
  parent.get(0).appendChild(canvas);
  $("#mushra_canvas").offset({
    top: $("#refCanvas").offset().top,
    left: $("#refCanvas").offset().left,
  });
  canvas.height =
    parent.get(0).offsetHeight -
    (parent.get(0).offsetHeight - $("#tr_ConditionRatings").height());
  canvas.width = parent.get(0).offsetWidth;

  $(".scales").siblings().css("zIndex", "1");

  var canvasContext = canvas.getContext("2d");

  var YfreeCanvasSpace =
    $(".scales").prev().offset().top - $(".scales").parent().offset().top;
  var YfirstLine =
    $(".scales").parent().get(0).offsetTop +
    parseInt($(".scales").css("borderTopWidth"), 10) +
    YfreeCanvasSpace;
  var prevScalesHeight = $(".scales").prev().height();
  var xDrawingStart =
    $("#spaceForScale").offset().left -
    $("#spaceForScale").parent().offset().left +
    canvasContext.measureText("100 ").width * 1.5;
  var xAbsTableOffset =
    -$("#mushra_items").offset().left -
    ($("#mushra_canvas").offset().left - $("#mushra_items").offset().left);
  var xDrawingBeforeScales =
    $(".scales").first().prev().children().eq(0).offset().left +
    xAbsTableOffset;
  var xDrawingEnd =
    $(".scales").last().offset().left -
    $("#mushra_items").offset().left +
    $(".scales").last().width() / 2;

  canvasContext.beginPath();
  canvasContext.moveTo(xDrawingStart, YfirstLine);
  canvasContext.lineTo(xDrawingEnd, YfirstLine);
  canvasContext.stroke();

  var scaleSegments = [0.2, 0.4, 0.6, 0.8];
  var i;
  for (i = 0; i < scaleSegments.length; ++i) {
    canvasContext.beginPath();
    canvasContext.moveTo(
      xDrawingStart,
      prevScalesHeight * scaleSegments[i] + YfirstLine
    );
    canvasContext.lineTo(
      xDrawingBeforeScales,
      prevScalesHeight * scaleSegments[i] + YfirstLine
    );
    canvasContext.stroke();

    var predecessorXEnd = null;
    $(".scales").each(function (index) {
      var sliderElement = $(this).prev().first();
      if (index > 0) {
        canvasContext.beginPath();
        canvasContext.moveTo(
          predecessorXEnd,
          prevScalesHeight * scaleSegments[i] + YfirstLine
        );
        canvasContext.lineTo(
          sliderElement.offset().left + xAbsTableOffset,
          prevScalesHeight * scaleSegments[i] + YfirstLine
        );
        canvasContext.stroke();
      }
      predecessorXEnd =
        sliderElement.offset().left +
        sliderElement.width() +
        xAbsTableOffset +
        1;
    });
  }

  canvasContext.beginPath();
  canvasContext.moveTo(xDrawingStart, prevScalesHeight + YfirstLine);
  canvasContext.lineTo(xDrawingEnd, prevScalesHeight + YfirstLine);
  canvasContext.stroke();

  canvasContext.font = "1.25em Calibri";
  canvasContext.textBaseline = "middle";
  canvasContext.textAlign = "center";
  var xLetters =
    $("#refCanvas").width() +
    ($("#spaceForScale").width() + canvasContext.measureText("1 ").width) / 2.0;

  canvasContext.fillText(
    this.pageManager.getLocalizer().getFragment(this.language, "excellent"),
    xLetters,
    prevScalesHeight * 0.1 + YfirstLine
  );
  canvasContext.fillText(
    this.pageManager.getLocalizer().getFragment(this.language, "good"),
    xLetters,
    prevScalesHeight * 0.3 + YfirstLine
  );
  canvasContext.fillText(
    this.pageManager.getLocalizer().getFragment(this.language, "fair"),
    xLetters,
    prevScalesHeight * 0.5 + YfirstLine
  );
  canvasContext.fillText(
    this.pageManager.getLocalizer().getFragment(this.language, "poor"),
    xLetters,
    prevScalesHeight * 0.7 + YfirstLine
  );
  canvasContext.fillText(
    this.pageManager.getLocalizer().getFragment(this.language, "bad"),
    xLetters,
    prevScalesHeight * 0.9 + YfirstLine
  );

  canvasContext.font = "1em Calibri";
  canvasContext.textAlign = "right";
  var xTextScoreRanges =
    xDrawingStart - canvasContext.measureText("100 ").width * 0.25; // $("#refCanvas").width()
  canvasContext.fillText("100", xTextScoreRanges, YfirstLine);
  canvasContext.fillText(
    "80",
    xTextScoreRanges,
    prevScalesHeight * 0.2 + YfirstLine
  );
  canvasContext.fillText(
    "60",
    xTextScoreRanges,
    prevScalesHeight * 0.4 + YfirstLine
  );
  canvasContext.fillText(
    "40",
    xTextScoreRanges,
    prevScalesHeight * 0.6 + YfirstLine
  );
  canvasContext.fillText(
    "20",
    xTextScoreRanges,
    prevScalesHeight * 0.8 + YfirstLine
  );
  canvasContext.fillText("0", xTextScoreRanges, prevScalesHeight + YfirstLine);
};

VideoPage.prototype.load = function () {
  this.startTimeOnPage = new Date();
  this.pageTemplateRenderer.lockNextButton();
  this.renderCanvas("mushra_items");

  if (this.ratings.length !== 0) {
    var scales = $(".scales");
    var i;
    for (i = 0; i < scales.length; ++i) {
      $(".scales").eq(i).val(this.ratings[i].value).slider("refresh");
    }
  }
};

VideoPage.prototype.save = function () {
  this.time += new Date() - this.startTimeOnPage;
  var scales = $(".scales");
  this.ratings = [];
  var i;
  var atKey = null;
  var atVal = null;

  for (key in this.conditions) {
    if (this.conditions[key].at) {
      atKey = this.conditions[key].getId();
      atVal = this.conditions[key].atVal;
    }
  }
  for (i = 0; i < scales.length; ++i) {
    if (atKey && atKey == scales[i].name) {
      if (atVal < scales[i].value - 3 || atVal > scales[i].value + 3) {
        errorHandler.sendError("Failed!!");

        $.ajax({
          type: "POST",
          url: this.config.remoteFailService,
          data: { user_id: this.config.userId, test_id: this.config.testId },
          async: false,
          success: function () {
            location.href = "/failed_task";
          },
        });
      }
    }
    this.ratings[i] = { name: scales[i].name, value: scales[i].value };
  }
};

VideoPage.prototype.store = function () {
  var trial = new Trial();
  trial.type = this.pageConfig.type;
  trial.id = this.pageConfig.id;
  trial.interaction = $.extend(true,{},this.interactionTracker)
  this.interactionTracker = []
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

VideoPage.prototype.checkNumConditions = function (_conditions) {
  if (_conditions.length > 8) {
    this.errorHandler.sendError("Number of conditions must be no more than 6.");
    return false;
  }
  return true;
};
