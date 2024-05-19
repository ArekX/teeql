import { Dialect, generalSqlDialect } from "./dialects";
import { ParameterBuilder } from "./parameter-builder";
import { GlueQuery, PartsQuery, SourceQuery } from "./query";

/**
 * Represents a compiled query.
 */
export interface CompiledQuery {
  /**
   * The SQL query string.
   */
  sql: string;
  
  /**
   * The parameters used in the query.
   */
  params: Record<string, unknown>;
}

/**
 * Compiles a query into a compiled query object.
 *
 * @param query - The query to compile.
 * @param parameters - The parameter builder to use for compiling the query.
 * @param dialect - The SQL dialect to use for compiling the query.
 * @returns The compiled query object, or null if the query cannot be compiled.
 */
export const compile = (
  query: SourceQuery,
  parameters: ParameterBuilder = new ParameterBuilder(),
  dialect: Dialect = generalSqlDialect
): CompiledQuery | null => {
  if (query instanceof PartsQuery) {
    return compilePartsQuery(query, dialect, parameters);
  } else if (query instanceof GlueQuery) {
    return compileGlueQuery(query, dialect, parameters);
  }

  return null;
};

const compilePartsQuery = (
  query: PartsQuery,
  dialect: Dialect,
  parameters: ParameterBuilder
): CompiledQuery | null => {
  if (
    query.parts.length === 0 ||
    (query.parts.length === 1 && query.parts[0] === "")
  ) {
    return null;
  }

  const parts = [];
  for (let i = 0; i < query.parts.length; i++) {
    parts.push(query.parts[i]);

    if (i >= query.params.length) {
      continue;
    }

    const value = compileParameter(query.params[i], dialect, parameters);

    if (value === null) {
      continue;
    }

    parts.push(value);
  }

  return {
    sql: parts.join(""),
    params: dialect.toPreparedParameters(parameters),
  };
};

const compileGlueQuery = (
  glueQuery: GlueQuery,
  dialect: Dialect,
  parameters: ParameterBuilder
): CompiledQuery | null => {
  const compiledParts = [];
  for (const query of glueQuery.queries) {
    const compiled = compile(query, parameters, dialect);
    if (compiled) {
      compiledParts.push(compiled.sql);
    }
  }

  const glue = glueQuery.getGlue(dialect);

  if (!glue) {
    return null;
  }

  const compiledGlue = compile(glue, parameters, dialect);

  if (!compiledGlue) {
    return null;
  }

  return {
    sql: compiledParts.join(compiledGlue.sql),
    params: compiledGlue.params,
  };
};

export const compileParameter = <T>(
  paramValue: T,
  dialect: Dialect,
  parameters: ParameterBuilder
): string | null => {
  if (paramValue instanceof SourceQuery) {
    return compile(paramValue, parameters, dialect)?.sql ?? null;
  }

  if (Array.isArray(paramValue)) {
    const values: string[] = [];

    for (const param of paramValue) {
      let parsed = compileParameter(param, dialect, parameters);

      if (!parsed || (typeof parsed === "string" && parsed.trim() === "")) {
        continue;
      }

      values.push(parsed);
    }

    if (values.length === 0) {
      return null;
    }

    return dialect.glueArray(values);
  }

  return dialect.getParameterName(parameters.toParameter(paramValue));
};
