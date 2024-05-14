import { Dialect } from "./dialects";

export class SourceQuery {}

export class PartsQuery {
  constructor(public readonly parts: string[], public readonly params: any[]) {}
}

export class GlueQuery extends SourceQuery {
  constructor(
    public readonly queries: SourceQuery[],
    public readonly glue: SourceQuery | null = null
  ) {
    super();
  }

  getGlue(_dialect: Dialect) {
    return this.glue;
  }
}

export class AndGlueQuery extends GlueQuery {
  getGlue(dialect: Dialect) {
    return dialect.getAndGlue();
  }
}
export class OrGlueQuery extends GlueQuery {
  getGlue(dialect: Dialect) {
    return dialect.getOrGlue();
  }
}
export class CommaGlueQuery extends GlueQuery {
  getGlue(dialect: Dialect) {
    return dialect.getCommaGlue();
  }
}

export const query = (
  queryParts: TemplateStringsArray,
  ...params: any[]
): PartsQuery => new PartsQuery(queryParts as unknown as string[], params);
