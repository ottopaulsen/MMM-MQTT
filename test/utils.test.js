const { makeServerKey } = require("../utils");

describe("utils", () => {
  it("makes server key with default port", () => {
    const server = {
      address: "myserver",
      user: "myuser"
    };
    const key = makeServerKey(server);
    expect(key).toBe("myserver:1883myuser");
  });
  it("makes server key with default port", () => {
    const server = {
      address: "myserver",
      user: "myuser",
      port: 12345
    };
    const key = makeServerKey(server);
    expect(key).toBe("myserver:12345myuser");
  });
});
