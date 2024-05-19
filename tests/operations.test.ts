import {
  glue,
  glueAnd,
  glueOr,
  glueComma,
  glueUnion,
  when,
  match,
  OperatorValue,
} from "../src/operations";
import {
  GlueQuery,
  AndGlueQuery,
  OrGlueQuery,
  CommaGlueQuery,
  UnionGlueQuery,
  SourceQuery,
} from "../src/query";
import { emptyQuery } from "../src/constants";

describe("operations", () => {
  describe("glue", () => {
    it("should return a GlueQuery instance", () => {
      const queries = [new SourceQuery(), new SourceQuery()];
      const result = glue(new SourceQuery(), queries);
      expect(result).toBeInstanceOf(GlueQuery);
      expect(result.queries).toEqual(queries);
      expect(result.glue).toEqual(new SourceQuery());
    });
  });

  describe("glueAnd", () => {
    it("should return an AndGlueQuery instance", () => {
      const conditions = [new SourceQuery(), new SourceQuery()];
      const result = glueAnd(...conditions);
      expect(result).toBeInstanceOf(AndGlueQuery);
      expect(result.queries).toEqual(conditions);
    });
  });

  describe("glueOr", () => {
    it("should return an OrGlueQuery instance", () => {
      const conditions = [new SourceQuery(), new SourceQuery()];
      const result = glueOr(...conditions);
      expect(result).toBeInstanceOf(OrGlueQuery);
      expect(result.queries).toEqual(conditions);
    });
  });

  describe("glueComma", () => {
    it("should return a CommaGlueQuery instance", () => {
      const conditions = [new SourceQuery(), new SourceQuery()];
      const result = glueComma(...conditions);
      expect(result).toBeInstanceOf(CommaGlueQuery);
      expect(result.queries).toEqual(conditions);
    });
  });

  describe("glueUnion", () => {
    it("should return a UnionGlueQuery instance", () => {
      const conditions = [new SourceQuery(), new SourceQuery()];
      const result = glueUnion(...conditions);
      expect(result).toBeInstanceOf(UnionGlueQuery);
      expect(result.queries).toEqual(conditions);
    });
  });

  describe("when", () => {
    it("should accept callbacks", () => {
      const trueQuery = new SourceQuery();
      const falseQuery = new SourceQuery();
      const result = when(
        () => true,
        () => trueQuery,
        () => falseQuery
      );
      expect(result).toEqual(trueQuery);
    });

    it("should return trueQuery if predicate is true", () => {
      const trueQuery = new SourceQuery();
      const falseQuery = new SourceQuery();
      const result = when(true, trueQuery, falseQuery);
      expect(result).toEqual(trueQuery);
    });

    it("should return falseQuery if predicate is false", () => {
      const trueQuery = new SourceQuery();
      const falseQuery = new SourceQuery();
      const result = when(false, trueQuery, falseQuery);
      expect(result).toEqual(falseQuery);
    });

    it("should return emptyQuery if falseQuery is not provided", () => {
      const trueQuery = new SourceQuery();
      const result = when(false, trueQuery);
      expect(result).toEqual(emptyQuery);
    });
  });

  describe("match", () => {
    it("should return the first resultValue that matches the predicate", () => {
      const conditions: [OperatorValue<boolean>, OperatorValue<SourceQuery>][] =
        [
          [true, new SourceQuery()],
          [false, new SourceQuery()],
          [true, new SourceQuery()],
        ];
      const result = match(...conditions);
      expect(result).toEqual(conditions[0][1]);
    });

    it("should return emptyQuery if no condition matches", () => {
      const conditions: [OperatorValue<boolean>, OperatorValue<SourceQuery>][] =
        [
          [false, new SourceQuery()],
          [false, new SourceQuery()],
          [false, new SourceQuery()],
        ];
      const result = match(...conditions);
      expect(result).toEqual(emptyQuery);
    });

    it("should accept callbacks", () => {
      const expectedValue = new SourceQuery();
      const conditions: [OperatorValue<boolean>, OperatorValue<SourceQuery>][] =
        [
          [false, () => new SourceQuery()],
          [() => true, expectedValue],
          [() => false, () => new SourceQuery()],
        ];
      const result = match(...conditions);
      expect(result).toEqual(expectedValue);
    });
  });
});
