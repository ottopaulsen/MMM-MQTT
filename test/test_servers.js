const path = require("path");
module.exports = [
  {
    address: "server1",
    port: "12345",
    user: "myuser",
    password: "mypassword",
    subscriptions: [
      {
        topic: "topic1/sensor",
        label: "Topic 1 sensor",
        colors: [
          // Value dependent colors
          { upTo: -10, value: "blue", label: "blue", suffix: "blue" },
          { upTo: 0, value: "#00ccff", label: "#00ccff", suffix: "#00ccff" },
          { upTo: 10, value: "yellow" },
          { upTo: 25, label: "green", suffix: "green" },
          { upTo: 100, label: "red" } // The last one is used for higher values too
        ]
      },
      {
        topic: "topic2/sensor",
        label: "Topic 2 sensor",
        decimalSignInMessage: ",",
        decimals: 2
      }
    ]
  },
  {
    address: "server2",
    user: "myuser",
    password: "mypassword",
    subscriptions: [
      {
        topic: "topic1/value",
        label: "Topic 1 value"
      },
      {
        topic: "topic2/value",
        label: "Topic 2 value",
        jsonpointer: "/t/1/a"
      },
      {
        topic: "topic3/value",
        label: "Topic 3 value",
        multiply: 100
      },
      {
        topic: "topic4/value",
        label: "Topic 4 value",
        divide: 1000,
        decimals: 1
      },
      {
        topic: "topic5/value",
        label: "Topic 5 value",
        conversions: [
          { from: "true", to: "Open" },
          { from: "false", to: "Closed" }
        ]
      }
    ]
  },
  {
    address: "mqtts://server3",
    port: "12345",
    user: "myuser",
    password: "mypassword",
    ca: __dirname + path.sep + "cert.txt",
    subscriptions: [
      {
        topic: "topic1/value",
        label: "Topic 1 value"
      }
    ]
  }
];
