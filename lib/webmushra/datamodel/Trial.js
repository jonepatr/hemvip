/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

Portions Copyright (C) Patrik Jonell and contributors 2021.

This file was edited 2021-09-02 by Patrik Jonell. All rights reserved.
These contributions are licensed under the MIT license. See LICENSE.txt for details.

**************************************************************************/

/**
 * Respresents a trial.
 * @constructor
 * @property {String} id - Identifier of the trial.
 * @property {String} type - Type of the trial (e.g. video)
 * @property {Object[]} responses - Responses given by the participant. The class depends on the type.  
 */
function Trial() {
  this.id = "";
  this.type = null;
  this.responses = [];  
}
