import { emptyQuery } from "./constants";
import {
  AndGlueQuery,
  CommaGlueQuery,
  GlueQuery,
  OrGlueQuery,
  SourceQuery,
} from "./query";

export const glue = (glue: SourceQuery, queries: SourceQuery[]) =>
  new GlueQuery(queries, glue);

export const glueAnd = (...conditions: SourceQuery[]) =>
  new AndGlueQuery(conditions);

export const glueOr = (...conditions: SourceQuery[]) =>
  new OrGlueQuery(conditions);

export const glueComma = (...conditions: SourceQuery[]) =>
  new CommaGlueQuery(conditions);

type OperatorValue<T> = T | (() => T);

const resolve = <T>(value: OperatorValue<T>) =>
  typeof value === "function" ? (value as () => T)() : value;

export const when = (
  predicate: OperatorValue<boolean>,
  trueQuery: OperatorValue<SourceQuery>,
  falseQuery: OperatorValue<SourceQuery> = emptyQuery
) => {
  if (resolve<boolean>(predicate)) {
    return resolve<SourceQuery>(trueQuery);
  }

  return resolve<SourceQuery>(falseQuery);
};

export const match = (
  ...conditions: [OperatorValue<boolean>, OperatorValue<SourceQuery>][]
): SourceQuery => {
  for (const condition of conditions) {
    if (resolve<boolean>(condition[0])) {
      return resolve<SourceQuery>(condition[1]);
    }
  }

  return emptyQuery;
};