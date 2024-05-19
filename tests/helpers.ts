import { Dialect } from "../src/dialects";

export const createDialect = (overrides?: Partial<Dialect>): Dialect => ({
  getParameterName: jest.fn(),
  toPreparedParameters: jest.fn(),
  glueArray: jest.fn(),
  getCommaGlue: jest.fn(),
  getAndGlue: jest.fn(),
  getOrGlue: jest.fn(),
  getUnionGlue: jest.fn(),
  ...overrides,
});
