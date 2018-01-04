import Step from "../Step";

exports = module.exports = function(logger, worker) {
  return Step("Location", async function Reload() {
    logger.debug("Reloading page...");
    return await worker.sendAction("location.reload");
  });
};

exports["@require"] = ["logger", "worker"];
