const mqttHelper = require("./mqtt_helper");
const NodeHelper = require("node_helper");
const { exec } = require("child_process");

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

  savedValues: new Map(),

  socketNotificationReceived: function (notification, payload) {
    const messageCallback = (serverKey, topic, value) => {
      this.log(
        `Received message from ${serverKey}: topic: ${topic}, message: ${value}`
      );
      const time = Date.now()
      this.savedValues.set(serverKey + '-' + topic, {serverKey, topic, value, time})
      const payload = JSON.stringify(Object.fromEntries(this.savedValues))
      this.sendSocketNotification("MQTT_PAYLOAD", payload);
    };

    if (notification === "MQTT_CONFIG") {
      this.servers = mqttHelper.addServers(
        this.servers,
        payload.mqttServers,
        this.name
      );
      this.logging = payload.logging;

      // Start clients
      // Allow 2 seconds for multiple instances to configure servers
      clearTimeout(this.startTimeout);
      this.startTimeout = setTimeout(() => {
        mqttHelper.startClients(this.servers, messageCallback, this.name);

        // Send existing values so new clients are updated
        const payload = JSON.stringify(Object.fromEntries(this.savedValues))
        this.sendSocketNotification("MQTT_PAYLOAD", payload);  
      }, 2000);

      this.loaded = true;
    }

    if (notification === "MQTT_PLAY_SOUND") {
      this.playSound(payload);
    }
  },

  playSound: function (payload) {
    // The browser handles sound on the desktop. Electron on the Raspberry Pi
    // blocks HTML5 autoplay, so play the file with a shell command there.
    if (process.platform !== "linux") {
      return;
    }
    const command = `${payload.command} ${this.path}/${payload.soundFile}`;
    this.log(this.name + ": Playing sound: " + command);
    exec(command, (error) => {
      if (error) {
        console.error(this.name + ": Error playing sound: " + error.message);
      }
    });
  }
});
