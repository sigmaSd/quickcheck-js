type Arbitrary<T> = () => T;

function quickcheck<T>(
  property: (value: T) => boolean,
  arbitrary: Arbitrary<T>,
  iterations: number = 100,
): void {
  for (let i = 0; i < iterations; i++) {
    const value = arbitrary();
    if (!property(value)) {
      throw new Error(`Property failed for value: ${JSON.stringify(value)}`);
    }
  }
  console.log(`Property passed for ${iterations} iterations.`);
}

// Arbitrary generators for common types
const arbitraryNumber: Arbitrary<number> = () => Math.random() * 100 - 50;
const arbitraryBoolean: Arbitrary<boolean> = () => Math.random() < 0.5;
const arbitraryString: Arbitrary<string> = () =>
  Math.random().toString(36).substring(2);

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
