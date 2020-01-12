Module.register("MMM-MQTT", {
  log: function(...args) {
    if (this.config.logging) {
      console.log(args);
    }
  },

  getScripts: function() {
    return [
      this.file("node_modules/jsonpointer/jsonpointer.js"),
      "topics_match.js"
    ];
  },

  // Default module config
  defaults: {
    mqttServers: [],
    logging: false,
    useWildcards: false
  },

  makeServerKey: function(server) {
    return "" + server.address + ":" + (server.port | ("1883" + server.user));
  },

  start: function() {
    console.log(this.name + " started.");
    this.subscriptions = [];

    console.log(
      this.name +
        ": Setting up connection to " +
        this.config.mqttServers.length +
        " servers"
    );

    for (i = 0; i < this.config.mqttServers.length; i++) {
      var s = this.config.mqttServers[i];
      var serverKey = this.makeServerKey(s);
      console.log(
        this.name +
          ": Adding config for " +
          s.address +
          " port " +
          s.port +
          " user " +
          s.user
      );
      for (j = 0; j < s.subscriptions.length; j++) {
        var sub = s.subscriptions[j];
        this.subscriptions.push({
          serverKey: serverKey,
          label: sub.label,
          topic: sub.topic,
          decimals: sub.decimals,
          jsonpointer: sub.jsonpointer,
          suffix: typeof sub.suffix == "undefined" ? "" : sub.suffix,
          value: "",
          time: Date.now(),
          maxAgeSeconds: sub.maxAgeSeconds,
          sortOrder: sub.sortOrder || i * 100 + j
        });
      }
    }

    this.openMqttConnection();
    var self = this;
    setInterval(function() {
      self.updateDom(100);
    }, 5000);
  },

  openMqttConnection: function() {
    this.sendSocketNotification("MQTT_CONFIG", this.config);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "MQTT_PAYLOAD") {
      if (payload != null) {
        for (i = 0; i < this.subscriptions.length; i++) {
          sub = this.subscriptions[i];
          if (
            sub.serverKey == payload.serverKey && this.config.useWildcards
              ? topicsMatch(sub.topic, payload.topic)
              : sub.topic == payload.topic
          ) {
            var value = payload.value;
            // Extract value if JSON Pointer is configured
            if (sub.jsonpointer) {
              value = get(JSON.parse(value), sub.jsonpointer);
            }
            // Round if decimals is configured
            if (isNaN(sub.decimals) == false) {
              if (isNaN(value) == false) {
                value = Number(value).toFixed(sub.decimals);
              }
            }
            sub.value = value;
            sub.time = payload.time;
          }
        }
        this.updateDom();
      } else {
        console.log(this.name + ": MQTT_PAYLOAD - No payload");
      }
    }
  },

  getStyles: function() {
    return ["MQTT.css"];
  },

  isValueTooOld: function(maxAgeSeconds, updatedTime) {
    // console.log(this.name + ': maxAgeSeconds = ', maxAgeSeconds);
    // console.log(this.name + ': updatedTime = ', updatedTime);
    // console.log(this.name + ': Date.now() = ', Date.now());
    if (maxAgeSeconds) {
      if (updatedTime + maxAgeSeconds * 1000 < Date.now()) {
        return true;
      }
    }
    return false;
  },

  getDom: function() {
    self = this;
    var wrapper = document.createElement("table");
    wrapper.className = "small";
    var first = true;

    if (self.subscriptions.length === 0) {
      wrapper.innerHTML = self.loaded
        ? self.translate("EMPTY")
        : self.translate("LOADING");
      wrapper.className = "small dimmed";
      console.log(self.name + ": No values");
      return wrapper;
    }

    self.subscriptions
      .sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      })
      .forEach(function(sub) {
        var subWrapper = document.createElement("tr");

        // Label
        var labelWrapper = document.createElement("td");
        labelWrapper.innerHTML = sub.label;
        labelWrapper.className = "align-left mqtt-label";
        subWrapper.appendChild(labelWrapper);

        // Value
        tooOld = self.isValueTooOld(sub.maxAgeSeconds, sub.time);
        var valueWrapper = document.createElement("td");
        valueWrapper.innerHTML = sub.value;
        valueWrapper.className =
          "align-right medium mqtt-value " + (tooOld ? "dimmed" : "bright");
        subWrapper.appendChild(valueWrapper);

        // Suffix
        var suffixWrapper = document.createElement("td");
        suffixWrapper.innerHTML = sub.suffix;
        suffixWrapper.className = "align-left mqtt-suffix";
        subWrapper.appendChild(suffixWrapper);

        wrapper.appendChild(subWrapper);
      });

    return wrapper;
  }
});
