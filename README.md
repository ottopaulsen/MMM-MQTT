# MQTT Publisher

Module for [MagicMirror](https://github.com/MichMich/MagicMirror/) publishing notifications from [MM notification mechanism](https://github.com/michMich/MagicMirror/wiki/notifications) to any MQTT Broker(s).

This module allows publishing to a MQTT broker e.g. an IoT framework such as [OpenHAB](https://www.openhab.org/), [DSLinks](http://iot-dsa.org/), etc, or some other MQTT broker.

*Note: 
Best used with [MMM-MQTT](https://github.com/ottopaulsen/MMM-MQTT) to allow subscribing to an MQTT broker and retrieving information from an MQTT Broker* 

This project was forked and adapted from [@ottopaulsen](https://github.com/ottopaulsen)'s [MMM-MQTT](https://github.com/ottopaulsen/MMM-MQTT)

**Any issues, please report and pull requests are most welcome**

## Screenshot

Shows that it is active and running. This will most likely include last send notifications with a timeout feature in future

![Screenshot](doc/MQTT-Publisher.png)

## What is MQTT
MQTT is a lightweight messaging protocol implementing the [Publish–subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern), used in mainly in smart (or M2M) environments to allow devices and sensors and basically anything to communicate with anything else, requiring a MQTT broker (i.i. a [mosquitto server](https://mosquitto.org/)) [see for more info](http://mqtt.org/)


## Installation

Open up your terminal, navigate to `/path/to/MagicMirror/modules`. Then type in:

    git clone https://github.com/cybex-dev/MMM-MQTT-Publisher
    cd MMM-MQTT-Publisher
    npm install

## Configuration

Here is an example configuration with description. Put it in the `MagicMirror/config/config.js` file:

    {
        module: 'MMM-MQTT-Publisher',
        position: 'bottom_left',
        header: 'MQTT Publisher',
        config: {
            mqttServers: [
                {
                    address: 'localhost',       // Server address or IP address
                    port: '1883',               // Port number if other than default
                    user: '',                   // Leave out for no user
                    password: '',               // Leave out for no password
                    publications: [             // multiple topic, notification tuples are allowed
                        {
                            topic: 'calender/event',                // Topic to look for
                            notification: 'CALENDER_EVENTS'         // Broadcast data received by `CLOCK_TICK` notification.
                        },
                    ]
                },
            ],
        }
    }

`mqttServers` is an array, so you can add multiple servers to the same config. You can also use the module multiple places on the mirror/screen.

## Configuration options

The following properties can be configured:

| Option             | Description
| ------------------ | -----------
| `position`         | Location on MagicMirror display
| `mqttServers`      | An array of servers.

## MQTT Server Configuration options

The following properties can be configured for an MQTT Server:

| Option             | Description
| ------------------ | -----------
| `address`          | Address (IPv4 or hostname). <br> **Default value:** `localhost`
| `port`             | The port which the MQTT listens on. <br> **Default value:** `1883`
| `user`             | Username credential of the MQTT broker requires it. <br> *This can be left blank if no username is required*
| `password`         | Password credential of the MQTT broker requires it. <br> *This can be left blank if no password is required*
| `publications`     | An array of notifications which the MQTT broker will be accepting from the MM-MQTT module.

### Publishing

MM-MQTT module also allows publishing of data to topics. For a specific MQTT Server, an array of notifications and corresponding topics is defined. 

When a notification is received via [MM notification mechanism](https://github.com/michMich/MagicMirror/wiki/notifications), it is received by the MQTT-Module. This notification is checked against each MQTT Server's `publication` notifications and the data is published to the topic if needed. 

This is detailed below:  

| Option             | Description
| ------------------ | -----------
| `topic`            | The topic to publish to. e.g. `clock` or `home/door/sensor/open`
| `notification`     | The notification to publish on if present. `CALENDER_EVENTS`

### How To Publish
Publishing data to the MQTT server is done by sending a notification from your module by calling from within your module (not in the `node_helper` module)

`this.sendNotification(notification, payload)`

where:

| Parameter         | Description
| ------------------| -----------
| `notification`    | your desired notification name. This can be `CALENDER_EVENTS` or `CLOCK_TICK`
| `payload`         | the data you wish to send to the MQTT broker.

### JSON Data

If the payload contains JSON data, use the `jsonpointer` configuration to get the value. See [JSON Ponter specification](https://tools.ietf.org/html/rfc6901) or google an easier description.

When dealing with a topic named e.g. `/mirror/clock/tick`, you will need to parse the `topic` and its value into a JSON object.

#### Example

You want to publish data to the topic `/mirror/clock/tick` with value `21`

The resulting JSON Object format is: 
```{"mirror": {"clock": {"tick": 21}}}```

*p.s. don't forget about adding quotes to each string value to match JSON compatibility*


## Collaborate

Pull requests are welcome.

## TO DO

Create more descriptive GUI possibly adding a list of notifications with the most recently published first. 
