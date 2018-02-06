var mqtt = require('mqtt');

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	start: function() {
		console.log('Starting node helper for: ' + this.name);
        this.loaded = false;
    },

	socketNotificationReceived: function(notification, payload) {
        var self = this;

		if (notification === 'MQTT_CONFIG') {
            self.config = payload;
            self.value = 'connecting';
            self.loaded = true;
            console.log(this.name + ': Connection started');

            // Subscribe here
            console.log(self.name + ': Connecting to ' + this.config.mqttServer);
            self.options = {
                username: self.config.mqttUser,
                password: self.config.mqttPassword
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
                console.log(self.name + ': Subscribing to ' + self.config.topic);
                self.client.subscribe(self.config.topic);
            });
              
            self.client.on('message', function (topic, payload) {
                //console.log(self.name + ' received message: ' + payload.toString());
                var value = payload.toString();
                if(isNaN(self.config.decimals) == false) {
                    if (isNaN(value) == false){
                        value = Number(value).toFixed(self.config.decimals);
                    }
                }
                self.value = value;
                self.broadcastMessage();
                //client.end()
            });
		}
	},


	broadcastMessage: function() {
		this.sendSocketNotification('MQTT_PAYLOAD', this.value);
	}


        
});