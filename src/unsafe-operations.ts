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

import { UnsafeNameQuery, PartsQuery } from "./query";

/**
 * Returns a raw query without any safety checks.
 *
 * IMPORTANT: Please note that SQL injection is possible here if
 * you pass ANY kind of user input into this function.
 *
 * @param unsafeRawQuery - The raw query string to execute.
 * @returns A new `PartsQuery` instance with the raw query.
 */
export const unsafeRaw = (unsafeRawQuery: string) =>
  new PartsQuery([unsafeRawQuery], []);

/**
 * Returns a query part which represents a name of a table, column, etc.
 *
 * Name is used to represent a name of a table, column or any other database object
 * in the query. This name will be sanitized by the SQL dialect when compiled.
 *
 * Check the dialects documentation for more information on how names are sanitized.
 *
 * IMPORTANT: While this IS relatively safe operation, SQL injection is still possible in
 * a form that if user input is passed into this function, it can be used to set
 * a name you might not want to be used in the query. Always make sure not to pass
 * user input into this function.
 *
 * @param name - The name to be used in the NameQuery.
 * @returns A new NameQuery object.
 */
export const unsafeName = (name: string) => new UnsafeNameQuery(name);
