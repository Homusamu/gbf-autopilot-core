import Step from "./Step";

exports = module.exports = function(server, worker, options) {
  return Step(function Viramate() {
    server.logger.debug("Viramate:", options);
    return worker.sendAction("viramate", options);
  });
};

exports["@require"] = ["server", "worker"];
