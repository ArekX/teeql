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
