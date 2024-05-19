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

import { generalSqlDialect } from "../../src/dialects";
import { ParameterBuilder } from "../../src/parameter-builder";
import { PartsQuery } from "../../src/query";

describe("generalSqlDialect", () => {
  test("getParameterName", () => {
    const paramName = generalSqlDialect.getParameterName("param");
    expect(paramName).toBe(":param");
  });

  test("glueArray", () => {
    const items = ["item1", "item2", "item3"];
    const glued = generalSqlDialect.glueArray(items);
    expect(glued).toBe("item1, item2, item3");
  });

  test("toPreparedParameters", () => {
    const builder = new ParameterBuilder();
    builder.toParameter("param1");
    builder.toParameter("param2");
    const preparedParams = generalSqlDialect.toPreparedParameters(builder);
    expect(preparedParams).toEqual({ p_1: "param1", p_2: "param2" });
  });

  test("getCommaGlue", () => {
    const commaGlue: PartsQuery =
      generalSqlDialect.getCommaGlue() as PartsQuery;
    expect(commaGlue.parts[0]).toBe(", ");
  });

  test("getAndGlue", () => {
    const andGlue: PartsQuery = generalSqlDialect.getAndGlue() as PartsQuery;
    expect(andGlue.parts[0]).toBe(" AND ");
  });

  test("getOrGlue", () => {
    const orGlue: PartsQuery = generalSqlDialect.getOrGlue() as PartsQuery;
    expect(orGlue.parts[0]).toBe(" OR ");
  });

  test("getUnionGlue", () => {
    const unionGlue: PartsQuery =
      generalSqlDialect.getUnionGlue() as PartsQuery;
    expect(unionGlue.parts[0]).toBe(" UNION ");
  });
});
