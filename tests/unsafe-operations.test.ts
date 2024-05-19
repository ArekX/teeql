import { ParameterBuilder, tql, unsafeName, unsafeRaw, compile } from "../src";
import { createDialect } from "./helpers";

describe("unsafeRaw", () => {
  it("should be left unchanged when compiled in tql", () => {
    const id = 1;
    const unsafeQuery = "SELECT * FROM users WHERE id = " + id;
    const parameters = new ParameterBuilder();
    const dialect = createDialect({
      toPreparedParameters: (p) => p.parameters,
    });
    const query = tql`SELECT * FROM users WHERE id IN (${unsafeRaw(
      unsafeQuery
    )})`;
    const compiled = compile(query, parameters, dialect);

    expect(compiled).toEqual({
      sql: "SELECT * FROM users WHERE id IN (SELECT * FROM users WHERE id = 1)",
      params: {},
    });
  });
});

describe("unsafeName", () => {
  it("should be sanitized by dialect", () => {
    const parameters = new ParameterBuilder();
    const dialect = createDialect({
      toPreparedParameters: (p) => p.parameters,
      getSanitizedName: (name) => name.replace(/[^a-zA-Z0-9_\.]/g, ""),
    });
    const tableName = unsafeName("schema.users$ OR 1=1 --");
    const query = tql`SELECT * FROM ${tableName} WHERE id = 1`;
    const compiled = compile(query, parameters, dialect);

    expect(compiled).toEqual({
      sql: "SELECT * FROM schema.usersOR11 WHERE id = 1",
      params: {},
    });
  });
});
