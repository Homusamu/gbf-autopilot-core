const registerDebug = (server, hooks) => {
  hooks.forEach((hook) => {
    server.on("socket." + hook, ({data}) => {
      if (!server.config.Debug.DebugSocket) return;
      server.logger.debug(hook, data);
    });
  });
};

export default function socket() {
  registerDebug(this, ["broadcast", "actionSuccess", "actionFail", "sendAction"]);
}
