import cryptoHash from "./crypto-hash";

describe("cryptoHash()", () => {
  it("generates a SHA-256 hashed output", () => {
    expect(cryptoHash("notcis")).toEqual(
      "3e9a5db628cf61765473acb6f7f94fc2518e32ea69ecfd5c6688dcc3dec844cc",
    );
  });

  it("produces the same hash with the same input arguments in any order", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(
      cryptoHash("three", "one", "two"),
    );
  });
  it("produces a unique hash when the properties have changed on an input", () => {
    const foo = {};
    const originalHash = cryptoHash(foo);
    foo["a"] = "a";
    expect(cryptoHash(foo)).not.toEqual(originalHash);
  });
});
