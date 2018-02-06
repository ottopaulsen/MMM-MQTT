var mqtt = require('mqtt');
var NodeHelper = require("node_helper");

var topics = [];

module.exports = NodeHelper.create({

	start: function() {
		console.log('Starting node helper for: ' + this.name);
        this.loaded = false;
    },

	socketNotificationReceived: function(notification, payload) {
        var self = this;

		if (notification === 'MQTT_CONFIG') {
            self.config = payload;

            // Read topics to subscribe
            for(i = 0; i < self.config.subscriptions.length; i++){
                topics[i] = self.config.subscriptions[i].topic;
            }

            self.loaded = true;

            console.log(self.name + ': Connecting to ' + this.config.mqttServer);
            self.options = {
                username: self.config.mqttUser,
                password: self.config.mqttPassword,
            };

            self.client = mqtt.connect('mqtt://' + self.config.mqttServer, self.options);

            self.client.on('error', function (err) {
                console.log(self.name + ': Error: ' + err);
            });

            self.client.on('reconnect', function (err) {
                self.value = 'reconnecting';
            });

            self.client.on('connect', function (connack) {
                console.log(self.name + ' connected to ' + self.config.mqttServer);
                console.log(self.name + ': subscribing to ' + topics);
                self.client.subscribe(topics);
            });
              
            self.client.on('message', function (topic, payload) {
                // Find correct topic
                if(topics.includes(topic)){
                    var value = payload.toString();
                    self.sendSocketNotification('MQTT_PAYLOAD', {
                        topic: topic,
                        value: value
                    });
                }
            });
		}
	},        
});