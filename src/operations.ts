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

import { emptyQuery } from "./constants";
import {
  AndGlueQuery,
  CommaGlueQuery,
  GlueQuery,
  OrGlueQuery,
  PrependQuery,
  SourceQuery,
  UnionGlueQuery,
} from "./query";

/**
 * Glues together a source query with a custom operator.
 *
 *  Example:
 * ```ts
 * const columnsToInclude = [
 *   tql`id`,
 *   tql`name`,
 *   tql`password`
 * ];
 * const query = compile(tql`
 *   SELECT
 *     ${glue(
 *       tql` ,`,
 *       columnsToInclude
 *     )}
 *   FROM
 *     users
 * `);
 * ```
 *
 * Will return:
 * ```ts
 * {
 *   sql: 'SELECT id, name, password FROM users',
 *   params: {}
 * }
 * ```
 *
 * @param glue - The source query to be used as the glue.
 * @param queries - An array of source queries to be glued together.
 * @returns A new `GlueQuery` object representing the glued queries.
 */
export const glue: (glue: SourceQuery, queries: SourceQuery[]) => GlueQuery = (
  glue: SourceQuery,
  queries: SourceQuery[]
) => new GlueQuery(queries, glue);

/**
 * Glues queries together with an AND operator.
 *
 * @param conditions - The `SourceQuery` conditions to be glued together.
 * @returns A new `AndGlueQuery` instance.
 */
export const glueAnd: (...conditions: SourceQuery[]) => AndGlueQuery = (
  ...conditions: SourceQuery[]
) => new AndGlueQuery(conditions);

/**
 * Glues queries together with an OR operator.
 *
 * @param conditions - The `SourceQuery` conditions to be glued together.
 * @returns A new `AndGlueQuery` instance.
 */
export const glueOr: (...conditions: SourceQuery[]) => OrGlueQuery = (
  ...conditions: SourceQuery[]
) => new OrGlueQuery(conditions);

/**
 * Glues queries together with a comma
 *
 * @param conditions - The `SourceQuery` conditions to be glued together.
 * @returns A new `AndGlueQuery` instance.
 */
export const glueComma: (...conditions: SourceQuery[]) => CommaGlueQuery = (
  ...conditions: SourceQuery[]
) => new CommaGlueQuery(conditions);

/**
 * Glues queries together with an UNION operator.
 *
 * @param conditions - The `SourceQuery` conditions to be glued together.
 * @returns A new `AndGlueQuery` instance.
 */
export const glueUnion: (...conditions: SourceQuery[]) => UnionGlueQuery = (
  ...conditions: SourceQuery[]
) => new UnionGlueQuery(conditions);

export type OperatorValue<T> = T | (() => T);

const resolve = <T>(value: OperatorValue<T>) =>
  typeof value === "function" ? (value as () => T)() : value;

/**
 * Returns a conditional query based on the provided predicate.
 *
 * If the predicate is true the `trueQuery` is returned, otherwise the `falseQuery` is returned.
 *
 * Example:
 *
 * ```ts
 * const productSearch = request.get('search') ?? null;
 * const query = compile(tql`
 *   SELECT id, name FROM product
 *   WHERE
 *     active = 1
 *     ${when(productSearch, tql`AND name LIKE ${`%${productSearch}%`}`)}
 * `);
 * ```
 *
 * This will add `AND LIKE :p_1` (where `:p_1` is the `'%searchTerm%'`') to the compiled
 * query only when productSearch is actually passed in the request.
 *
 * @param predicate - The predicate to evaluate.
 * @param trueQuery - The query to execute if the predicate is true.
 * @param falseQuery - The query to execute if the predicate is false. Defaults to an empty query.
 * @returns Returned query based on the predicate.
 */
export const when: (
  predicate: OperatorValue<boolean>,
  trueQuery: OperatorValue<SourceQuery>,
  falseQuery: OperatorValue<SourceQuery>
) => SourceQuery = (
  predicate: OperatorValue<boolean>,
  trueQuery: OperatorValue<SourceQuery>,
  falseQuery: OperatorValue<SourceQuery> = emptyQuery
) => {
  if (resolve<boolean>(predicate)) {
    return resolve<SourceQuery>(trueQuery);
  }

  return resolve<SourceQuery>(falseQuery);
};

/**
 * Match through provided array of condition, checking first predicate and
 * return a query on the first match.
 *
 * @param conditions - An array of condition-result pairs.
 * @returns The matched SourceQuery.
 */
export const match: (
  ...conditions: [OperatorValue<boolean>, OperatorValue<SourceQuery>][]
) => SourceQuery = (
  ...conditions: [OperatorValue<boolean>, OperatorValue<SourceQuery>][]
): SourceQuery => {
  for (const [predicate, resultValue] of conditions) {
    if (resolve<boolean>(predicate)) {
      return resolve<SourceQuery>(resultValue);
    }
  }

  return emptyQuery;
};

/**
 * Prepends a query to another query.
 *
 * If a query to prepend is empty, this will be a no-op.
 *
 * @param withQuery - The query to prepend to.
 * @param query - The query to be prepended.
 * @returns A new query with the `query` prepended to the `withQuery`.
 */
export const prepend: (
  withQuery: SourceQuery,
  query: SourceQuery
) => PrependQuery = (withQuery: SourceQuery, query: SourceQuery) =>
  new PrependQuery(withQuery, query);
