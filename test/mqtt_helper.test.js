const mqttHelper = require("../mqtt_helper");
const mqttMock = require("mqtt");

jest.mock("mqtt", () => ({
  connect: jest.fn(() => ({
    on: jest.fn()
  }))
}));

const humidityColors = [
  { upTo: 95, value: "" },
  { upTo: 100, value: "#4db8ff" }
];

const mqttServers = require("./test_servers");

describe("mqtt handling", () => {
  it("makes server config", () => {
    const serverList = mqttHelper.addServers([], mqttServers);
    expect(serverList).toStrictEqual([
      {
        address: "server1",
        options: {
          password: "mypassword",
          username: "myuser"
        },
        port: "12345",
        serverKey: "server1:12345myuser",
        topics: ["topic1/sensor", "topic2/sensor"]
      },
      {
        address: "server2",
        port: undefined,
        options: {
          password: "mypassword",
          username: "myuser"
        },
        serverKey: "server2:1883myuser",
        topics: [
          "topic1/value",
          "topic2/value",
          "topic3/value",
          "topic4/value",
          "topic5/value"
        ]
      }
    ]);
  });
  it("starts clients", () => {
    global.console.log = jest.fn();

    const serverList = mqttHelper.addServers([], mqttServers);
    mqttHelper.startClients(serverList);
    expect(mqttMock.connect).toHaveBeenCalledWith("mqtt://server1:12345", {
      password: "mypassword",
      username: "myuser"
    });
    expect(mqttMock.connect).toHaveBeenCalledWith("mqtt://server2", {
      password: "mypassword",
      username: "myuser"
    });
    expect(console.log).toHaveBeenCalledWith(
      "MMM-MQTT: Connecting to mqtt://server1:12345"
    );
    expect(console.log).toHaveBeenCalledWith(
      "MMM-MQTT: Connecting to mqtt://server2"
    );
    [0, 1].forEach((server) => {
      ["error", "reconnect", "connect", "message"].forEach((event) => {
        expect(
          mqttMock.connect.mock.results[server].value.on
        ).toHaveBeenCalledWith(event, expect.anything());
      });
    });
  });
});
