import { Dialect } from ".";
import { ParameterBuilder } from "../parameter-builder";
import { tql } from "../query";

const commaGlue = tql`, `;
const andGlue = tql` AND `;
const orGlue = tql` OR `;
const unionGlue = tql` UNION `;

/**
 * Represents a general SQL dialect.
 */
export const generalSqlDialect: Dialect = {
  /**
   * Returns the parameter name for the given property name.
   * @param paramProperyName - The property name.
   * @returns The parameter name.
   */
  getParameterName: (paramProperyName: string): string =>
    `:${paramProperyName}`,

  /**
   * Glues an array of strings together using a comma separator.
   * @param items - The array of strings to glue together.
   * @returns The glued string.
   */
  glueArray: (items: string[]): string => items.join(", "),

  /**
   * Converts the builder's parameters to a record of prepared parameters.
   * @param builder - The parameter builder.
   * @returns The record of prepared parameters.
   */
  toPreparedParameters: (builder: ParameterBuilder): Record<string, any> =>
    builder.parameters,

  /**
   * Returns the glue string for joining items with a comma.
   * @returns The comma glue string.
   */
  getCommaGlue: () => commaGlue,

  /**
   * Returns the glue string for joining items with "AND".
   * @returns The "AND" glue string.
   */
  getAndGlue: () => andGlue,

  /**
   * Returns the glue string for joining items with "OR".
   * @returns The "OR" glue string.
   */
  getOrGlue: () => orGlue,

  /**
   * Returns the glue string for joining items with "UNION".
   * @returns The "UNION" glue string.
   */
  getUnionGlue: () => unionGlue,
};
