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
