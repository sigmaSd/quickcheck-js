/**
 * # QuickCheck
 *
 * This module provides utilities for property-based testing, including
 * functions for generating arbitrary values and performing QuickCheck-style tests.
 *
 * To enable debug output, set the environment variable DEBUG_QUICKCHECK=1. (needs env permission in Deno)
 *
 * @example
 * ```ts
 * import { arbitraryString, quickcheck } from "jsr:@sigma/quickcheck";
 * import { decodeBase64, encodeBase64 } from "jsr:@std/encoding";
 *
 * const decoder = new TextDecoder();
 * quickcheck(
 *   (str: string) => {
 *     return decoder.decode(decodeBase64(encodeBase64(str))) === str;
 *   },
 *   arbitraryString({ minLength: 1, maxLength: 100 }),
 *   1000,
 * );
 * ```
 *
 * @module
 */

import process from "node:process";

/**
 * Type representing a function that generates arbitrary values of type T.
 */
type Arbitrary<T> = () => T;

let DEBUG_QUICKCHECK = false;
if (globalThis.Deno) {
  if (
    Deno.permissions.querySync({ name: "env", variable: "DEBUG_QUICKCHECK" })
      .state === "granted"
  ) {
    // only check for DEBUG_QUICKCHECK if the user has granted env permission
    DEBUG_QUICKCHECK = Boolean(process.env["DEBUG_QUICKCHECK"]);
  }
} else {
  DEBUG_QUICKCHECK = Boolean(process.env["DEBUG_QUICKCHECK"]);
}

/**
 * Performs property-based testing using the specified property and arbitrary value generator.
 * @param property A function that tests a property on the generated value.
 * @param arbitrary A function that generates arbitrary values.
 * @param iterations The number of test iterations to perform (default: 100).
 */
async function quickcheck<T>(
  property: (value: T) => boolean | void | Promise<boolean | void>,
  arbitrary: Arbitrary<T>,
  iterations: number = 100,
) {
  async function run() {
    for (let i = 0; i < iterations; i++) {
      const value = arbitrary();
      if (DEBUG_QUICKCHECK) {
        console.error(
          `Iteration ${i + 1}/${iterations}: ${
            JSON.stringify(value).slice(0, 20) +
            (JSON.stringify(value).length > 20 ? "..." : "")
          }`,
        );
      }
      try {
        if (await property(value) === false) {
          throw new Error(
            `Property failed for value: ${JSON.stringify(value)}`,
          );
        }
      } catch (e) {
        throw new Error(
          `Property failed for value: ${JSON.stringify(value)}\n${
            (e as Error).stack
          }`,
        );
      }
    }
  }
  await run();
}

// Arbitrary generators for common types

/**
 * Generates an arbitrary number within the specified range.
 * @param options An object with optional min and max properties.
 * @returns An Arbitrary<number> function.
 */
const arbitraryNumber = (
  options: { min?: number; max?: number } = {},
): Arbitrary<number> =>
() => {
  const { min = -50, max = 50 } = options;
  return Math.random() * (max - min) + min;
};

/**
 * Generates an arbitrary boolean value.
 * @param options An optional object (currently unused).
 * @returns An Arbitrary<boolean> function.
 */
const arbitraryBoolean = (): Arbitrary<boolean> => () => Math.random() < 0.5;

/**
 * Generates an arbitrary string of specified length range.
 * @param options An object with optional properties for string generation.
 * @returns An Arbitrary<string> function.
 */
const arbitraryString = (
  options: {
    minLength?: number;
    maxLength?: number;
    characters?: string;
    prefix?: string;
  } = {},
): Arbitrary<string> =>
() => {
  const {
    minLength = 7,
    maxLength = 100,
    characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?`~ ",
    prefix = "",
  } = options;

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) +
    minLength;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return prefix + result;
};

/**
 * Generates an arbitrary array of specified element type and maximum length.
 * @param elementArbitrary An Arbitrary function for generating array elements.
 * @param options An object with optional maxLength property.
 * @returns An Arbitrary<T[]> function.
 */
function arbitraryArray<T>(
  elementArbitrary: Arbitrary<T>,
  options: { maxLength?: number } = {},
): Arbitrary<T[]> {
  return () => {
    const { maxLength = 10 } = options;
    const length = Math.floor(Math.random() * maxLength);
    return Array.from({ length }, elementArbitrary);
  };
}

/**
 * Generates an arbitrary object based on the specified shape.
 * @param shape An object where each key is associated with an Arbitrary function.
 * @param options An optional object (currently unused).
 * @returns An Arbitrary<T> function that generates objects of type T.
 */
function arbitraryObject<T extends object>(
  shape: { [K in keyof T]: Arbitrary<T[K]> },
): Arbitrary<T> {
  return () => {
    const result: Partial<T> = {};
    for (const key in shape) {
      result[key] = shape[key]();
    }
    return result as T;
  };
}

export {
  type Arbitrary,
  arbitraryArray,
  arbitraryBoolean,
  arbitraryNumber,
  arbitraryObject,
  arbitraryString,
  quickcheck,
};
