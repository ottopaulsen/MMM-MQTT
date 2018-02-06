# MQTT

![Screenshot](doc/MQTT.png)

Module for [MagicMirror](https://github.com/MichMich/MagicMirror/) showing the payload of a message from MQTT.

## Installasjon

Go to `MagicMirror/modules` and write

    git clone git@github.com:ottopaulsen/MMM-MQTT.git
    cd MMM-MQTT
    npm install



## Configuration

This is te default configuration with description. Put it in the `MagicMirror/config/config.js`:

    {
        module: 'MMM-MQTT',
        position: 'bottom_center',
        header: 'Title',
        config: {
            topic: 'smoky/1/inside/smoke',
            mqttUser: 'user',
            mqttPassword: 'password',
            mqttServer: 'localhost',
            decimals: 0 // Can be used on numbers
        }
    }

## TO DO

Maybe change name to something more specific

Change to table format, and handle multiple topics

Upload to github.

Create a timeout, so values are deleted if they are not refreshed. May be faded out...

Create a treshold so a value is flashing if outside treshold.