/*************************************************************************
         (C) Copyright AudioLabs 2017

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.

Portions Copyright (C) Patrik Jonell and contributors 2021.

This file was edited 2021-09-02 by Patrik Jonell. All rights reserved.
These contributions are licensed under the MIT license. See LICENSE.txt for details.

**************************************************************************/

//when changing from portrait to landscape change to the right width
function checkOrientation() {
  var siteWidth = document.body.scrollWidth;
  $("#header").css("width", siteWidth.toString());
}

window.onresize = function (event) {
  if (pageManager && pageManager.getCurrentPage() && pageManager.getCurrentPage().isMushra == true) {
    pageManager.getCurrentPage().renderCanvas("mushra_items");
  }

  checkOrientation();
};

// callbacks
function callbackFilesLoaded() {
  pageManager.start();
  pageTemplateRenderer.renderProgressBar(("page_progressbar"));
  pageTemplateRenderer.renderHeader(("page_header"));
  pageTemplateRenderer.renderNavigation(("page_navigation"));

  if (config.stopOnErrors == false || !errorHandler.errorOccurred()) {
    $.mobile.loading("hide");
    $("body").children().children().removeClass('ui-disabled');
  } else {
    var errors = errorHandler.getErrors();
    var ul = $("<ul style='text-align:left;'></ul>");
    $('#popupErrorsContent').append(ul);
    for (var i = 0; i < errors.length; ++i) {
      ul.append($('<li>' + errors[i] + '</li>'));
    }
    $("#popupErrors").popup("open");
    $.mobile.loading("hide");
  }

  if ($.mobile.activePage) {
    $.mobile.activePage.trigger('create');
  }
}

function callbackURLFound() {
  var errors = errorHandler.getErrors();
  var ul = $("<ul style='text-align:left;'></ul>");
  $('#popupErrorsContent').append(ul);
  for (var i = 0; i < errors.length; ++i) {
    ul.append($('<li>' + errors[i] + '</li>'));
  }
  $("#popupErrors").popup("open");
}

function addPagesToPageManager(_pageManager, _pages) {
  for (var i = 0; i < _pages.length; ++i) {
    if (Array.isArray(_pages[i])) {
      if (_pages[i][0] === "random") {
        _pages[i].shift();
        shuffle(_pages[i]);
      }
      addPagesToPageManager(_pageManager, _pages[i]);
    } else {
      var pageConfig = _pages[i];
      if (pageConfig.type == "generic") {
        _pageManager.addPage(new GenericPage(_pageManager, pageConfig));
      } else if (pageConfig.type == "video") {
        var videoPage = new VideoPage(_pageManager, pageTemplateRenderer, session, config, pageConfig, errorHandler, config.language);
        _pageManager.addPage(videoPage);
      } else if (pageConfig.type == "finish") {
        var finishPage = new FinishPage(_pageManager, session, dataSender, pageConfig, config.language);
        _pageManager.addPage(finishPage);
      } else {

        errorHandler.sendError("Type not specified.");

      }
    }
  }
}

for (var i = 0; i < $("body").children().length; i++) {
  if ($("body").children().eq(i).attr('id') != "popupErrors" && $("body").children().eq(i).attr('id') != "popupDialog") {
    $("body").children().eq(i).addClass('ui-disabled');
  }
}




function startup(config) {


  if (config == null) {
    errorHandler.sendError("URL couldn't be found!");
    callbackURLFound();
  }

  if ($(window).width() < 1100) {
    errorHandler.sendError("Please use a computer for this experiment.");
  }

  if (navigator.appName == 'Microsoft Internet Explorer') {
    errorHandler.sendError("Please do not use internet explorer for this experiment.");
  }

  $.mobile.page.prototype.options.theme = 'a';
  var interval = setInterval(function () {
    $.mobile.loading("show", {
      text: "Loading...",
      textVisible: true,
      theme: "a",
      html: ""
    });
    clearInterval(interval);
  }, 1);


  if (pageManager !== null) { // clear everything for new experiment
    pageTemplateRenderer.clear();
    $("#page_content").empty();
    $('#header').empty();
  }

  localizer = new Localizer();
  localizer.initializeNLSFragments(nls);

  pageManager = null;
  dataSender = null;
  session = null;
  pageTemplateRenderer = null;
  interval2 = null;

  document.title = config.testname;
  $('#header').append(document.createTextNode(config.testname));

  pageManager = new PageManager("pageManager", "page_content", localizer);

  dataSender = new DataSender(config);

  session = new Session();
  session.testId = config.testId;
  session.userId = config.userId;
  session.config = configFile;
  session.navigator = navigator.userAgent.replaceAll(";", " -")

  if (config.language == undefined) {
    config.language = 'en';
  }
  pageTemplateRenderer = new PageTemplateRenderer(pageManager, config.showButtonPreviousPage, config.language);
  pageManager.addCallbackPageEventChanged(pageTemplateRenderer.refresh.bind(pageTemplateRenderer));

  addPagesToPageManager(pageManager, config.pages);

  setTimeout(function () {
    callbackFilesLoaded()
  }, 10);
}

// start code (loads config) 

var config = null;
// var configArg = getParameterByName("config");
var configFile = '';

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
var userId = getParameterByName("PROLIFIC_PID");
var testId = window.location.pathname.split("/").pop();


configFile = '/configs/' + testId + "/" + userId


// global variables
var errorHandler = new ErrorHandler();
var localizer = null;
var pageManager = null;
var dataSender = null;
var session = null;
var pageTemplateRenderer = null;
var interval2 = null;

$.getJSON(configFile, function (result) {
  config = result;
  startup(result);
});
