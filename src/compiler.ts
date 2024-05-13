import { commaGlue, emptyQuery } from "../query-builder";
import { ParameterBuilder } from "./parameter-builder";
import { Query } from "./query";

export interface CompiledQuery {
  sql: string;
  params: Record<string, unknown>;
}

export const compile = (
  query: Query,
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

    const value = parseParameter(query.params[i], parameters);

    if (value === null) {
      continue;
    }

    parts.push(value);
  }

  return {
    sql: parts.join(""),
    params: parameters.parameters,
  };
};

const parseParameter = (
  paramValue: any,
  parameterBuilder: ParameterBuilder
): string | CompiledQuery | null => {
  if (paramValue instanceof Query) {
    return compile(paramValue, parameterBuilder);
  }

  if (Array.isArray(paramValue)) {
    // return compile(toArrayQuery(paramValue), parameterBuilder);
  }

  return ":" + parameterBuilder.toParameter(paramValue);
};
