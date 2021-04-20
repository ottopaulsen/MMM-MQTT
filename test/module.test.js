/**
 * @jest-environment jsdom
 */

const mqttServers = require("./test_servers");
const { makeServerKey } = require("../utils");
const jsonpointer = require("../jsonpointer.js");
const translate = function (val) {
  return val;
};

let moduleName = null;
let mqttModule = {};
global.Module = {
  register: function (name, mmm) {
    moduleName = name;
    mqttModule = mmm;
    mqttModule.config = {
      logging: false,
      mqttServers
    };
  }
};
globalThis.makeServerKey = makeServerKey;
global.get = jsonpointer.get;
const mmm = require("../MMM-MQTT.js");
const { globalShortcut } = require("electron");

let subscriptions;
beforeEach(() => {
  subscriptions = mqttModule.makeSubscriptions(mqttServers);
});

function sendMessage(topic, value) {
  const payload = { topic, value };
  return mqttModule.setSubscriptionValue(subscriptions, payload, false);
}
function renderWrapper() {
  const { getWrapper, getColors, isValueTooOld, convertValue } = mqttModule;
  return getWrapper(
    document,
    subscriptions,
    true,
    translate,
    "MMM-MQTT",
    getColors,
    isValueTooOld,
    convertValue
  );
}

describe("MMM-MQTT module", () => {
  it("can make subscription list", () => {
    expect(subscriptions[0].topic).toBe("topic1/sensor");
    expect(subscriptions[0].serverKey).toBe("server1:12345myuser");
    expect(subscriptions[0].label).toBe("Topic 1 sensor");
    // expect(subscriptions[0]).toBe({});
    expect(subscriptions[1].topic).toBe("topic2/sensor");
    expect(subscriptions[1].serverKey).toBe("server1:12345myuser");
    expect(subscriptions[1].label).toBe("Topic 2 sensor");
    // expect(subscriptions[1]).toBe({});
    expect(subscriptions[2].topic).toBe("topic1/value");
    expect(subscriptions[2].serverKey).toBe("server2:1883myuser");
    expect(subscriptions[2].label).toBe("Topic 1 value");
    // expect(subscriptions[0]).toBe({});
    expect(subscriptions[3].topic).toBe("topic2/value");
    expect(subscriptions[3].serverKey).toBe("server2:1883myuser");
    expect(subscriptions[3].label).toBe("Topic 2 value");
    // expect(subscriptions[1]).toBe({});
  });
  it("evluates isValueTooOld correct", () => {
    expect(mqttModule.isValueTooOld(60, new Date())).toBeFalsy();
    expect(mqttModule.isValueTooOld(60, new Date() - 60001)).toBeTruthy();
    expect(mqttModule.isValueTooOld(60, new Date() - 60000)).toBeFalsy();
    expect(mqttModule.isValueTooOld(null, new Date() - 60001)).toBeFalsy();
    expect(mqttModule.isValueTooOld(null, new Date() - 60000)).toBeFalsy();
  });
  it("sets subscription values right", () => {
    const res = sendMessage("topic1/sensor", 55);
    expect(res[0].value).toBe(55);
  });
  it("can use jsonpointer", () => {
    const value = JSON.stringify({
      t: [
        { a: 123, b: 321 },
        { a: 111, b: 222 }
      ]
    });

    const res = sendMessage("topic2/value", value);
    expect(res[3].value).toBe(111);
  });
  it("converts decimal point in message", () => {
    const res = sendMessage("topic2/sensor", "30,052");
    expect(res[1].value).toBe("30.05");
  });
  it("can divide, multiply and round", () => {
    // Multiply
    const multiply = sendMessage("topic3/value", 12.5);
    expect(multiply[4].value).toBe("1250");

    // Divide
    const divide = sendMessage("topic4/value", 125678);
    expect(divide[5].value).toBe("125.7");
  });
  it("renders all fetures", () => {
    const value = JSON.stringify({
      t: [
        { a: 123, b: 321 },
        { a: 111, b: 222 }
      ]
    });

    sendMessage("topic1/sensor", 55);
    sendMessage("topic2/value", value);
    sendMessage("topic2/sensor", "30,052");
    sendMessage("topic3/value", 12.5);
    sendMessage("topic4/value", 125678);
    sendMessage("topic5/value", true);
    const res = renderWrapper();
    expect(res).toMatchSnapshot();
  });
  it("works", () => {
    const res = sendMessage("topic1", 123);
    expect(res);
  });
  it("renders correct before loaded", () => {});
  it("renders correct colors", () => {
    const config = [
      {
        address: "server1",
        user: "myuser",
        password: "mypassword",
        subscriptions: [
          {
            topic: "topic1",
            label: "Topic 1",
            colors: [
              { upTo: -10, value: "blue", label: "blue", suffix: "blue" },
              { upTo: 0, value: "brown", label: "brown", suffix: "brown" },
              { upTo: 10, value: "yellow" },
              { upTo: 25, label: "green", suffix: "green" },
              { upTo: 100, label: "red" }
            ]
          }
        ]
      }
    ];
    subscriptions = mqttModule.makeSubscriptions(config);

    const verify = function (value, color) {
      sendMessage("topic1", value);
      const res = renderWrapper();
      expect(res.innerHTML).toContain("color: " + color + ";");
    };
    verify(-11, "blue");
    verify(-5, "brown");
    verify(5, "yellow");
    verify(24, "green");
    verify(25, "red");
  });
  it("", () => {});
});
