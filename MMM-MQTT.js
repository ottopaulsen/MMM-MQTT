
Module.register("MMM-MQTT",{

    getScripts: function() {
        return [
            this.file('node_modules/jsonpointer/jsonpointer.js')
        ];
    },

    // Default module config
    defaults: {
        mqttServer: 'localhost',
        subscriptions: []
    },

	start: function() {
        console.log(this.name + ' started.');
        this.subscriptions = [];

        console.log(this.name + ': Setting up ' + this.config.subscriptions.length + ' topics');

        for(i = 0; i < this.config.subscriptions.length; i++){
            console.log(this.name + ': Adding config ' + this.config.subscriptions[i].label + ' = ' + this.config.subscriptions[i].topic);
            this.subscriptions[i] = {
                label: this.config.subscriptions[i].label,
                topic: this.config.subscriptions[i].topic,
                decimals: this.config.subscriptions[i].decimals,
                jsonpointer: this.config.subscriptions[i].jsonpointer,
                value: ''
            }
        }
    
		this.openMqttConnection();
        var self = this;
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
                for(i = 0; i < this.subscriptions.length; i++){
                    if(this.subscriptions[i].topic == payload.topic){
                        var value = payload.value;
                        // Extract value if JSON Pointer is configured
                        if(this.subscriptions[i].jsonpointer) {
                            value = get(JSON.parse(value), this.subscriptions[i].jsonpointer);
                        }
                        // Round if decimals is configured
                        if(isNaN(this.subscriptions[i].decimals) == false) {
                            if (isNaN(value) == false){
                                value = Number(value).toFixed(this.subscriptions[i].decimals);
                            }
                        }
                        this.subscriptions[i].value = value;
                    }
                }
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
        self = this;
		var wrapper = document.createElement("table");
        wrapper.className = "small";
        var first = true;
    
        if (self.subscriptions.length === 0) {
            wrapper.innerHTML = (self.loaded) ? self.translate("EMPTY") : self.translate("LOADING");
            wrapper.className = "small dimmed";
            console.log(self.name + ': No values');
            return wrapper;
        }        

        self.subscriptions.forEach(function(sub){
            var subWrapper = document.createElement("tr");
    
            // Label
            var labelWrapper = document.createElement("td");
            labelWrapper.innerHTML = sub.label;
            labelWrapper.className = "align-left";
            subWrapper.appendChild(labelWrapper);
    
            // Value
            var valueWrapper = document.createElement("td");
            valueWrapper.innerHTML = sub.value;
            valueWrapper.className = "align-right bright medium";
            subWrapper.appendChild(valueWrapper);

            wrapper.appendChild(subWrapper);
        });

        return wrapper;
    }
});