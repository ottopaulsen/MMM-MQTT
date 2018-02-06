
Module.register("MMM-MQTT",{
    // Default module config
    defaults: {
        topic: 'smoky/1/inside/smoke',
        mqttUser: 'user',
        mqttPassword: 'password',
        mqttServer: 'localhost',
        decimals: '0'
    },

	start: function() {
        console.log(this.name + ' started.');
		this.openMqttConnection();
        var self = this;
        self.value = 'waiting...';
        setInterval(function() {
            self.updateDom(1000);
        }, 10000);
	},

	openMqttConnection: function() { 
		this.sendSocketNotification('MQTT_CONFIG', this.config);
	},

	socketNotificationReceived: function(notification, payload) {
		if(notification === 'MQTT_PAYLOAD'){
			if(payload != null) {
				this.value = payload;
				this.updateDom();
			} else {
                console.log(this.name + ': MQTT_PAYLOAD - No payload');
            }
		}
	},

    getStyles: function() {
        return [
            'MQTT.css'
        ];
    },

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.value;
		return wrapper;
	}


});