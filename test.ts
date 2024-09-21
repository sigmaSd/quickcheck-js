import {
  arbitraryArray,
  arbitraryBoolean,
  arbitraryNumber,
  arbitraryObject,
  arbitraryString,
  quickcheck,
} from "./quickcheck.ts";

Deno.test("sort", () => {
  // Function to test
  function sort(xs: number[]): number[] {
    return [...xs].sort((a, b) => a - b);
  }

  quickcheck(
    (xs: number[]) => {
      return sort(xs).length === xs.length;
    },
    arbitraryArray(arbitraryNumber(), 100),
    1000,
  );
});

Deno.test("arbitrary class", () => {
  // deno-lint-ignore no-unused-vars
  class Person {
    constructor(public name: string, public age: number) {}
  }

  quickcheck(
    (person: Person) => {
      return person.name.length > 0 && person.age >= 0 && person.age < 100;
    },
    arbitraryObject({
      name: arbitraryString(),
      age: arbitraryNumber(0, 100),
    }),
    1000,
  );
});

Deno.test("arbitrary object", () => {
  quickcheck(
    (obj: { id: number; value: string; isValid: boolean }) => {
      return obj.id === 0;
    },
    arbitraryObject({
      id: () => 0,
      value: arbitraryString(),
      isValid: arbitraryBoolean(),
    }),
    1000,
  );
});

import { decodeBase64, encodeBase64 } from "jsr:@std/encoding";
Deno.test("std", () => {
  const decoder = new TextDecoder();
  quickcheck(
    (str: string) => {
      return decoder.decode(decodeBase64(encodeBase64(str))) === str;
    },
    arbitraryString(1, 100),
    100_000,
  );
});
