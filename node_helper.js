const mqttHelper = require("./mqtt_helper");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  servers: [],
  logging: false,
  log: function (...args) {
    if (this.logging) {
      console.log(args);
    }
  },

  start: function () {
    console.log(this.name + ": Starting node helper");
    this.loaded = false;
  },

  startTimeout: null,

  socketNotificationReceived: function (notification, payload) {
    const messageCallback = (key, topic, value) => {
      this.log(
        `Received message from ${key}: topic: ${topic}, message: ${value}`
      );
      this.sendSocketNotification("MQTT_PAYLOAD", {
        serverKey: key,
        topic: topic,
        value: value,
        time: Date.now()
      });
    };

    if (notification === "MQTT_CONFIG") {
      this.servers = mqttHelper.addServers(this.servers, payload.mqttServers);
      this.logging = payload.logging;

      // Start clients
      // Allow 2 seconds for multiple instances to configure servers
      clearTimeout(this.startTimeout);
      this.startTimeout = setTimeout(() => {
        mqttHelper.startClients(this.servers, messageCallback, this.name);
      }, 2000);

      this.loaded = true;
    }
  }
});
