Module.register("MMM-MQTT-Publisher", {
    // Default module config
    defaults: {
        mqttServers: []
    },

    makeServerKey: function (server) {
        return '' + server.address + ':' + (server.port | '1883' + server.user);
    },

    start: function () {
        console.log(this.name + ' started.');
        this.publications = {};

        console.log(this.name + ': Setting up connection to ' + this.config.mqttServers.length + ' servers');

        for (i = 0; i < this.config.mqttServers.length; i++) {
            var s = this.config.mqttServers[i];
            console.log(this.name + ': Adding config for ' + s.address + ' port ' + s.port + ' user ' + s.user);
            // setup publications for each server
            if (s.publications) {
                s.publications.forEach(publication => {
                        if (!this.publications[publication.notification]) {
                            this.publications[publication.notification] = [];
                        }
                        this.publications[publication.notification].push({
                            topic: publication.topic
                        });
                    }
                )
            }
        }

        this.openMqttConnection();
        var self = this;
        setInterval(function () {
            self.updateDom(100);
        }, 5000);
    },

    openMqttConnection: function () {
        this.sendSocketNotification('MQTT_CONFIG', this.config);
    },

    notificationReceived: function (notification, payload, sender) {
        if (this.publications[notification]) {
            this.sendSocketNotification("MQTT_PUBLISH", {
                notification: notification,
                payload
            });
        }
    },

    isValueTooOld: function (maxAgeSeconds, updatedTime) {
        return (maxAgeSeconds && ((updatedTime + maxAgeSeconds * 1000) < Date.now()));
    },

    getDom: function () {
        self = this;
        var wrapper = document.createElement("table");
        wrapper.className = "small";
        var first = true;

        if (self.publications.length === 0) {
            wrapper.innerHTML = (self.loaded) ? self.translate("EMPTY") : self.translate("LOADING");
            wrapper.className = "small dimmed";
            console.log(self.name + ': No values');
            return wrapper;
        }

        // self.publications.forEach(function (sub) {
        //     var subWrapper = document.createElement("tr");
        //
        //     // Label
        //     var labelWrapper = document.createElement("td");
        //     labelWrapper.innerHTML = sub.topic;
        //     labelWrapper.className = "align-left";
        //     subWrapper.appendChild(labelWrapper);
        //
        //     // Value
        //     tooOld = self.isValueTooOld(sub.maxAgeSeconds, sub.time);
        //     var valueWrapper = document.createElement("td");
        //     valueWrapper.innerHTML = sub.notification;
        //     valueWrapper.className = "align-right medium " + (tooOld ? "dimmed" : "bright");
        //     subWrapper.appendChild(valueWrapper);
        //
        //     Suffix
        //     var suffixWrapper = document.createElement("td");
        //     suffixWrapper.innerHTML = sub.suffix;
        //     suffixWrapper.className = "align-left";
        //     subWrapper.appendChild(suffixWrapper);
        //
        //     wrapper.appendChild(subWrapper);
        // });

        return wrapper;
    }
});