# QuickCheck

This module provides utilities for property-based testing, including functions
for generating arbitrary values and performing QuickCheck-style tests.

## Examples

**Example 1**

```ts
import { decodeBase64, encodeBase64 } from "jsr:@std/encoding";

const decoder = new TextDecoder();
quickcheck(
  (str: string) => {
    return decoder.decode(decodeBase64(encodeBase64(str))) === str;
  },
  arbitraryString(1, 100),
  1000,
);
```
