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

import { Dialect, generalSqlDialect } from "./dialects";
import { ParameterBuilder } from "./parameter-builder";
import {
  GlueQuery,
  PartsQuery,
  PrependQuery,
  SourceQuery,
  UnsafeNameQuery,
} from "./query";

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
    return compilePartsQuery(query, parameters, dialect);
  } else if (query instanceof GlueQuery) {
    return compileGlueQuery(query, parameters, dialect);
  } else if (query instanceof PrependQuery) {
    return compilePrependQuery(query, parameters, dialect);
  } else if (query instanceof UnsafeNameQuery) {
    return compileUnsafeNameQuery(query, parameters, dialect);
  }

  return null;
};

const compilePartsQuery = (
  query: PartsQuery,
  parameters: ParameterBuilder,
  dialect: Dialect
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
  parameters: ParameterBuilder,
  dialect: Dialect
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
    params: dialect.toPreparedParameters(parameters),
  };
};

const compilePrependQuery = (
  query: PrependQuery,
  parameters: ParameterBuilder,
  dialect: Dialect
): CompiledQuery | null => {
  const compiledPrepend = compile(query.withQuery, parameters, dialect);
  const compiledQuery = compile(query.query, parameters, dialect);

  if (!compiledPrepend || !compiledQuery) {
    return null;
  }

  return {
    sql: compiledPrepend.sql + compiledQuery.sql,
    params: dialect.toPreparedParameters(parameters),
  };
};

const compileUnsafeNameQuery = (
  query: UnsafeNameQuery,
  parameters: ParameterBuilder,
  dialect: Dialect
): CompiledQuery | null => {
  return {
    sql: dialect.getSanitizedName(query.name),
    params: dialect.toPreparedParameters(parameters),
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
