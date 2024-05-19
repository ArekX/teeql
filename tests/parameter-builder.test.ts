import { ParameterBuilder } from "../src/parameter-builder";

describe("ParameterBuilder", () => {
  it("should generate a parameter", () => {
    const builder = new ParameterBuilder();
    expect(builder.toParameter(1)).toBe("p_1");
  });

  it("should reuse the same parameter for the same value", () => {
    const builder = new ParameterBuilder();
    expect(builder.toParameter(1)).toBe("p_1");
    expect(builder.toParameter(1)).toBe("p_1");
  });

  it("should generate a new parameter for a different value", () => {
    const builder = new ParameterBuilder();
    expect(builder.toParameter(1)).toBe("p_1");
    expect(builder.toParameter(2)).toBe("p_2");
  });

  it("should return the parameters", () => {
    const builder = new ParameterBuilder();
    expect(builder.toParameter(1)).toBe("p_1");
    expect(builder.toParameter(2)).toBe("p_2");
    expect(builder.parameters).toEqual({ p_1: 1, p_2: 2 });
  });
});
