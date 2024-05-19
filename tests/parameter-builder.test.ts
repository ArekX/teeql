/**
     Copyright 2024 Aleksandar Panic

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { ParameterBuilder } from "../src";

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
