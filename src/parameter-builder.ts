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

/**
 * Represents a builder for generating parameter names for a query.
 */
export class ParameterBuilder {
  #paramIndex: number = 1;
  #params: Record<string, any> = {};

  /**
   * Generates a parameter name for the given parameter value.
   * If the parameter value already exists, the existing parameter name is returned.
   * Otherwise, a new parameter name is generated and associated with the parameter value.
   * @param parameter - The parameter value.
   * @returns The parameter name.
   */
  toParameter<T>(parameter: T): string {
    for (const [key, value] of Object.entries(this.#params)) {
      if (value === parameter) {
        return key;
      }
    }

    const param = `p_${this.#paramIndex++}`;

    this.#params[param] = parameter;

    return param;
  }

  /**
   * Gets the parameters of the parameter builder.
   * @returns The parameters as a record of string keys and any values.
   */
  get parameters(): Record<string, any> {
    return this.#params;
  }
}
