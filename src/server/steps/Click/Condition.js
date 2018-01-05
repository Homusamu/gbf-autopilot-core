import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import Step from "../Step";

exports = module.exports = (logger, config, require) => (selector, condition, delay) => {
  if (!isFunction(condition) && !isString(condition)) {
    throw new Error("Condition parameter must be either a function or string!");
  }
  delay = delay || config.reclickDelay;
  const Check = require("steps/Check");
  const Click = require("steps/Click");
  const Timeout = require("steps/Timeout");

  if (isString(condition)) {
    var inversed = false;
    if (condition.startsWith("!")) {
      inversed = true;
      condition = condition.substring(1);
    }

    // clicks as long as the element exists
    // if inversed, clicks until the expected element exists
    const selectorCondition = condition;
    condition = () => new Promise((resolve, reject) => {
      Check(selectorCondition).then(
        !inversed ? reject : resolve,
        !inversed ? resolve : reject
      );
    });
  }

  const doClick = (done, fail) => {
    return process([
      Click(selector),
      Timeout(delay),
    ]).then(() => startClick(done, fail), fail);
  };

  const startClick = (done, fail) => {
    const result = condition();
    if (result instanceof Promise) {
      return result.then(done, () => doClick(done, fail));
    } else {
      return result ? done() : doClick(done, fail);
    }
  };

  return Step("Click", function Condition(_, $, done, fail) {
    logger.debug("Clicking with condition:", selector);
    return startClick(done, fail);
  });
};

exports["@require"] = ["logger", "config", "require"];
