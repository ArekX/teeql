import { hello } from "./index";

describe("testing index file", () => {
  test("Hello world test", () => {
    expect(hello("me")).toBe("Hello me! ");
  });
});
