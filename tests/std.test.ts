import { BinarySearchTree } from "jsr:@std/data-structures";
import { assertEquals } from "jsr:@std/assert";
import { arbitraryArray, arbitraryNumber, quickcheck } from "../quickcheck.ts";

Deno.test("BinarySearchTree", () => {
  quickcheck((values: number[]) => {
    const tree = new BinarySearchTree<number>();
    values.forEach((value) => tree.insert(value));

    assertEquals([...tree], values.sort((a, b) => a - b));
    assertEquals(tree.min(), values.length === 0 ? null : Math.min(...values));
    assertEquals(tree.max(), values.length === 0 ? null : Math.max(...values));
    assertEquals(tree.find(Math.max(...values) + 1), null);
    const middleValue = values[Math.floor(values.length / 2)];
    assertEquals(tree.find(middleValue), middleValue ?? null);
    assertEquals(tree.remove(Math.max(...values) + 1), false);
    assertEquals(tree.remove(middleValue), middleValue !== undefined);
    assertEquals(
      [...tree],
      values.filter((v) => v !== middleValue).sort((a, b) => a - b),
    );
  }, arbitraryArray(arbitraryNumber()));
});
