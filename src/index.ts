const world = "world";

export type IDemo = "niis";

export function hello(who: string = world): string {
  return `Hello ${who}! `;
}
