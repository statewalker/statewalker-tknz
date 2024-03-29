import {
  type TToken,
  type TTokenizerMethod,
  TokenizerContext,
  isEol,
  isSpace,
  isSpaceOrEol,
  newBlockReader,
  newCharsReader,
  newCompositeTokenizer,
  newDynamicFencedBlockReader,
  newFencedBlockReader,
} from "../../src/base/index.ts";
import { readHtmlName } from "../../src/html/names.ts";
import { describe, expect, it } from "../deps.ts";

function readCodeStart(ctx: TokenizerContext): TToken | undefined {
  if (ctx.getChar(+0) !== "$" || ctx.getChar(+1) !== "{") return;
  const start = ctx.i;
  ctx.i += 2;
  const end = ctx.i;
  return {
    type: "CodeStart",
    start,
    end,
    value: ctx.substring(start, end),
  };
}

function readCodeEnd(ctx: TokenizerContext): TToken | undefined {
  if (ctx.getChar() !== "}") return;
  const start = ctx.i;
  ctx.i++;
  const end = ctx.i;
  return {
    type: "CodeEnd",
    start,
    end,
    value: ctx.substring(start, end),
  };
}

function readTagStart(ctx: TokenizerContext): TToken | undefined {
  return ctx.guard(() => {
    const start = ctx.i;
    if (ctx.getChar(+0) !== "<") return;
    ctx.i++;
    const nameToken = readHtmlName(ctx);
    if (!nameToken) return;
    ctx.skipWhile(isSpaceOrEol);
    if (ctx.getChar() !== ">") return;
    ctx.i++;
    const end = ctx.i;
    return {
      type: "TagStart",
      start,
      end,
      value: ctx.substring(start, end),
    };
  });
}

function readTagEnd(ctx: TokenizerContext): TToken | undefined {
  return ctx.guard(() => {
    const start = ctx.i;
    if (ctx.getChar(+0) !== "<" || ctx.getChar(+1) !== "/") return;
    ctx.i += 2;
    const nameToken = readHtmlName(ctx);
    if (!nameToken) return;
    ctx.skipWhile(isSpaceOrEol);
    if (ctx.getChar() !== ">") return;
    ctx.i++;
    const end = ctx.i;
    return {
      type: "TagEnd",
      start,
      end,
      value: ctx.substring(start, end),
    };
  });
}
function test(
  readToken: TTokenizerMethod,
  str: string,
  control: Record<string, any>
) {
  const ctx = new TokenizerContext(str);
  const result = readToken(ctx);
  try {
    expect(result !== undefined).toEqual(true);
    const token: TToken = result as TToken;
    expect(token).to.eql(control);
    expect(token.start).toEqual(0);
    expect(token.value).toEqual(str.substring(token.start, token.end));
  } catch (error) {
    console.log(JSON.stringify(result));
    // console.log(JSON.stringify(result, null, 2));
    throw error;
  }
}

