type Arbitrary<T> = () => T;

const DEBUG_QUICKCHECK = Deno.env.get("DEBUG_QUICKCHECK");
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
const arbitraryNumber =
  (min: number = -50, max: number = 50): Arbitrary<number> => () =>
    Math.random() * (max - min) + min;

const arbitraryBoolean = (): Arbitrary<boolean> => () => Math.random() < 0.5;

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

function arbitraryArray<T>(
  elementArbitrary: Arbitrary<T>,
  maxLength: number = 10,
): Arbitrary<T[]> {
  return () => {
    const length = Math.floor(Math.random() * maxLength);
    return Array.from({ length }, elementArbitrary);
  };
}

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
