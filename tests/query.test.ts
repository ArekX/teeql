import { Dialect } from "../src/dialects";
import { ParameterBuilder } from "../src/parameter-builder";
import { query, PartsQuery, GlueQuery, SourceQuery } from "../src/query";

describe("query", () => {
  it("should return empty parts when nothing is passed", () => {
    const result = query``;

    expect(result).toBeInstanceOf(PartsQuery);
    expect(result.parts).toEqual([""]);
    expect(result.params).toEqual([]);
  });

  it("should return proper prepared params with parts", () => {
    const value = "test";
    const result = query`SELECT * FROM users WHERE id = ${value}`;

    expect(result).toBeInstanceOf(PartsQuery);
    expect(result.parts).toEqual(["SELECT * FROM users WHERE id = ", ""]);
    expect(result.params).toEqual([value]);
  });

  it("should accept other queries as params", () => {
    const value = "test";
    const otherQuery = query`(SELECT id FROM profiles WHERE name = ${value})`;
    const result = query`SELECT * FROM users WHERE id = ${otherQuery}`;

    expect(result).toBeInstanceOf(PartsQuery);
    expect(result.parts).toEqual(["SELECT * FROM users WHERE id = ", ""]);
    expect(result.params).toEqual([otherQuery]);
  });
});

const createDialect = (overrides: Partial<Dialect>): Dialect => ({
  getParameterName: () => "",
  toPreparedParameters: () => ({}),
  glueArray: () => "",
  getCommaGlue: () => query`,`,
  getAndGlue: () => query` AND `,
  getOrGlue: () => query` OR `,
  getUnionGlue: () => query` UNION `,
  ...overrides,
});

describe("GlueQuery", () => {
  it("should return null if no glue is provided", () => {
    const source = query`TEST`;
    const glueQuery = new GlueQuery([source]);
    const dialect = createDialect({ getCommaGlue: () => query`TEST` });

    expect(glueQuery.getGlue(dialect)).toBe(null);
  });
  it("should return glue when called", () => {
    const source = query`TEST`;
    const glue = query`,`;
    const glueQuery = new GlueQuery([source], glue);
    const dialect = createDialect({ getCommaGlue: () => query`TEST` });

    expect(glueQuery.getGlue(dialect)).toBe(glue);
  });
});
