export class ParameterBuilder {
  #paramIndex: number = 1;
  #params: Record<string, any> = {};

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

  get parameters(): Record<string, any> {
    return this.#params;
  }
}
