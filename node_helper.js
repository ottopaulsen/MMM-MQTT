const mqtt = require('mqtt');
const NodeHelper = require("node_helper");

var servers = [];

module.exports = NodeHelper.create({

    log: function (...args) {
        if (this.config.logging) {
            console.log(args);
        }
    },

    start: function () {
        console.log(this.name + ': Starting node helper');
        this.loaded = false;
    },

    makeServerKey: function(server){
        return '' + server.address + ':' + (server.port | '1883' + server.user);
    },

    addServer: function (server) {
        console.log(this.name + ': Adding server: ', server);
        var serverKey = this.makeServerKey(server);
        var mqttServer = {}
        var foundServer = false;
        for (i = 0; i < servers.length; i++) {
            if (servers[i].serverKey === serverKey) {
                mqttServer = servers[i];
                foundServer = true;
            }
        }
        if(!foundServer) {
            mqttServer.serverKey = serverKey;
            mqttServer.address = server.address;
            mqttServer.port = server.port;
            mqttServer.options = {};
            mqttServer.topics = [];
            if(server.user) mqttServer.options.username = server.user;
            if(server.password) mqttServer.options.password = server.password;
        }

        for(i = 0; i < server.subscriptions.length; i++){
            mqttServer.topics.push(server.subscriptions[i].topic);
        }

        servers.push(mqttServer);
        this.startClient(mqttServer);
    },

    addConfig: function (config) {
        for (i = 0; i < config.mqttServers.length; i++) {
            this.addServer(config.mqttServers[i]);
        }
    },

    startClient: function(server) {

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

        server.client.on('connect', function (connack) {
            console.log(self.name + ' connected to ' + mqttServer);
            console.log(self.name + ': subscribing to ' + server.topics);
            server.client.subscribe(server.topics);
        });

        server.client.on('message', function (topic, payload) {
            log('Received topic ' + topic + ', payload ' + payload);
            log('Sending serverKey = ' + server.serverKey
                + ', topic = ' + topic
                + ', value = ' + payload.toString()
                + ', time = ' + Date.now()
            )
            self.sendSocketNotification('MQTT_PAYLOAD', {
                serverKey: server.serverKey,
                topic: topic,
                value: payload.toString(),
                time: Date.now()
            });
        });

    },

    socketNotificationReceived: function (notification, payload) {
        log(this.name + ': Socket notification received: ', notification, ': ', payload);
        var self = this;
        if (notification === 'MQTT_CONFIG') {
            var config = payload;
            self.addConfig(config);
            self.loaded = true;
        }
    },
});
