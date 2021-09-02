/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

Portions Copyright (C) Patrik Jonell and contributors 2021.

This file was edited 2021-09-02 by Patrik Jonell. All rights reserved.
These contributions are licensed under the MIT license. See LICENSE.txt for details.

**************************************************************************/

function FinishPage(_pageManager, _session, _dataSender, _pageConfig, _language) {
  this.pageManager = _pageManager;
  this.session = _session;
  this.dataSender = _dataSender;
  this.pageConfig = _pageConfig;
  this.language = _language;
  this.sentDataToServer = false;
  this.likert = null;
  this.interval = null;

  this.errorDiv = $("<div style='color:red; font-weight:bold;'></div>");



  if (this.pageConfig.questionnaire === undefined) {
    this.pageConfig.questionnaire = new Array();
  }

}

FinishPage.prototype.getName = function () {
  return this.pageConfig.name;
};

FinishPage.prototype.storeParticipantData = function () {
  var i;
  for (i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];

    this.session.participant.name[this.session.participant.name.length] = element.name;
    if ($("#" + element.name).val()) {
      this.session.participant.response[this.session.participant.response.length] = $("#" + element.name).val();
    } else {
      this.session.participant.response[this.session.participant.response.length] = $("input[name='" + element.name + "__response']:checked").val();
    }
  }
};

FinishPage.prototype.sendResults = function () {
  var data = this.dataSender.send(this.session);
  if (data == false) {
    this.errorDiv.text("An error occured while sending your data to the server! Please contact the experimenter.");
  }
  clearInterval(this.interval);
  return data;
};

FinishPage.prototype.render = function (_parent) {
  _parent.append(this.pageConfig.content);

  var table = $("<table align='center'></table>");
  _parent.append(table);

  var i;
  for (i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    if (element.type === "text") {

      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input id='" + element.name + "' /></td></tr>"));
    } else if (element.type === "number") {

      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><input id='" + element.name + "' min='" + element.min + "' max='" + element.max + "' value='" + element.default + "' data-inline='true'/></td></tr>"));
    } else if (element.type === "likert") {

      this.likert = new LikertScale(element.response, element.name + "_");
      var td = $("<td></td>");
      table.append($("<tr></tr>").append(
        $("<td><strong>" + element.label + "</strong></td>"),
        td
      ));
      this.likert.render(td);
    } else if (element.type === "long_text") {

      table.append($("<tr><td id='labeltd' style=' padding-top:" + $('#feedback').css('margin-top') + "'><strong>" + element.label + "</strong></td><td><textarea name='" + element.name + "' id='" + element.name + "'></textarea></td></tr>"));
    }
    else if (element.type === "options") {
      var options = element.response.map(function (el, i) {
        var id_ = element.name + '_id_' + i
        return '<input type="radio" name="' + element.name + '__response" id="' + id_ + '" value="' + el.value + '"><label for="' + id_ + '">' + el.label + '</label>'
      }).join("");
      table.append($("<tr><td><strong>" + element.label + "</strong></td><td><fieldset data-role='controlgroup'>" + options + "</fieldset></td></tr>"));
    }

  }
  var button = $("<button id='send_results' data-role='button' data-inline='true' disabled='disabled'>" + this.pageManager.getLocalizer().getFragment(this.language, 'sendButton') + "</button>");
  var thSecondContent = $("<th colspan='2' align='center'> </th>");
  button.bind("click", (function (event, ui) {
    if (!this.sentDataToServer) {
      $(thSecondContent).append("Thank you. Redirecting to Prolific...");
      $("#popupDialog").popup("open");

      this.sentDataToServer = true;
      this.storeParticipantData();
      var code = this.sendResults();
      window.location.href = code;
    }
  }).bind(this));
  _parent.append(button);

  $("#popHeader").text(this.pageManager.getLocalizer().getFragment(this.language, 'attending'));

  var table = $("<table align='center'> </table>");
  var trHeader = document.createElement("tr");
  var trT;
  var trRatings;

  $(table).append(thSecondContent);
  $(table).append(trHeader);

  var thHeader;
  var thT;
  var tdRatingStimulus;
  var tdRatingScore;
  if (this.pageConfig.showResults) {
    th = $("<th colspan='3'> </th>");

    $(th).append($("<h3>" + this.pageManager.getLocalizer().getFragment(this.language, 'results') + "</h3>"));
    $(trHeader).append(th);

    var trials = this.session.trials;
    for (i = 0; i < trials.length; ++i) {
      var trial = trials[i];
      if (trial.type === "video") {
        trT = document.createElement("tr");
        thT = $("<th colspan='2'></th>");
        $(thT).append(trial.id + " (MUSHRA)");
        $(trT).append(thT);
        $(table).append(trT);

        var ratings = trial.responses;
        for (var j = 0; j < ratings.length; ++j) {
          trRatings = document.createElement("tr");
          tdRatingStimulus = document.createElement("td");
          tdRatingScore = document.createElement("td");

          tdRatingStimulus.width = "50%";
          tdRatingScore.width = "50%";

          var rating = ratings[j];

          $(tdRatingStimulus).append(rating.stimulus + ": ");
          $(tdRatingScore).append(rating.score);
          $(trRatings).append(tdRatingStimulus);
          $(trRatings).append(tdRatingScore);
          $(table).append(trRatings);

        }
        trEmpty = $("<tr height='8px'></tr>");
        $(table).append(trEmpty);
      }
    }
  }

  if (this.pageConfig.showErrors == true) {
    $("#popupResultsContent").append(this.errorDiv);
  }

  $("#popupResultsContent").append(table);

};

FinishPage.prototype.load = function () {
  $('#labeltd').css('padding-top', $("#feedback").css("margin-top"));
  if (this.pageConfig.questionnaire.length > 0) {
    this.interval = setInterval((function () {
      var counter = 0;
      var i;
      for (i = 0; i < this.pageConfig.questionnaire.length; ++i) {
        var element = this.pageConfig.questionnaire[i];
        if (element.type === "text") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "number") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "likert") {
          if (this.likert && $("input[name='" + element.name + "__response']:checked").val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "options") {
          if ($("input[name='" + element.name + "__response']:checked").val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "long_text") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        }
        // console.log(counter, this.pageConfig.questionnaire.length, element.type)
        if (counter == this.pageConfig.questionnaire.length) {
          $('#send_results').removeAttr('disabled');
        } else if (i + 1 == this.pageConfig.questionnaire.length && counter != this.pageConfig.questionnaire.length && $('#send_results').is(':enabled')) {
          $('#send_results').attr('disabled', true);
        }
      }
    }).
      bind(this), 50);
  } else {
    $('#send_results').removeAttr('disabled');
  }
};
