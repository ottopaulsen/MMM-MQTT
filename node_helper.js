var mqtt = require('mqtt');
var NodeHelper = require("node_helper");

var servers = [];

module.exports = NodeHelper.create({

    start: function () {
        console.log(this.name + ': Starting node helper');
        this.loaded = false;
    },

    makeServerKey: function (server) {
        return '' + server.address + ':' + (server.port | '1883' + server.user);
    },

    addServer: function (server) {
        console.log(this.name + ': Adding server: ', server);
        var serverKey = this.makeServerKey(server);
        var mqttServer = {};
        var foundServer = false;
        for (i = 0; i < servers.length; i++) {
            if (servers[i].serverKey === serverKey) {
                mqttServer = servers[i];
                foundServer = true;
            }
        }
        if (!foundServer) {
            mqttServer.serverKey = serverKey;
            mqttServer.address = server.address;
            mqttServer.port = server.port;
            mqttServer.options = {};
            mqttServer.topics = [];
            mqttServer.publications = [];
            if (server.user) mqttServer.options.username = server.user;
            if (server.password) mqttServer.options.password = server.password;
        }

        // Add all topics which the server is listening for, to the MQTT server
        if (server.publications) {
            server.publications.forEach(pub => {
                mqttServer.publications.push(pub);
            });
        }

        servers.push(mqttServer);
        this.startClient(mqttServer);
    },

    addConfig: function (config) {
        for (i = 0; i < config.mqttServers.length; i++) {
            this.addServer(config.mqttServers[i]);
        }
    },

    startClient: function (server) {

        console.log(this.name + ': Starting client for: ', server);

        var self = this;

        var mqttServer = (server.address.match(/^mqtts?:\/\//) ? '' : 'mqtt://') + server.address;
        if (server.port) {
            mqttServer = mqttServer + ':' + server.port
        }
        console.log(self.name + ': Connecting to ' + mqttServer);

        server.client = mqtt.connect(mqttServer, server.options);

        server.client.on('error', function (err) {
            console.log(self.name + ' ' + server.serverKey + ': Error: ' + err);
        });

        server.client.on('reconnect', function (err) {
            server.value = 'reconnecting'; // Hmmm...
            console.log(self.name + ': ' + server.serverKey + ' reconnecting');
        });
    },

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + ': Socket notification received: ', notification, ': ', payload);
        var self = this;

        // Handle any and all incoming socket notifications
        switch (notification) {
            case "MQTT_CONFIG": {
                var config = payload;
                self.addConfig(config);
                self.loaded = true;
                break;
            }
            case "MQTT_PUBLISH": {
                // filter servers based on notification of interestx
                servers.filter(server => server.publications.filter(pub => pub.notification === payload.notification).length !== 0)
                // filter all mqtt servers listening for a notification

                // Publish topic update
                    .forEach(mqttServer => {
                        // publish data
                        console.log("Publish -> " + mqttServer.serverKey);

                        // for each notification in a mqtt server config
                        mqttServer.publications.filter(pub => pub.notification === payload.notification)

                            // for each topic on config
                            .forEach(topic => {
                                mqttServer.client.publish(topic, JSON.stringify(payload.payload));
                            });
                    });
                break;
            }

            default: {
                console.log("Unknown Notification \'" + notification + "\'");
                break;
            }
        }
    },
});
