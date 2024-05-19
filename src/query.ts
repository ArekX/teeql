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

import { Dialect } from "./dialects";

export class SourceQuery {}

/**
 * Represents a basic object query contained
 * of parts and parameters.
 */
export class PartsQuery extends SourceQuery {
  constructor(public readonly parts: string[], public readonly params: any[]) {
    super();
  }
}

/**
 * Represents a query that combines multiple source queries using a glue query.
 */
export class GlueQuery extends SourceQuery {
  constructor(
    public readonly queries: SourceQuery[],
    public readonly glue: SourceQuery | null = null
  ) {
    super();
  }

  /**
   * Gets the glue query used to combine the source queries.
   * @param dialect The dialect used for the query.
   * @returns The glue query.
   */
  getGlue(_dialect: Dialect) {
    return this.glue;
  }
}

/**
 * Represents a query that uses the "AND" glue to combine conditions.
 */
export class AndGlueQuery extends GlueQuery {
  /**
   * Gets the "AND" glue for the specified dialect.
   * @param dialect The dialect to get the "AND" glue for.
   * @returns The "AND" glue for the specified dialect.
   */
  getGlue(dialect: Dialect) {
    return dialect.getAndGlue();
  }
}
/**
 * Represents a query that uses the OR glue operator.
 */
export class OrGlueQuery extends GlueQuery {
  /**
   * Gets the glue operator for the specified dialect.
   * @param dialect The dialect to get the glue operator for.
   * @returns The OR glue operator for the specified dialect.
   */
  getGlue(dialect: Dialect) {
    return dialect.getOrGlue();
  }
}
/**
 * Represents a query that uses comma as the glue for joining elements.
 */
export class CommaGlueQuery extends GlueQuery {
  /**
   * Gets the glue for the specified dialect.
   * @param dialect The dialect for which to get the glue.
   * @returns The comma glue for the specified dialect.
   */
  getGlue(dialect: Dialect) {
    return dialect.getCommaGlue();
  }
}

/**
 * Represents a query that uses union glue.
 */
export class UnionGlueQuery extends GlueQuery {
  /**
   * Gets the glue for the specified dialect.
   * @param dialect The dialect to get the glue for.
   * @returns The union glue for the specified dialect.
   */
  getGlue(dialect: Dialect) {
    return dialect.getUnionGlue();
  }
}

/**
 * Creates a new `PartsQuery` instance by combining the query parts and parameters.
 *
 * @param queryParts - The query parts as a `TemplateStringsArray`.
 * @param params - The parameters to be interpolated into the query.
 * @returns A new `PartsQuery` instance.
 */
export const tql = (
  queryParts: TemplateStringsArray,
  ...params: any[]
): PartsQuery => new PartsQuery(queryParts as unknown as string[], params);
