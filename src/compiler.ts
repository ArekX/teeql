import { Dialect } from "./dialects";
import { ParameterBuilder } from "./parameter-builder";
import { GlueQuery, PartsQuery, SourceQuery } from "./query";

export interface CompiledQuery {
  sql: string;
  params: Record<string, unknown>;
}

export const compile = (
  query: SourceQuery,
  dialect: Dialect,
  parameters: ParameterBuilder
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
  if (query.parts.length === 0) {
    return null;
  }

  const parts = [];
  for (let i = 0; i < query.parts.length; i++) {
    query.parts.push(query.parts[i]);

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
    const compiled = compile(query, dialect, parameters);
    if (compiled) {
      compiledParts.push(compiled.sql);
    }
  }

  const glue = glueQuery.getGlue(dialect);

  if (!glue) {
    return null;
  }

  const compiledGlue = compile(glue, dialect, parameters);

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
  parameterBuilder: ParameterBuilder
): string | null => {
  if (paramValue instanceof SourceQuery) {
    return compile(paramValue, dialect, parameterBuilder)?.sql ?? null;
  }

  if (Array.isArray(paramValue)) {
    const values: string[] = [];

    for (const param of paramValue) {
      let parsed = compileParameter(param, dialect, parameterBuilder);

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

  return dialect.getParameterName(parameterBuilder.toParameter(paramValue));
};
