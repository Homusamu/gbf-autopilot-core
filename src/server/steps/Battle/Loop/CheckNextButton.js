import Step from "../../Step";
import { enemyAlive } from "~/helpers/StateHelper";

exports = module.exports = (require, run, process) => (next, stop) => {
  const Wait = require("steps/Wait");
  const Check = require("steps/Check");
  const Location = require("steps/Location");
  const State = require("steps/Battle/State");
  const ClickNextButton = require("steps/Battle/Loop/ClickNextButton");
  const CheckNextLocation = require("steps/Battle/Loop/CheckNextLocation");

  const nextLoopSelector = [
    ".btn-attack-start.display-on",
    ".btn-result",
    ".cnt-result"
  ].join(",");

  const waitForLocationOrNextButton = () =>
    new Promise((resolve, reject) => {
      // We have 2 checkers running in parallel: location and DOM.
      // If the location checker gets triggered first,
      // tells the DOM checker to ignore any resolved promise.
      var waiting = true;
      process([
        Location.Wait(),
        CheckNextLocation(),
        async (_, inBattle) => {
          waiting = false;
          if (!inBattle) return { inBattle };
          await run(Wait(nextLoopSelector));
          try {
            await run(Check(".btn-result"));
            return { inBattle, hasNextButton: true };
          } catch (e) {
            return { inBattle, hasNextButton: false };
          }
        }
      ]).then(resolve, reject);

      run(Wait(".btn-result")).then(() => {
        if (!waiting) return;
        resolve({ inBattle: true, hasNextButton: true });
      });
    });

  return Step(function checkNextButton() {
    return run(State())
      .then(state => {
        // check if there's still enemy left
        // if true, check for the next button
        // else, wait for the next button to appear (expected usual behavior)
        // EDIT: in cases of refreshes, it may instead redirect to the next battle or result page
        if (enemyAlive(state)) {
          return run(Wait(nextLoopSelector))
            .then(() => {
              return run(Check(".btn-result"));
            })
            .then(
              () => ({
                hasNextButton: true,
                inBattle: true
              }),
              () => ({
                hasNextButton: false,
                inBattle: true
              })
            );
        } else {
          return waitForLocationOrNextButton();
        }
      })
      .then(condition => {
        if (condition.inBattle) {
          return condition.hasNextButton
            ? run(ClickNextButton()).then(stop)
            : next();
        } else {
          return stop(false);
        }
      });
  });
};

exports["@require"] = ["require", "run", "process", "logger"];
