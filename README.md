# MQTT

Module for [MagicMirror](https://github.com/MichMich/MagicMirror/) showing the payload of a message from MQTT.

## Screenshot

![Screenshot](doc/MQTT.png)

## Installasjon

Go to `MagicMirror/modules` and write

    git clone https://github.com/ottopaulsen/MMM-MQTT
    cd MMM-MQTT
    npm install

## Configuration

Here is an example configuration with description. Put it in the `MagicMirror/config/config.js` file:

```javascript
{
    module: 'MMM-MQTT',
    position: 'bottom_left',
    header: 'MQTT',
    config: {
        logging: false,
        useWildcards: false,
        mqttServers: [
            {
                address: 'localhost',  // Server address or IP address
                port: '1883',          // Port number if other than default
                user: 'user',          // Leave out for no user
                password: 'password',  // Leave out for no password
                subscriptions: [
                    {
                        topic: 'smoky/1/inside/temperature', // Topic to look for
                        label: 'Temperature', // Displayed in front of value
                        suffix: '°C',         // Displayed after the value
                        decimals: 1,          // Round numbers to this number of decimals
                        sortOrder: 10,        // Can be used to sort entries in the same table
                        maxAgeSeconds: 60,    // Reduce intensity if value is older
                        colors: [             // Value dependent colors
                            { upTo: -10, value: "blue", label: "blue", suffix: "blue" },
                            { upTo: 0, value: "#00ccff", label: "#00ccff", suffix: "#00ccff" },
                            { upTo: 10, value: "yellow"},
                            { upTo: 25, label: "green", suffix: "green" },
                            { upTo: 100, label: "red" }, // The last one is used for higher values too
                        ],
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
                        divide: 10, // Divide numeric values. Alternatively use `multiply`.
                        maxAgeSeconds: 60
                    },
                    {
                        topic: 'guests',
                        label: 'First guest',
                        jsonpointer: '/people/0/name'
                    },
                    {
                        topic: "house/1/doors/1",
                        label: "Door",
                        conversions: [
                            { from: "true", to: "Open" },
                            { from: "false", to: "Closed" }
                        ]
                    }
                ]
            }
        ],
    }
}
```

mqttServers is an array, so you can add multiple servers to the same config. You can also use the module in multiple places on the mirror/screen.

### JSON Data

If the payload contains JSON data, use the jsonpointer configuration to get the value. See [JSON Ponter specification](https://tools.ietf.org/html/rfc6901) or google an easier description.

### Wildcards

Wildcard "+" is supported in topics, but it only works on some platforms (Chrome, Electron). Set the useWildcards config to true for wildcards to work.

### Conversions

Use the conversions config to convert values from one to another. If there is no match, the received value is used.

For numeric values, you can use `multiply` or `divide` to multiply or divide values before they are displayed. See example with `divide` above.

### Colored values

For numeric values, color codes can be configured using the colors array in the subscription config.
If you are using the same color scheme on multiple topics, you can configure it as a constant above the config variable like this:

```javascript
const humidityColors = [
  {upTo: 95, value: ''},
  {upTo: 100, value: '#1a1aff'},
];

var config = {
    ...
```

and then refer to it like this:

```javascript
colors: humidityColors;
```

## Styling

General styling can be done in the `MQTT.css` file. The table header can be styled using locator `#module_3_MMM-MQTT > header`. The column text can be styled using the following classes:

```css
.mqtt-label {
}
.mqtt-value {
}
.mqtt-suffix {
}
```

## Collaborate

Pull requests are welcome.

## TO DO

Create a timeout, so values are deleted if they are not refreshed. May be faded out...

Create a threshold so a value is flashing if outside threshold.
