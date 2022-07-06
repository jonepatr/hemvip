/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

Portions Copyright (C) Patrik Jonell and contributors 2021.

This file was edited 2021-09-02 by Patrik Jonell. All rights reserved.
These contributions are licensed under the MIT license. See LICENSE.txt for details.

**************************************************************************/

function PageManager (_variableName, _htmlParenElementId, _localizer) {
    this.pages = [];
    this.pagesIndex = -1;
    this.failedAttnChecks = 0;
    this.falseReports = 0;
    this.maxAllowedFailedAttnChecks = 1;
    this.maxAllowedFalseReports = 3;
    this.parentElementId = _htmlParenElementId;
    this.varName = _variableName;
    this.callbacksPageEventChanged = [];
    this.localizer = _localizer;
}

PageManager.prototype.addCallbackPageEventChanged = function (_callback) {
    this.callbacksPageEventChanged[this.callbacksPageEventChanged.length] = _callback;
};

PageManager.prototype.addPage = function (_page) {
    this.pages[this.pages.length] = _page;
};

PageManager.prototype.getNextPage = function () {
  return this.pages[this.pagesIndex+1];
};

PageManager.prototype.getPageIndex = function () {
  return this.pagesIndex;
};

PageManager.prototype.getNumPages = function () {
  return this.pages.length;
};

PageManager.prototype.getPage = function (_index) {
  return this.pages[_index];
};

PageManager.prototype.getCurrentPage = function () {
  return this.pages[this.pagesIndex];
};

PageManager.prototype.shouldTerminateStudy = function() {
  var shouldTerminate = false;
  shouldTerminate = shouldTerminate || this.failedAttnChecks > this.maxAllowedFailedAttnChecks;
  shouldTerminate = shouldTerminate || this.falseReports > this.maxAllowedFalseReports;
  return shouldTerminate;
}

PageManager.prototype.tryTerminateStudy = function(remoteFailService, userId, testId, session) {
  var global = this;
  var promise = new Promise(function(resolve, reject) {
    if (global.shouldTerminateStudy()) {
      errorHandler.sendError("Failed!!");
      $.ajax({
        type: "POST",
        url: remoteFailService,
        data: { user_id: userId, test_id: testId, sessionJSON: JSON.stringify(session)},
        success: function (data) {
          if(data === true) {
            errorHandler.sendError("Failed!!");
            location.href = "/failed_task";
            reject();
          }
        }
      });
    }
    resolve();
  });
  return promise;
}

PageManager.prototype.reportBroken = function () {
  var currPage = pageManager.getCurrentPage();
  if (currPage instanceof VideoPC) {
    for (var i = 0; i < currPage.ratings.length; ++i) {
      currPage.ratings[i].value = 99; // Careful when changing this, the value is referenced in VideoPC.js -> postCheck() !!!
    }
  }
  this.nextPage();
}

PageManager.prototype.nextPage = function () {
  ++this.pagesIndex;

  if (this.pagesIndex <= this.pages.length) {
      var postCheck = function() {return Promise.resolve()};

      if (this.pages[this.pagesIndex - 1] !== undefined && this.pages[this.pagesIndex - 1].postCheck !== undefined) {
        postCheck = this.pages[this.pagesIndex - 1].postCheck.bind(this.pages[this.pagesIndex - 1]);
      }

      postCheck().then(function() {

      
      if (this.pages[this.pagesIndex - 1] !== undefined && this.pages[this.pagesIndex - 1].save !== undefined) {
        this.pages[this.pagesIndex - 1].save();
      }

      if (this.pagesIndex >= (this.pages.length - 1) && pageManager.getCurrentPage() instanceof FinishPage) { // last page will be rendered
        for (var i = 0; i < this.pages.length; ++i) {
            if (this.pages[i].store !== undefined) {
                this.pages[i].store();
            }
        }
      }

      var id = this.parentElementId;
      $("#"+id).empty();
      this.pages[this.pagesIndex].render($("#"+id));
      this.pageEventChanged();
      if (this.getCurrentPage().load !== undefined) {
        $("#"+id).append($("<script> " + this.getPageVariableName(this.getCurrentPage()) + ".load();</script>"));
      }
      window.scrollTo(0, 0);
    }.bind(this)).catch(function() {
      --this.pagesIndex;
    }.bind(this))
  } else {
    --this.pagesIndex;
  }
};

PageManager.prototype.previousPage = function () {
    --this.pagesIndex;
    if (this.pagesIndex <= this.pages.length) {
      if (this.pages[this.pagesIndex + 1] !== null && this.pages[this.pagesIndex + 1].save !== null) {
        this.pages[this.pagesIndex + 1].save();
      }
      var id = this.parentElementId;
      $("#"+id).empty();
      this.pages[this.pagesIndex].render($("#"+id));
      this.pageEventChanged();
      if (this.getCurrentPage().load !== undefined) {
        $("#"+id).append($("<script> " + this.getPageVariableName(this.getCurrentPage()) + ".load();</script>"));
      }
      window.scrollTo(0, 0);
    } else {
      ++this.pagesIndex;
    }
};

PageManager.prototype.start = function () {
    for (var i = 0; i < this.pages.length; ++i) {
        if (this.pages[i].init !== undefined) {
            this.pages[i].init();
        }
    }
    this.nextPage();
};

PageManager.prototype.restart = function () {
    this.pagesIndex = -1;
    this.start();
};

PageManager.prototype.getPageVariableName = function (_page) {
    for (var i = 0; i < this.pages.length; ++i) {
        if (this.pages[i] == _page) {
            return this.varName + ".pages[" + i +"]";
        }
    }
    return false;
};

PageManager.prototype.getPageManagerVariableName = function () {
    return this.varName;
};

PageManager.prototype.pageEventChanged = function () {
    for (var i = 0; i < this.callbacksPageEventChanged.length; ++i) {
      this.callbacksPageEventChanged[i]();
    }
};

PageManager.prototype.getLocalizer = function () {
  return this.localizer;
};


