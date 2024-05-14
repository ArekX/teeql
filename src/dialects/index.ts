import { ParameterBuilder } from "../parameter-builder";
import { SourceQuery } from "../query";

export interface Dialect {
  getParameterName(paramProperyName: string): string;
  toPreparedParameters(builder: ParameterBuilder): Record<string, any>;
  glueArray(items: string[]): string;
  getCommaGlue(): SourceQuery;
  getAndGlue(): SourceQuery;
  getOrGlue(): SourceQuery;
  getUnionGlue(): SourceQuery;
}

export * from "./general-sql";
