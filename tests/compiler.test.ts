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

import { ParameterBuilder } from "../src/parameter-builder";
import { SourceQuery, tql } from "../src/query";
import { compile } from "../src/compiler";
import { createDialect } from "./helpers";
import { glueAnd, when } from "../src/operations";
import { emptyQuery } from "../src/constants";

describe("compile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("empty query should return null", () => {
    const query = tql``;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const result = compile(query, parameters, createDialect());
    expect(result).toBeNull();
  });

  it("compiling unsupported class should return null", () => {
    const query = new SourceQuery();
    const parameters: ParameterBuilder = new ParameterBuilder();

    const result = compile(query, parameters, createDialect());
    expect(result).toBeNull();
  });

  it("should compile PartsQuery with non-empty parts", () => {
    const id = 1;
    const query = tql`SELECT * FROM users WHERE id = ${id}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual("SELECT * FROM users WHERE id = :p_1");
    expect(result?.params).toEqual({ p_1: 1 });
  });

  it("should compile subqueries properly", () => {
    const profileName = "Profile Name";
    const subquery = tql`(SELECT id FROM profiles WHERE name = ${profileName})`;
    const query = tql`SELECT * FROM users WHERE id = ${subquery}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual(
      "SELECT * FROM users WHERE id = (SELECT id FROM profiles WHERE name = :p_1)"
    );
    expect(result?.params).toEqual({ p_1: profileName });
  });

  it("should compile array of parameters properly using dialect", () => {
    const ids = [1, 2, tql`(SELECT id FROM profiles WHERE name = 'test')`];
    const query = tql`SELECT * FROM users WHERE id IN ${ids}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
      glueArray: (p) => `(${p.join(", ")})`,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual(
      "SELECT * FROM users WHERE id IN (:p_1, :p_2, (SELECT id FROM profiles WHERE name = 'test'))"
    );
    expect(result?.params).toEqual({ p_1: ids[0], p_2: ids[1] });
  });

  it("should not compile empty array", () => {
    const ids: number[] = [];
    const query = tql`SELECT * FROM users WHERE id IN ${ids}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
      glueArray: (p) => `(${p.join(", ")})`,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual("SELECT * FROM users WHERE id IN ");
    expect(result?.params).toEqual(parameters.parameters);
  });

  it("should not compile empty query in array", () => {
    const ids = [1, 2, emptyQuery];
    const query = tql`SELECT * FROM users WHERE id IN ${ids}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
      glueArray: (p) => `(${p.join(", ")})`,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual("SELECT * FROM users WHERE id IN (:p_1, :p_2)");
    expect(result?.params).toEqual(parameters.parameters);
  });

  it("should not compile empty query", () => {
    const query = tql`SELECT * FROM users WHERE ${new SourceQuery()}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
      glueArray: (p) => `(${p.join(", ")})`,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual("SELECT * FROM users WHERE ");
    expect(result?.params).toEqual(parameters.parameters);
  });

  it("should compile GlueQuery", () => {
    const id = 1;
    const test = "test";
    const query = tql`SELECT * FROM users WHERE ${glueAnd(
      tql`id = ${id}`,
      tql`name = ${test}`
    )}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const dialect = createDialect({
      getParameterName: (p) => `:${p}`,
      toPreparedParameters: (p) => p.parameters,
      getAndGlue: () => tql` AND `,
    });
    const result = compile(query, parameters, dialect);
    expect(result?.sql).toEqual(
      "SELECT * FROM users WHERE id = :p_1 AND name = :p_2"
    );

    expect(result?.params).toEqual({
      p_1: id,
      p_2: test,
    });
  });

  it("should handle conditional compile", () => {
    const conditions = [true, false];

    for (const condition of conditions) {
      const query = tql`SELECT * FROM users ${when(
        condition,
        () => tql`WHERE id = 1`
      )}`;
      const parameters: ParameterBuilder = new ParameterBuilder();
      const result = compile(
        query,
        parameters,
        createDialect({
          toPreparedParameters: (p) => p.parameters,
        })
      );
      expect(result?.sql).toEqual(
        "SELECT * FROM users " + (condition ? "WHERE id = 1" : "")
      );
      expect(result?.params).toEqual({});
    }
  });

  it("should skip invalid glue dialect", () => {
    const query = tql`SELECT * FROM users ${glueAnd(
      tql`id = 1`,
      tql`name = 'test'`
    )}`;
    const parameters: ParameterBuilder = new ParameterBuilder();
    const result = compile(
      query,
      parameters,
      createDialect({
        getAndGlue: () => "INVALID NON TQL",
        toPreparedParameters: (p) => p.parameters,
      })
    );
    expect(result?.sql).toEqual("SELECT * FROM users ");
    expect(result?.params).toEqual(parameters.parameters);

    const result2 = compile(
      query,
      parameters,
      createDialect({
        getAndGlue: () => null!,
        toPreparedParameters: (p) => p.parameters,
      })
    );
    expect(result2?.sql).toEqual("SELECT * FROM users ");
    expect(result2?.params).toEqual(parameters.parameters);
  });
});
