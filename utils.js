const makeServerKey = function (server) {
  return "" + server.address + ":" + (server.port ?? "1883") + server.user;
};

if (typeof window === "undefined" || navigator.userAgent.includes("jsdom")) {
  module.exports = { makeServerKey };
}
