Module.register("MMM-MQTT", {
  log: function (...args) {
    if (this.config.logging) {
      args.forEach((arg) => Log.info(arg));
    }
  },

  getScripts: function () {
    return [
      this.file("./jsonpointer.js"),
      this.file("./topics_match.js"),
      this.file("./utils.js")
    ];
  },

  // Default module config
  defaults: {
    mqttServers: [],
    logging: false,
    useWildcards: false,
    bigMode: false
  },

  start: function () {
    Log.info(this.name + " started.");
    this.subscriptions = this.makeSubscriptions(this.config.mqttServers);

    this.openMqttConnection();
    setInterval(() => {
      this.updateDom(100);
    }, 5000);
  },

  makeSubscriptions: function (mqttServers) {
    this.log(
      `${this.name}: Setting up connection to ${mqttServers.length} servers`
    );
    return mqttServers.flatMap((server) => {
      this.log(
        `${this.name}: Adding config for ${server.address} port ${server.port} user ${server.user}`
      );
      return server.subscriptions.map((subscr) => {
        return this.makeSubscription(makeServerKey(server), subscr);
      });
    });
  },

  makeSubscription: function (key, sub) {
    return {
      serverKey: key,
      label: sub.label,
      topic: sub.topic,
      decimals: sub.decimals,
      decimalSignInMessage: sub.decimalSignInMessage,
      jsonpointer: sub.jsonpointer,
      suffix: typeof sub.suffix == "undefined" ? "" : sub.suffix,
      value: "",
      time: Date.now(),
      maxAgeSeconds: sub.maxAgeSeconds,
      sortOrder: sub.sortOrder || 10, // TODO: Fix sort order i * 100 + j
      colors: sub.colors,
      conversions: sub.conversions,
      multiply: sub.multiply,
      divide: sub.divide,
      broadcast: sub.broadcast,
      hidden: sub.hidden
    };
  },

  openMqttConnection: function () {
    this.sendSocketNotification("MQTT_CONFIG", this.config);
  },

  setSubscriptionValue: function (subscriptions, payload, useWildcards) {
    const savedValues = new Map(Object.entries(JSON.parse(payload)))
    for (let i = 0; i < subscriptions.length; i++) {
      sub = subscriptions[i];
      const savedValue = savedValues.get(sub.serverKey + "-" + sub.topic)
      if (savedValue &&
        (sub.serverKey == savedValue.serverKey && useWildcards
          ? topicsMatch(sub.topic, savedValue.topic)
          : sub.topic == savedValue.topic)
      ) {
        var value = savedValue.value;

        if (sub.broadcast) {
          this.sendNotification("MQTT_MESSAGE_RECEIVED", savedValue);
        }

        // Extract value if JSON Pointer is configured
        if (sub.jsonpointer) {
          value = get(JSON.parse(value), sub.jsonpointer);
        }

        // Convert decimal point
        if (sub.decimalSignInMessage) {
          value = value.replace(sub.decimalSignInMessage, ".");
        }

        // Multiply or divide
        value = this.multiply(sub, value);

        // Round if decimals is configured
        if (isNaN(sub.decimals) == false) {
          if (isNaN(value) == false) {
            value = Number(value).toFixed(sub.decimals);
          }
        }
        sub.value = value;
        sub.time = savedValue.time;
      }
    }
    return subscriptions;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MQTT_PAYLOAD") {
      if (payload != null) {
        this.log("Received message: ", payload);
        this.setSubscriptionValue(
          this.subscriptions,
          payload,
          this.config.useWildcards
        );
        this.updateDom();
      } else {
        Log.info(this.name + ": MQTT_PAYLOAD - No payload");
      }
    }
  },

  getStyles: function () {
    return ["MQTT.css"];
  },

  isValueTooOld: function (maxAgeSeconds, updatedTime) {
    return maxAgeSeconds
      ? updatedTime + maxAgeSeconds * 1000 < Date.now()
      : false;
  },

  getColors: function (sub) {
    if (!sub.colors || sub.colors.length == 0) {
      return {};
    }

    let colors;
    for (i = 0; i < sub.colors.length; i++) {
      colors = sub.colors[i];
      if (sub.value < sub.colors[i].upTo) {
        break;
      }
    }

    return colors;
  },

  multiply: function (sub, value) {
    if (!sub.multiply && !sub.divide) {
      return value;
    }
    if (!value) {
      return value;
    }
    if (isNaN(value)) {
      return value;
    }
    let res = (+value * (sub.multiply || 1)) / (sub.divide || 1);
    return isNaN(res) ? value : "" + res;
  },

  convertValue: function (sub) {
    if (!sub.conversions || sub.conversions.length == 0) {
      return sub.value;
    }
    for (i = 0; i < sub.conversions.length; i++) {
      if (("" + sub.value).trim() == ("" + sub.conversions[i].from).trim()) {
        return sub.conversions[i].to;
      }
    }
    return sub.value;
  },

  getDom: function () {
    if (this.config.bigMode) {
      return this.getWrapperBigMode(
        document,
        this.subscriptions,
        this.loaded,
        this.translate,
        this.name,
        this.getColors,
        this.isValueTooOld,
        this.convertValue
      );
    } else {
      return this.getWrapperListMode(
        document,
        this.subscriptions,
        this.loaded,
        this.translate,
        this.name,
        this.getColors,
        this.isValueTooOld,
        this.convertValue
      );
    }
  },

  getWrapperListMode(
    doc,
    subscriptions,
    loaded,
    translate,
    name,
    getColors,
    isValueTooOld,
    convertValue,
  ) {
    const wrapper = document.createElement("table");
    wrapper.className = "small";

    if (subscriptions.length === 0) {
      wrapper.innerHTML = loaded ? translate("EMPTY") : translate("LOADING");
      wrapper.className = "small dimmed";
      this.log(name + ": No values");
      return wrapper;
    }


    subscriptions
      .filter((s) => !s.hidden)
      .sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      })
      .forEach(function (sub) {

        var subWrapper = doc.createElement("tr");
        let colors = getColors(sub);

        // Label
        var labelWrapper = doc.createElement("td");
        labelWrapper.innerHTML = sub.label;
        labelWrapper.className = "align-left mqtt-label";
        labelWrapper.style.color = colors.label;
        subWrapper.appendChild(labelWrapper);

        // Value
        tooOld = isValueTooOld(sub.maxAgeSeconds, sub.time);
        var valueWrapper = doc.createElement("td");
        var setValueinnerHTML = convertValue(sub);
        valueWrapper.innerHTML = setValueinnerHTML;
        valueWrapper.className =
          "align-right medium mqtt-value " + (tooOld ? "dimmed" : "bright");
        valueWrapper.style.color = tooOld
          ? valueWrapper.style.color
          : colors.value;
        subWrapper.appendChild(valueWrapper);

        // Suffix
        var suffixWrapper = doc.createElement("td");
        suffixWrapper.innerHTML = sub.suffix;
        suffixWrapper.className = "align-left mqtt-suffix";
        subWrapper.appendChild(suffixWrapper);
        subWrapper.style.color = colors.suffix;
        if (setValueinnerHTML !== "#DISABLED#") wrapper.appendChild(subWrapper);
      });
    return wrapper;
  },

  getWrapperBigMode(
    doc,
    subscriptions,
    loaded,
    translate,
    name,
    getColors,
    isValueTooOld,
    convertValue,
  ) {
    const wrapper = document.createElement("div");
    wrapper.className = "small";

    if (subscriptions.length === 0) {
      wrapper.innerHTML = loaded ? translate("EMPTY") : translate("LOADING");
      wrapper.className = "small dimmed";
      this.log(name + ": No values");
      return wrapper;
    }


    subscriptions
      .filter((s) => !s.hidden)
      .sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      })
      .forEach(function (sub) {

        var subWrapper = doc.createElement("div");
        subWrapper.className = "mqtt-big";
        let colors = getColors(sub);

        // Label
        var labelWrapper = doc.createElement("div");
        labelWrapper.innerHTML = sub.label;
        labelWrapper.className = "align-center mqtt-big-label";
        labelWrapper.setAttribute("align", "left")
        labelWrapper.style.color = colors.label;
        subWrapper.appendChild(labelWrapper);

        // Value row
        var valueRowWrapper = doc.createElement("div");
        valueRowWrapper.className = "mqtt-big-value-row";
        valueRowWrapper.setAttribute("align", "center")
        subWrapper.appendChild(valueRowWrapper);

        // Value
        tooOld = isValueTooOld(sub.maxAgeSeconds, sub.time);
        var valueWrapper = doc.createElement("span");
        var setValueinnerHTML = convertValue(sub);
        valueWrapper.innerHTML = setValueinnerHTML;
        valueWrapper.className =
          "large mqtt-big-value " + (tooOld ? "dimmed" : "bright");
        valueWrapper.style.color = tooOld
          ? valueWrapper.style.color
          : colors.value;
          valueRowWrapper.appendChild(valueWrapper);

        // Suffix
        var suffixWrapper = doc.createElement("span");
        suffixWrapper.innerHTML = sub.suffix;
        suffixWrapper.className = " medium mqtt-big-suffix";
        valueRowWrapper.appendChild(suffixWrapper);
        subWrapper.style.color = colors.suffix;
        if (setValueinnerHTML !== "#DISABLED#") wrapper.appendChild(subWrapper);

      });
    return wrapper;
  }
});
