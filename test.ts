import { arbitraryArray, arbitraryNumber, quickcheck } from "./quickcheck.ts";

Deno.test("sort", () => {
  // Function to test
  function sort(xs: number[]): number[] {
    return [...xs].sort((a, b) => a - b);
  }

  quickcheck(
    (xs: number[]) => {
      return sort(xs).length === xs.length;
    },
    arbitraryArray(arbitraryNumber, 100),
    1000,
  );
});
