# QuickCheck

This module provides utilities for property-based testing, including functions
for generating arbitrary values and performing QuickCheck-style tests.

To enable debug output, set the environment variable DEBUG_QUICKCHECK=1.

## Examples

**Example 1**

```ts
import { arbitraryString, quickcheck } from "jsr:@sigma/quickcheck";
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
