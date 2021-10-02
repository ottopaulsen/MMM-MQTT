const { makeServerKey } = require("./utils");
const mqtt = require("mqtt");
const fs = require("fs");

const addServer = function (servers, server, name) {
  const serverKey = makeServerKey(server);
  const mqttServer = servers.find(
    (server) => server.serverKey === serverKey
  ) || {
    serverKey,
    address: server.address,
    port: server.port,
    options: {},
    topics: []
  };
  if (server.user) mqttServer.options.username = server.user;
  if (server.password) mqttServer.options.password = server.password;
  if (server.ca)
    try {
      mqttServer.options.ca = fs.readFileSync(server.ca);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(name + ": CA file not found!");
      } else if (err.code === "EACCES") {
        console.log(name + ": CA file permissions issue!");
      } else {
        console.log(name + ": Error accessing CA file: " + err);
      }
    }
  if (server.clientId) mqttServer.options.clientId = server.clientId;
  mqttServer.topics.push(
    ...server.subscriptions
      .map((sub) => sub.topic)
      .filter((topic) => !mqttServer.topics.includes(topic))
  );

  servers.push(mqttServer);
};

const addServers = function (servers, mqttServers, name) {
  mqttServers.forEach((server) => {
    addServer(servers, server, name);
  });

  return servers;
};

const startClient = function (server, messageCallback, name) {
  console.log(
    `${name}: Starting client for ${server.address}:${server.port} user ${server.options.username}`
  );

  var mqttServer =
    (server.address.match(/^mqtts?:\/\//) ? "" : "mqtt://") + server.address;
  if (server.port) {
    mqttServer = mqttServer + ":" + server.port;
  }
  console.log(name + ": Connecting to " + mqttServer);

  server.client = mqtt.connect(mqttServer, server.options);

  server.client.on("error", (err) => {
    console.log(name + " " + server.serverKey + ": Error: " + err);
  });

  server.client.on("reconnect", () => {
    server.value = "reconnecting"; // Hmmm...
    console.log(name + ": " + server.serverKey + " reconnecting");
  });

  server.client.on("connect", () => {
    console.log(name + " connected to " + mqttServer);
    console.log(name + ": subscribing to " + server.topics);
    server.client.subscribe(server.topics);
  });

  server.client.on("message", (topic, payload) => {
    messageCallback(server.serverKey, topic, payload.toString());
  });
};

const startClients = function (servers, messageCallback, name = "MMM-MQTT") {
  servers.forEach((server) => {
    startClient(server, messageCallback, name);
  });
};

module.exports = { addServers, startClients };
