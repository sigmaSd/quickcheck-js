import { BinarySearchTree } from "jsr:@std/data-structures";
import { assertEquals } from "jsr:@std/assert";
import {
  arbitraryArray,
  arbitraryNumber,
  arbitraryObject,
  arbitraryString,
  quickcheck,
  quickcheckAsync,
} from "../quickcheck.ts";

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

import { fromFileUrl } from "jsr:@std/path/posix/from-file-url";

Deno.test("fromFileUrl", () => {
  quickcheck(
    (url: string) => {
      assertEquals(fromFileUrl(url), url.replace(/^file:[\/]+/, "/"));
    },
    arbitraryString({
      prefix: "file:///",
      characters: "helloworld_-/",
      minLength: 0,
      maxLength: 100,
    }),
  );
});

import { TarStream, type TarStreamInput } from "jsr:@std/tar/tar-stream";
import { UntarStream } from "jsr:@std/tar/untar-stream";
import { normalize } from "jsr:@std/path";
import { assert } from "jsr:@std/assert";

Deno.test("TarStream and UntarStream", async () => {
  await quickcheckAsync(
    async (file: { path: string; content: string }) => {
      const tarInput: TarStreamInput[] = [{
        type: "file",
        path: file.path,
        size: file.content.length,
        readable: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(file.content));
            controller.close();
          },
        }),
      }];

      const tarBuffer = ReadableStream.from(tarInput)
        .pipeThrough(new TarStream())
        .pipeThrough(new CompressionStream("gzip"));

      const extractedFiles: { path: string; content: string }[] = [];

      for await (
        const entry of new Response(tarBuffer).body!
          .pipeThrough(new DecompressionStream("gzip"))
          .pipeThrough(new UntarStream())
      ) {
        const path = normalize(entry.path);
        const content = await new Response(entry.readable).text();
        extractedFiles.push({ path, content });
      }

      assert(extractedFiles.length === 1);
      const extractedFile = extractedFiles[0];
      assert(extractedFile);
      assertEquals(extractedFile.path, file.path);
      assertEquals(extractedFile.content, file.content);
    },
    arbitraryObject({
      path: arbitraryString({
        characters: "helloworld_-",
      }),
      content: arbitraryString(),
    }),
  );
});
