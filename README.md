# MQTT

![Screenshot](doc/MQTT.png)

Module for [MagicMirror](https://github.com/MichMich/MagicMirror/) showing the payload of a message from MQTT.

## Installasjon

Go to `MagicMirror/modules` and write

    git clone git@github.com:ottopaulsen/MMM-MQTT.git
    cd MMM-MQTT
    npm install



## Configuration

Here is an example configuration with description. Put it in the `MagicMirror/config/config.js` file:

    {
        module: 'MMM-MQTT',
        position: 'bottom_left',
        header: 'MQTT',
        config: {
            mqttServers: [
                {
                    address: 'localhost',  // Server address or IP address
                    port: '1883',          // Port number if other than default
                    user: 'user',          // Leave out for no user
                    password: 'password',  // Leave out for no password
                    subscriptions: [
                        {
                            topic: 'smoky/1/inside/temperature', // Topic to look for
                            label: 'Temperatur', // Displayed in front of value
                            suffix: '°C',        // Displayed after the value
                            decimals: 1,         // Round numbers to this number of decimals
                            sortOrder: 10,       // Can be used to sort entries in the same table
                            maxAgeSeconds: 60    // Reduce intensity if value is older
                        },
                        {
                            topic: 'smoky/1/inside/humidity',
                            label: 'Luftfuktighet',
                            suffix: '%',
                            decimals: 0,
                            sortOrder: 20,
                            maxAgeSeconds: 60
                        },
                        {
                            topic: 'smoky/1/inside/smoke',
                            label: 'Røyk',
                            sortOrder: 30,
                            maxAgeSeconds: 60
                        },
                        {
                            topic: 'guests',
                            label: 'First guest',
                            jsonpointer: '/people/0/name'
                        }
                    ]
                }
            ],
        }
    }


mqttServers is an array, so you can add multiple servers to the same config. You can also use the module multiple places on the mirror/screen.

### JSON Data

If the payload contains JSON data, use the jsonpointer configuration to get the value. See [JSON Ponter specification](https://tools.ietf.org/html/rfc6901) or google an easier description.

## Collaborate

Pull requests are welcome.

## TO DO


Create a timeout, so values are deleted if they are not refreshed. May be faded out...

Create a treshold so a value is flashing if outside treshold.
