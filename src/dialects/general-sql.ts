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

  /**
   * Sanitize passed string of a table names, column names, etc.
   *
   * In this implementation, this function will REMOVE anything
   * which is not following:
   * - a letter
   * - a number
   * - an underscore
   * - a dot
   *
   * @param name - The name to sanitize.
   * @returns The sanitized name.
   */
  getSanitizedName: (name: string): string => {
    return name.replace(/[^a-zA-Z0-9_\.]/g, "");
  },
};
