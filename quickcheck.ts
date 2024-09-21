/**
 * # QuickCheck
 *
 * This module provides utilities for property-based testing, including
 * functions for generating arbitrary values and performing QuickCheck-style tests.
 *
 * @example
 * ```ts
 * import { decodeBase64, encodeBase64 } from "jsr:@std/encoding";
 *
 * const decoder = new TextDecoder();
 * quickcheck(
 *   (str: string) => {
 *     return decoder.decode(decodeBase64(encodeBase64(str))) === str;
 *   },
 *   arbitraryString(1, 100),
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

const DEBUG_QUICKCHECK = process.env["DEBUG_QUICKCHECK"];

/**
 * Performs property-based testing using the specified property and arbitrary value generator.
 * @param property A function that tests a property on the generated value.
 * @param arbitrary A function that generates arbitrary values.
 * @param iterations The number of test iterations to perform (default: 100).
 */
function quickcheck<T>(
  property: (value: T) => boolean,
  arbitrary: Arbitrary<T>,
  iterations: number = 100,
): void {
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
    if (!property(value)) {
      throw new Error(`Property failed for value: ${JSON.stringify(value)}`);
    }
  }
}

// Arbitrary generators for common types

/**
 * Generates an arbitrary number within the specified range.
 * @param min The minimum value (default: -50).
 * @param max The maximum value (default: 50).
 * @returns An Arbitrary<number> function.
 */
const arbitraryNumber =
  (min: number = -50, max: number = 50): Arbitrary<number> => () =>
    Math.random() * (max - min) + min;

/**
 * Generates an arbitrary boolean value.
 * @returns An Arbitrary<boolean> function.
 */
const arbitraryBoolean = (): Arbitrary<boolean> => () => Math.random() < 0.5;

/**
 * Generates an arbitrary string of specified length range.
 * @param minLength The minimum length of the string (default: 7).
 * @param maxLength The maximum length of the string (default: 100).
 * @returns An Arbitrary<string> function.
 */
const arbitraryString =
  (minLength: number = 7, maxLength: number = 100): Arbitrary<string> => () => {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) +
      minLength;
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  };

/**
 * Generates an arbitrary array of specified element type and maximum length.
 * @param elementArbitrary An Arbitrary function for generating array elements.
 * @param maxLength The maximum length of the array (default: 10).
 * @returns An Arbitrary<T[]> function.
 */
function arbitraryArray<T>(
  elementArbitrary: Arbitrary<T>,
  maxLength: number = 10,
): Arbitrary<T[]> {
  return () => {
    const length = Math.floor(Math.random() * maxLength);
    return Array.from({ length }, elementArbitrary);
  };
}

/**
 * Generates an arbitrary object based on the specified shape.
 * @param shape An object where each key is associated with an Arbitrary function.
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
