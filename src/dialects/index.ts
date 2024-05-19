import { ParameterBuilder } from "../parameter-builder";
import { SourceQuery } from "../query";

/**
 * Represents a dialect for a specific database engine.
 */
export interface Dialect {
  /**
   * Gets the parameter name for a given parameter property name.
   * @param paramProperyName - The name of the parameter property.
   * @returns The parameter name.
   */
  getParameterName(paramProperyName: string): string;

  /**
   * Converts the builder's parameters to a record of prepared parameters.
   * @param builder - The parameter builder.
   * @returns The record of prepared parameters.
   */
  toPreparedParameters(builder: ParameterBuilder): Record<string, any>;

  /**
   * Glues an array of items together into a single string.
   * @param items - The array of items to glue.
   * @returns The glued string.
   */
  glueArray(items: string[]): string;

  /**
   * Gets the glue for joining items with a comma.
   * @returns The comma glue.
   */
  getCommaGlue(): SourceQuery;

  /**
   * Gets the glue for joining items with "AND".
   * @returns The "AND" glue.
   */
  getAndGlue(): SourceQuery;

  /**
   * Gets the glue for joining items with "OR".
   * @returns The "OR" glue.
   */
  getOrGlue(): SourceQuery;

  /**
   * Gets the glue for joining items with "UNION".
   * @returns The "UNION" glue.
   */
  getUnionGlue(): SourceQuery;
}

export * from "./general-sql";
