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

import {
  tql,
  PartsQuery,
  GlueQuery,
  AndGlueQuery,
  OrGlueQuery,
  CommaGlueQuery,
  UnionGlueQuery,
} from "../src/query";
import { createDialect } from "./helpers";

describe("query", () => {
  it("should return empty parts when nothing is passed", () => {
    const result = tql``;

    expect(result).toBeInstanceOf(PartsQuery);
    expect(result.parts).toEqual([""]);
    expect(result.params).toEqual([]);
  });

  it("should return proper prepared params with parts", () => {
    const value = "test";
    const result = tql`SELECT * FROM users WHERE id = ${value}`;

    expect(result).toBeInstanceOf(PartsQuery);
    expect(result.parts).toEqual(["SELECT * FROM users WHERE id = ", ""]);
    expect(result.params).toEqual([value]);
  });

  it("should accept other queries as params", () => {
    const value = "test";
    const otherQuery = tql`(SELECT id FROM profiles WHERE name = ${value})`;
    const result = tql`SELECT * FROM users WHERE id = ${otherQuery}`;

    expect(result).toBeInstanceOf(PartsQuery);
    expect(result.parts).toEqual(["SELECT * FROM users WHERE id = ", ""]);
    expect(result.params).toEqual([otherQuery]);
  });
});

describe("GlueQuery", () => {
  it("should return null if no glue is provided", () => {
    const source = tql`TEST`;
    const glueQuery = new GlueQuery([source]);
    const dialect = createDialect();
    expect(glueQuery.queries).toEqual([source]);
    expect(glueQuery.getGlue(dialect)).toBe(null);
  });
  it("should return its own glue when called regardless of dialect", () => {
    const source = tql`TEST`;
    const glue = tql`,`;
    const glueQuery = new GlueQuery([source], glue);
    const dialect = createDialect();
    expect(glueQuery.queries).toEqual([source]);
    expect(glueQuery.getGlue(dialect)).toBe(glue);
  });
});

describe("AndGlueQuery", () => {
  it("should return AND glue from dialect", () => {
    const source = tql`TEST`;
    const glue = tql`,`;
    const glueQuery = new AndGlueQuery([source], glue);
    const andGlue = tql`AND Glue Dialect`;
    const dialect = createDialect({ getAndGlue: () => andGlue });
    expect(glueQuery.queries).toEqual([source]);
    expect(glueQuery.getGlue(dialect)).toBe(andGlue);
  });
});

describe("OrGlueQuery", () => {
  it("should return OR glue from dialect", () => {
    const source = tql`TEST`;
    const glue = tql`,`;
    const glueQuery = new OrGlueQuery([source], glue);
    const orGlue = tql`OR Glue Dialect`;
    const dialect = createDialect({ getOrGlue: () => orGlue });
    expect(glueQuery.queries).toEqual([source]);
    expect(glueQuery.getGlue(dialect)).toBe(orGlue);
  });
});

describe("CommaGlueQuery", () => {
  it("should return COMMA glue from dialect", () => {
    const source = tql`TEST`;
    const glue = tql`,`;
    const glueQuery = new CommaGlueQuery([source], glue);
    const commaGlue = tql`, Glue Dialect`;
    const dialect = createDialect({ getCommaGlue: () => commaGlue });
    expect(glueQuery.queries).toEqual([source]);
    expect(glueQuery.getGlue(dialect)).toBe(commaGlue);
  });
});

describe("UnionGlueQuery", () => {
  it("should return UNION glue from dialect", () => {
    const source = tql`TEST`;
    const glue = tql`,`;
    const glueQuery = new UnionGlueQuery([source], glue);
    const unionGlue = tql`UNION Glue Dialect`;
    const dialect = createDialect({ getUnionGlue: () => unionGlue });
    expect(glueQuery.queries).toEqual([source]);
    expect(glueQuery.getGlue(dialect)).toBe(unionGlue);
  });
});
