"use strict";
exports.__esModule = true;
exports.Actions = exports.States = void 0;
var States;
(function (States) {
    States["LOBBY"] = "LOBBY";
    States["QUESTION_COUNTDOWN"] = "QUESTION_COUNTDOWN";
    States["QUESTION_OPEN"] = "QUESTION_OPEN";
    States["QUESTION_CLOSE"] = "QUESTION_CLOSE";
    States["ANSWER_SHOW"] = "ANSWER_SHOW";
    States["FINAL_RESULTS"] = "FINAL_RESULTS";
    States["END"] = "END";
})(States = exports.States || (exports.States = {}));
var Actions;
(function (Actions) {
    Actions["NEXT_QUESTION"] = "NEXT_QUESTION";
    Actions["GO_TO_ANSWER"] = "GO_TO_ANSWER";
    Actions["GO_TO_FINAL_RESULTS"] = "GO_TO_FINAL_RESULTS";
    Actions["END"] = "END";
})(Actions = exports.Actions || (exports.Actions = {}));