describe("TokenizerContext", () => {
  it("should tokenize a list of words", () => {
    const readToken = newBlockReader(
      "Text",
      newCompositeTokenizer([
        newCharsReader("Word", (char) => !!char.match(/\w/u)),
        newCharsReader("Punctuation", (char) => !!char.match(/\p{P}/u)),
      ])
    );
    test(readToken, "hello world", {
      type: "Text",
      start: 0,
      end: 11,
      value: "hello world",
      children: [
        { type: "Word", start: 0, end: 5, value: "hello" },
        { type: "Word", start: 6, end: 11, value: "world" },
      ],
    });
    test(readToken, "hello - world!", {
      type: "Text",
      start: 0,
      end: 14,
      value: "hello - world!",
      children: [
        { type: "Word", start: 0, end: 5, value: "hello" },
        { type: "Punctuation", start: 6, end: 7, value: "-" },
        { type: "Word", start: 8, end: 13, value: "world" },
        { type: "Punctuation", start: 13, end: 14, value: "!" },
      ],
    });
  });

  function newReaderWithCodeBlocks() {
    const list: TTokenizerMethod[] = [
      newCharsReader("Word", (char) => !!char.match(/\w/u)),
    ];
    const compositeReader = newCompositeTokenizer(list);
    const readToken = newBlockReader("Text", compositeReader);
    const readFencedBlock = newFencedBlockReader(
      "FencedBlock",
      readCodeStart,
      readToken,
      readCodeEnd
    );
    list.unshift(readFencedBlock);
    return readToken;
  }

  it("should tokenize fenced blocks", () => {
    const readToken = newReaderWithCodeBlocks();
    test(readToken, "hello ${wonderful} world", {
      type: "Text",
      start: 0,
      end: 24,
      value: "hello ${wonderful} world",
      children: [
        { type: "Word", start: 0, end: 5, value: "hello" },
        {
          type: "FencedBlock",
          start: 6,
          end: 18,
          value: "${wonderful}",
          children: [
            { type: "CodeStart", start: 6, end: 8, value: "${" },
            {
              type: "Text",
              start: 8,
              end: 17,
              value: "wonderful",
              children: [
                { type: "Word", start: 8, end: 17, value: "wonderful" },
              ],
            },
            { type: "CodeEnd", start: 17, end: 18, value: "}" },
          ],
        },
        { type: "Word", start: 19, end: 24, value: "world" },
      ],
    });
  });

  it("should tokenize embedded fenced blocks", () => {
    const readToken = newReaderWithCodeBlocks();
    test(readToken, "before ${A ${B} C} after", {
      type: "Text",
      start: 0,
      end: 24,
      value: "before ${A ${B} C} after",
      children: [
        { type: "Word", start: 0, end: 6, value: "before" },
        {
          type: "FencedBlock",
          start: 7,
          end: 18,
          value: "${A ${B} C}",
          children: [
            { type: "CodeStart", start: 7, end: 9, value: "${" },
            {
              type: "Text",
              start: 9,
              end: 17,
              value: "A ${B} C",
              children: [
                { type: "Word", start: 9, end: 10, value: "A" },
                {
                  type: "FencedBlock",
                  start: 11,
                  end: 15,
                  value: "${B}",
                  children: [
                    {
                      type: "CodeStart",
                      start: 11,
                      end: 13,
                      value: "${",
                    },
                    {
                      type: "Text",
                      start: 13,
                      end: 14,
                      value: "B",
                      children: [
                        { type: "Word", start: 13, end: 14, value: "B" },
                      ],
                    },
                    { type: "CodeEnd", start: 14, end: 15, value: "}" },
                  ],
                },
                { type: "Word", start: 16, end: 17, value: "C" },
              ],
            },
            { type: "CodeEnd", start: 17, end: 18, value: "}" },
          ],
        },
        { type: "Word", start: 19, end: 24, value: "after" },
      ],
    });
  });

  function newReaderWithMixedFencedBlocks() {
    const list: TTokenizerMethod[] = [
      newCharsReader("Word", (char) => !!char.match(/\w/u)),
    ];
    const compositeReader = newCompositeTokenizer(list);
    const readToken = newBlockReader("Text", compositeReader);
    list.unshift(
      newFencedBlockReader("Code", readCodeStart, readToken, readCodeEnd)
    );
    list.unshift(
      newFencedBlockReader("Tag", readTagStart, readToken, readTagEnd)
    );
    return readToken;
  }

  it("should tokenize heterogenious fenced blocks", () => {
    const readToken = newReaderWithMixedFencedBlocks();
    test(readToken, "${before} <code> A ${B} C </code> ${after}", {
      type: "Text",
      start: 0,
      end: 42,
      value: "${before} <code> A ${B} C </code> ${after}",
      children: [
        {
          type: "Code",
          start: 0,
          end: 9,
          value: "${before}",
          children: [
            { type: "CodeStart", start: 0, end: 2, value: "${" },
            {
              type: "Text",
              start: 2,
              end: 8,
              value: "before",
              children: [{ type: "Word", start: 2, end: 8, value: "before" }],
            },
            { type: "CodeEnd", start: 8, end: 9, value: "}" },
          ],
        },
        {
          type: "Tag",
          start: 10,
          end: 33,
          value: "<code> A ${B} C </code>",
          children: [
            { type: "TagStart", start: 10, end: 16, value: "<code>" },
            {
              type: "Text",
              start: 16,
              end: 26,
              value: " A ${B} C ",
              children: [
                { type: "Word", start: 17, end: 18, value: "A" },
                {
                  type: "Code",
                  start: 19,
                  end: 23,
                  value: "${B}",
                  children: [
                    {
                      type: "CodeStart",
                      start: 19,
                      end: 21,
                      value: "${",
                    },
                    {
                      type: "Text",
                      start: 21,
                      end: 22,
                      value: "B",
                      children: [
                        { type: "Word", start: 21, end: 22, value: "B" },
                      ],
                    },
                    { type: "CodeEnd", start: 22, end: 23, value: "}" },
                  ],
                },
                { type: "Word", start: 24, end: 25, value: "C" },
              ],
            },
            { type: "TagEnd", start: 26, end: 33, value: "</code>" },
          ],
        },
        {
          type: "Code",
          start: 34,
          end: 42,
          value: "${after}",
          children: [
            { type: "CodeStart", start: 34, end: 36, value: "${" },
            {
              type: "Text",
              start: 36,
              end: 41,
              value: "after",
              children: [{ type: "Word", start: 36, end: 41, value: "after" }],
            },
            { type: "CodeEnd", start: 41, end: 42, value: "}" },
          ],
        },
      ],
    });
  });

  it("should tokenize broken heterogenious fenced blocks", () => {
    const readToken = newReaderWithMixedFencedBlocks();
    test(readToken, "${before} <code> A ${B C </code> ${after}", {
      type: "Text",
      start: 0,
      end: 41,
      value: "${before} <code> A ${B C </code> ${after}",
      children: [
        {
          type: "Code",
          start: 0,
          end: 9,
          value: "${before}",
          children: [
            { type: "CodeStart", start: 0, end: 2, value: "${" },
            {
              type: "Text",
              start: 2,
              end: 8,
              value: "before",
              children: [{ type: "Word", start: 2, end: 8, value: "before" }],
            },
            { type: "CodeEnd", start: 8, end: 9, value: "}" },
          ],
        },
        {
          type: "Tag",
          start: 10,
          end: 32,
          value: "<code> A ${B C </code>",
          children: [
            { type: "TagStart", start: 10, end: 16, value: "<code>" },
            {
              type: "Text",
              start: 16,
              end: 25,
              value: " A ${B C ",
              children: [
                { type: "Word", start: 17, end: 18, value: "A" },
                {
                  type: "Code",
                  start: 19,
                  end: 25,
                  value: "${B C ",
                  children: [
                    {
                      type: "CodeStart",
                      start: 19,
                      end: 21,
                      value: "${",
                    },
                    {
                      type: "Text",
                      start: 21,
                      end: 25,
                      value: "B C ",
                      children: [
                        { type: "Word", start: 21, end: 22, value: "B" },
                        { type: "Word", start: 23, end: 24, value: "C" },
                      ],
                    },
                  ],
                },
              ],
            },
            { type: "TagEnd", start: 25, end: 32, value: "</code>" },
          ],
        },
        {
          type: "Code",
          start: 33,
          end: 41,
          value: "${after}",
          children: [
            { type: "CodeStart", start: 33, end: 35, value: "${" },
            {
              type: "Text",
              start: 35,
              end: 40,
              value: "after",
              children: [{ type: "Word", start: 35, end: 40, value: "after" }],
            },
            { type: "CodeEnd", start: 40, end: 41, value: "}" },
          ],
        },
      ],
    });
  });

  it("should tokenize broken heterogenious fenced blocks - 2", () => {
    const readToken = newReaderWithMixedFencedBlocks();
    test(readToken, "before ${X <code> A ${B <code>C</code> } </code> ", {
      type: "Text",
      start: 0,
      end: 49,
      value: "before ${X <code> A ${B <code>C</code> } </code> ",
      children: [
        { type: "Word", start: 0, end: 6, value: "before" },
        {
          type: "Code",
          start: 7,
          end: 49,
          value: "${X <code> A ${B <code>C</code> } </code> ",
          children: [
            { type: "CodeStart", start: 7, end: 9, value: "${" },
            {
              type: "Text",
              start: 9,
              end: 49,
              value: "X <code> A ${B <code>C</code> } </code> ",
              children: [
                { type: "Word", start: 9, end: 10, value: "X" },
                {
                  type: "Tag",
                  start: 11,
                  end: 48,
                  value: "<code> A ${B <code>C</code> } </code>",
                  children: [
                    {
                      type: "TagStart",
                      start: 11,
                      end: 17,
                      value: "<code>",
                    },
                    {
                      type: "Text",
                      start: 17,
                      end: 41,
                      value: " A ${B <code>C</code> } ",
                      children: [
                        { type: "Word", start: 18, end: 19, value: "A" },
                        {
                          type: "Code",
                          start: 20,
                          end: 40,
                          value: "${B <code>C</code> }",
                          children: [
                            {
                              type: "CodeStart",
                              start: 20,
                              end: 22,
                              value: "${",
                            },
                            {
                              type: "Text",
                              start: 22,
                              end: 39,
                              value: "B <code>C</code> ",
                              children: [
                                {
                                  type: "Word",
                                  start: 22,
                                  end: 23,
                                  value: "B",
                                },
                                {
                                  type: "Tag",
                                  start: 24,
                                  end: 38,
                                  value: "<code>C</code>",
                                  children: [
                                    {
                                      type: "TagStart",
                                      start: 24,
                                      end: 30,
                                      value: "<code>",
                                    },
                                    {
                                      type: "Text",
                                      start: 30,
                                      end: 31,
                                      value: "C",
                                      children: [
                                        {
                                          type: "Word",
                                          start: 30,
                                          end: 31,
                                          value: "C",
                                        },
                                      ],
                                    },
                                    {
                                      type: "TagEnd",
                                      start: 31,
                                      end: 38,
                                      value: "</code>",
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              type: "CodeEnd",
                              start: 39,
                              end: 40,
                              value: "}",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "TagEnd",
                      start: 41,
                      end: 48,
                      value: "</code>",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("should tokenize properly blocks with the same opening and closing patterns", () => {
    function readJsFence(ctx: TokenizerContext): TToken | undefined {
      if (
        ctx.getChar(+0) !== "`" ||
        ctx.getChar(+1) !== "`" ||
        ctx.getChar(+2) !== "`"
      )
        return;
      const start = ctx.i;
      ctx.i += 3;
      const end = ctx.i;
      return {
        type: "JsFence",
        start,
        end,
        value: ctx.substring(start, end),
      };
    }

    function newReader() {
      const list: TTokenizerMethod[] = [
        newCharsReader("Word", (char) => !!char.match(/\w/u)),
      ];
      const compositeReader = newCompositeTokenizer(list);
      const readToken = newBlockReader("Content", compositeReader);
      list.unshift(
        newFencedBlockReader("JsCode", readJsFence, readToken, readJsFence)
      );
      return readToken;
    }

    test(
      newReader(),
      `
before 
\`\`\`
First Js Block
\`\`\`
between
\`\`\`
Second Js Block
\`\`\`
after
`,
      {
        type: "Content",
        start: 0,
        end: 70,
        value:
          "\nbefore \n```\nFirst Js Block\n```\nbetween\n```\nSecond Js Block\n```\nafter\n",
        children: [
          { type: "Word", start: 1, end: 7, value: "before" },
          {
            type: "JsCode",
            start: 9,
            end: 31,
            value: "```\nFirst Js Block\n```",
            children: [
              { type: "JsFence", start: 9, end: 12, value: "```" },
              {
                type: "Content",
                start: 12,
                end: 28,
                value: "\nFirst Js Block\n",
                children: [
                  { type: "Word", start: 13, end: 18, value: "First" },
                  { type: "Word", start: 19, end: 21, value: "Js" },
                  { type: "Word", start: 22, end: 27, value: "Block" },
                ],
              },
              { type: "JsFence", start: 28, end: 31, value: "```" },
            ],
          },
          { type: "Word", start: 32, end: 39, value: "between" },
          {
            type: "JsCode",
            start: 40,
            end: 63,
            value: "```\nSecond Js Block\n```",
            children: [
              { type: "JsFence", start: 40, end: 43, value: "```" },
              {
                type: "Content",
                start: 43,
                end: 60,
                value: "\nSecond Js Block\n",
                children: [
                  { type: "Word", start: 44, end: 50, value: "Second" },
                  { type: "Word", start: 51, end: 53, value: "Js" },
                  { type: "Word", start: 54, end: 59, value: "Block" },
                ],
              },
              { type: "JsFence", start: 60, end: 63, value: "```" },
            ],
          },
          { type: "Word", start: 64, end: 69, value: "after" },
        ],
      }
    );
  });
  it("should tokenize blocks with the same opening and closing patterns (simple version)", () => {
    function readJsFence(ctx: TokenizerContext): TToken | undefined {
      if (
        ctx.getChar(+0) !== "`" ||
        ctx.getChar(+1) !== "`" ||
        ctx.getChar(+2) !== "`"
      )
        return;
      const start = ctx.i;
      ctx.i += 3;
      const end = ctx.i;
      return {
        type: "JsFence",
        start,
        end,
        value: ctx.substring(start, end),
      };
    }

    function newReader() {
      const list: TTokenizerMethod[] = [];
      const compositeReader = newCompositeTokenizer(list);
      const readToken = newBlockReader("Content", compositeReader);
      list.unshift(
        newFencedBlockReader("JsCode", readJsFence, readToken, readJsFence)
      );
      return readToken;
    }

    test(
      newReader(),
      `
before 
\`\`\`
First Js Block
\`\`\`
between
\`\`\`
Second Js Block
\`\`\`
after
`,
      {
        type: "Content",
        start: 0,
        end: 70,
        value:
          "\nbefore \n```\nFirst Js Block\n```\nbetween\n```\nSecond Js Block\n```\nafter\n",
        children: [
          {
            type: "JsCode",
            start: 9,
            end: 31,
            value: "```\nFirst Js Block\n```",
            children: [
              { type: "JsFence", start: 9, end: 12, value: "```" },
              {
                type: "Content",
                start: 12,
                end: 28,
                value: "\nFirst Js Block\n",
              },
              { type: "JsFence", start: 28, end: 31, value: "```" },
            ],
          },
          {
            type: "JsCode",
            start: 40,
            end: 63,
            value: "```\nSecond Js Block\n```",
            children: [
              { type: "JsFence", start: 40, end: 43, value: "```" },
              {
                type: "Content",
                start: 43,
                end: 60,
                value: "\nSecond Js Block\n",
              },
              { type: "JsFence", start: 60, end: 63, value: "```" },
            ],
          },
        ],
      }
    );
  });

  it("should tokenize hierarchical MD code blocks", () => {
    function readCodeFence(ctx: TokenizerContext): TToken | undefined {
      if (
        ctx.getChar(+0) !== "`" ||
        ctx.getChar(+1) !== "`" ||
        ctx.getChar(+2) !== "`"
      ) {
        return;
      }
      function isAlphaNum(ch: string[1]) {
        return (
          (ch >= "0" && ch <= "9") ||
          (ch >= "a" && ch <= "z") ||
          (ch >= "A" && ch <= "Z")
        );
      }
      return ctx.guard(() => {
        const start = ctx.i;
        ctx.i += 3;
        const namesStart = ctx.skipWhile(isSpace);
        for (; ctx.i < ctx.length; ctx.i++) {
          const char = ctx.getChar();
          if (!isAlphaNum(char)) break;
          // if (!char.match(/^\p{L}/u)) break;
        }
        const name = ctx.substring(namesStart, ctx.i);
        const end = ctx.i;
        return {
          type: "MdCodeFence",
          start,
          end,
          value: ctx.substring(start, end),
          name,
        } as TToken;
      });
    }
    function readCodeEnd(ctx: TokenizerContext): TToken | undefined {
      const token = readCodeFence(ctx);
      if (!token || token.name) return;
      return token;
    }

    function newReader() {
      const list: TTokenizerMethod[] = [];
      // list.push(readWord);
      const compositeReader = newCompositeTokenizer(list);
      const readToken = newBlockReader("Content", compositeReader);
      list.unshift(
        newFencedBlockReader("MdCode", readCodeFence, readToken, readCodeEnd)
      );
      return readToken;
    }

    test(
      newReader(),
      `
before 
\`\`\`ts
First Typescript Block
\`\`\`js
Internal Javascript Block
\`\`\`
Typescript Again
\`\`\`
after
`,
      {
        type: "Content",
        start: 0,
        end: 101,
        value:
          "\nbefore \n```ts\nFirst Typescript Block\n```js\nInternal Javascript Block\n```\nTypescript Again\n```\nafter\n",
        children: [
          {
            type: "MdCode",
            start: 9,
            end: 94,
            value:
              "```ts\nFirst Typescript Block\n```js\nInternal Javascript Block\n```\nTypescript Again\n```",
            children: [
              {
                type: "MdCodeFence",
                start: 9,
                end: 14,
                value: "```ts",
                name: "ts",
              },
              {
                type: "Content",
                start: 14,
                end: 91,
                value:
                  "\nFirst Typescript Block\n```js\nInternal Javascript Block\n```\nTypescript Again\n",
                children: [
                  {
                    type: "MdCode",
                    start: 38,
                    end: 73,
                    value: "```js\nInternal Javascript Block\n```",
                    children: [
                      {
                        type: "MdCodeFence",
                        start: 38,
                        end: 43,
                        value: "```js",
                        name: "js",
                      },
                      {
                        type: "Content",
                        start: 43,
                        end: 70,
                        value: "\nInternal Javascript Block\n",
                      },
                      {
                        type: "MdCodeFence",
                        start: 70,
                        end: 73,
                        value: "```",
                        name: "",
                      },
                    ],
                  },
                ],
              },
              {
                type: "MdCodeFence",
                start: 91,
                end: 94,
                value: "```",
                name: "",
              },
            ],
          },
        ],
      }
    );
  });
});

describe("TokenizerContext", () => {
  interface TMdHeaderStartToken extends TToken {
    type: "MdHeaderStart";
    level: number;
  }

  function readMdHeaderStart(
    ctx: TokenizerContext
  ): TMdHeaderStartToken | undefined {
    return ctx.guard(() => {
      const start = ctx.i;
      const eolPos = ctx.skipWhile(isEol);
      if (start > 0 && eolPos === start) return;

      ctx.skipWhile(isSpace);
      let level = 0;
      for (level = 0; level <= 6; level++) {
        if (ctx.getChar(level) !== "#") break;
      }
      if (level === 0) return;
      ctx.i += level;
      if (ctx.getChar() !== " ") return;
      ctx.i++;
      const end = ctx.i;
      return {
        type: "MdHeaderStart",
        start,
        end,
        value: ctx.substring(start, end),
        level,
      };
    });
  }

  function readNewLine(ctx: TokenizerContext): TToken | undefined {
    return ctx.guard(() => {
      const start = ctx.i;
      const eolPos = ctx.skipWhile(isEol);
      if (start > 0 && eolPos === start) return;
      return {
        type: "Eol",
        start,
        end: eolPos,
        value: ctx.substring(start, eolPos),
        level: 0,
      };
    });
  }

  interface TMdHeaderEndToken extends TToken {
    type: "MdHeaderEnd";
  }
  function readMdHeaderEnd(
    ctx: TokenizerContext
  ): TMdHeaderEndToken | undefined {
    return ctx.guard(() => {
      const start = ctx.i;
      const token = readMdHeaderStart(ctx) || readNewLine(ctx);
      if (!token) return;
      const end = token.start;
      ctx.i = end;
      return {
        type: "MdHeaderEnd",
        start,
        end,
        value: ctx.substring(start, end),
      };
    });
  }

  function newMdHeaderReader(readToken: TTokenizerMethod) {
    const readHeader = newFencedBlockReader(
      "MdHeader",
      readMdHeaderStart,
      readToken,
      readMdHeaderEnd
    );
    return (ctx: TokenizerContext) => {
      const token = readHeader(ctx);
      if (!token) return;
      const startToken: TToken = token.children?.[0] as TToken;
      token.level = startToken.level;
      return token;
    };
  }

  it("should read MD headers", () => {
    function newReader() {
      const list: TTokenizerMethod[] = [];
      const compositeReader = newCompositeTokenizer(list);
      const readToken = newBlockReader("MdContent", compositeReader);
      const readMdHeader = newMdHeaderReader(readToken);
      list.unshift(readMdHeader);
      return readToken;
    }

    test(
      newReader(),
      `
# First Header
First paragraph
## Second Header
Second paragraph
`,
      {
        type: "MdContent",
        start: 0,
        end: 66,
        value:
          "\n# First Header\nFirst paragraph\n## Second Header\nSecond paragraph\n",
        children: [
          {
            type: "MdHeader",
            start: 0,
            end: 15,
            value: "\n# First Header",
            children: [
              {
                type: "MdHeaderStart",
                start: 0,
                end: 3,
                value: "\n# ",
                level: 1,
              },
              { type: "MdContent", start: 3, end: 15, value: "First Header" },
              { type: "MdHeaderEnd", start: 15, end: 15, value: "" },
            ],
            level: 1,
          },
          {
            type: "MdHeader",
            start: 31,
            end: 48,
            value: "\n## Second Header",
            children: [
              {
                type: "MdHeaderStart",
                start: 31,
                end: 35,
                value: "\n## ",
                level: 2,
              },
              { type: "MdContent", start: 35, end: 48, value: "Second Header" },
              { type: "MdHeaderEnd", start: 48, end: 48, value: "" },
            ],
            level: 2,
          },
        ],
      }
    );

    test(
      newReader(),
      `
  # First Header
  First paragraph

  ## Second Header
  Second paragraph
  `,
      {
        type: "MdContent",
        start: 0,
        end: 77,
        value:
          "\n  # First Header\n  First paragraph\n\n  ## Second Header\n  Second paragraph\n  ",
        children: [
          {
            type: "MdHeader",
            start: 0,
            end: 17,
            value: "\n  # First Header",
            children: [
              {
                type: "MdHeaderStart",
                start: 0,
                end: 5,
                value: "\n  # ",
                level: 1,
              },
              { type: "MdContent", start: 5, end: 17, value: "First Header" },
              { type: "MdHeaderEnd", start: 17, end: 17, value: "" },
            ],
            level: 1,
          },
          {
            type: "MdHeader",
            start: 35,
            end: 55,
            value: "\n\n  ## Second Header",
            children: [
              {
                type: "MdHeaderStart",
                start: 35,
                end: 42,
                value: "\n\n  ## ",
                level: 2,
              },
              { type: "MdContent", start: 42, end: 55, value: "Second Header" },
              { type: "MdHeaderEnd", start: 55, end: 55, value: "" },
            ],
            level: 2,
          },
        ],
      }
    );
  });

  it("should build hierarchical document structure based on headers", () => {
    function newReader() {
      const list: TTokenizerMethod[] = [];
      // // list.push(readWord);
      const compositeReader = newCompositeTokenizer(list);
      const readToken = newBlockReader("MdContent", compositeReader);
      const readMdHeader = newMdHeaderReader(readToken);

      list.unshift(
        // readMdHeader,
        newDynamicFencedBlockReader(
          "MdSection",
          readMdHeader,
          () => readMdHeader,
          (token: TToken): TTokenizerMethod | undefined => {
            if (token.type !== "MdHeader") {
              return;
            }
            const level = token.level;
            return (ctx: TokenizerContext) => {
              return ctx.guard(() => {
                const token = readMdHeaderStart(ctx);
                if (!token || token.level > level) return;
                const end = (ctx.i = token.start);
                return {
                  type: "MdSectionEnd",
                  start: token.start,
                  end,
                  value: ctx.substring(token.start, ctx.i),
                };
              });
            };
          }
        )
      );
      return readToken;
    }

    test(
      newReader(),
      `
# First Header
First paragraph
# Second Header
Second paragraph
## Subsection
Inner paragraph
# Third Header
Third paragraph
`,
      {
        type: "MdContent",
        start: 0,
        end: 126,
        value:
          "\n# First Header\nFirst paragraph\n# Second Header\nSecond paragraph\n## Subsection\nInner paragraph\n# Third Header\nThird paragraph\n",
        children: [
          {
            type: "MdSection",
            start: 0,
            end: 31,
            value: "\n# First Header\nFirst paragraph",
            children: [
              {
                type: "MdHeader",
                start: 0,
                end: 15,
                value: "\n# First Header",
                children: [
                  {
                    type: "MdHeaderStart",
                    start: 0,
                    end: 3,
                    value: "\n# ",
                    level: 1,
                  },
                  {
                    type: "MdContent",
                    start: 3,
                    end: 15,
                    value: "First Header",
                  },
                  { type: "MdHeaderEnd", start: 15, end: 15, value: "" },
                ],
                level: 1,
              },
              { type: "MdSectionEnd", start: 31, end: 31, value: "" },
            ],
          },
          {
            type: "MdSection",
            start: 31,
            end: 94,
            value:
              "\n# Second Header\nSecond paragraph\n## Subsection\nInner paragraph",
            children: [
              {
                type: "MdHeader",
                start: 31,
                end: 47,
                value: "\n# Second Header",
                children: [
                  {
                    type: "MdHeaderStart",
                    start: 31,
                    end: 34,
                    value: "\n# ",
                    level: 1,
                  },
                  {
                    type: "MdContent",
                    start: 34,
                    end: 47,
                    value: "Second Header",
                  },
                  { type: "MdHeaderEnd", start: 47, end: 47, value: "" },
                ],
                level: 1,
              },
              {
                type: "MdHeader",
                start: 64,
                end: 78,
                value: "\n## Subsection",
                children: [
                  {
                    type: "MdHeaderStart",
                    start: 64,
                    end: 68,
                    value: "\n## ",
                    level: 2,
                  },
                  {
                    type: "MdContent",
                    start: 68,
                    end: 78,
                    value: "Subsection",
                  },
                  { type: "MdHeaderEnd", start: 78, end: 78, value: "" },
                ],
                level: 2,
              },
              { type: "MdSectionEnd", start: 94, end: 94, value: "" },
            ],
          },
          {
            type: "MdSection",
            start: 94,
            end: 126,
            value: "\n# Third Header\nThird paragraph\n",
            children: [
              {
                type: "MdHeader",
                start: 94,
                end: 109,
                value: "\n# Third Header",
                children: [
                  {
                    type: "MdHeaderStart",
                    start: 94,
                    end: 97,
                    value: "\n# ",
                    level: 1,
                  },
                  {
                    type: "MdContent",
                    start: 97,
                    end: 109,
                    value: "Third Header",
                  },
                  { type: "MdHeaderEnd", start: 109, end: 109, value: "" },
                ],
                level: 1,
              },
            ],
          },
        ],
      }
    );
  });
});
