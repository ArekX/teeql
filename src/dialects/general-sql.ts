import { Dialect } from ".";
import { ParameterBuilder } from "../parameter-builder";
import { query } from "../query";

const commaGlue = query`, `;
const andGlue = query` AND `;
const orGlue = query` OR `;

export const generalSqlDialect: Dialect = {
  getParameterName: (paramProperyName: string): string =>
    `:${paramProperyName}`,
  glueArray: (items: string[]): string => items.join(", "),
  toPreparedParameters: (builder: ParameterBuilder): Record<string, any> =>
    builder.parameters,
  getCommaGlue: () => commaGlue,
  getAndGlue: () => andGlue,
  getOrGlue: () => orGlue,
};
