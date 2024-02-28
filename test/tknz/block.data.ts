import { TTestData } from "./data.types.ts";

export const testData: TTestData[] = [
  {
    input: " A B C ",
    description: "should read text and spaces",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 7,
      value: " A B C ",
      children: [
        {
          type: "Space",
          level: 0,
          start: 0,
          end: 1,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 1,
          end: 2,
          value: "A",
        },
        {
          type: "Space",
          level: 0,
          start: 2,
          end: 3,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 3,
          end: 4,
          value: "B",
        },
        {
          type: "Space",
          level: 0,
          start: 4,
          end: 5,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 5,
          end: 6,
          value: "C",
        },
        {
          type: "Space",
          level: 0,
          start: 6,
          end: 7,
          value: " ",
        },
      ],
    },
  },
  {
    input: " A B C \n",
    description: "should read text, spaces and ends of lines",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 8,
      value: " A B C \n",
      children: [
        {
          type: "Space",
          level: 0,
          start: 0,
          end: 1,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 1,
          end: 2,
          value: "A",
        },
        {
          type: "Space",
          level: 0,
          start: 2,
          end: 3,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 3,
          end: 4,
          value: "B",
        },
        {
          type: "Space",
          level: 0,
          start: 4,
          end: 5,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 5,
          end: 6,
          value: "C",
        },
        {
          type: "Space",
          level: 0,
          start: 6,
          end: 7,
          value: " ",
        },
        {
          type: "Eol",
          level: 0,
          start: 7,
          end: 8,
          value: "\n",
        },
      ],
    },
  },
  {
    description: "should read blocks with spaces",
    input: "before     after",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 16,
      value: "before     after",
      children: [
        {
          type: "Text",
          level: 0,
          start: 0,
          end: 6,
          value: "before",
        },
        {
          type: "Space",
          level: 0,
          start: 6,
          end: 11,
          value: "     ",
        },
        {
          type: "Text",
          level: 0,
          start: 11,
          end: 16,
          value: "after",
        },
      ],
    },
  },

  {
    description: "should read embeded code blocks",
    input: "before ${ js `${inner code}` md```code\n``` } after",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 50,
      value: "before ${ js `${inner code}` md```code\n``` } after",
      children: [
        {
          type: "Text",
          level: 0,
          start: 0,
          end: 6,
          value: "before",
        },
        {
          type: "Space",
          level: 0,
          start: 6,
          end: 7,
          value: " ",
        },
        {
          type: "Code",
          level: 0,
          codeStart: 9,
          codeEnd: 43,
          code: [
            " js `",
            {
              type: "Code",
              level: 0,
              codeStart: 16,
              codeEnd: 26,
              code: ["inner code"],
              start: 14,
              end: 27,
              value: "${inner code}",
            },
            "` md```code\n``` ",
          ],
          start: 7,
          end: 44,
          value: "${ js `${inner code}` md```code\n``` }",
        },
        {
          type: "Space",
          level: 0,
          start: 44,
          end: 45,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 45,
          end: 50,
          value: "after",
        },
      ],
    },
  },
  // -------------------------------------------------------------
  {
    input: "first\n\nsecond",
    description: "should read paragraphs until the next empty line",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 5,
      value: "first",
      children: [
        {
          type: "Text",
          level: 0,
          start: 0,
          end: 5,
          value: "first",
        },
      ],
    },
  },
  {
    input: "first\n${ inner \n\n\n code }\nsecond",
    description:
      "should read paragraphs containing code blocks with empty lines",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 32,
      value: "first\n${ inner \n\n\n code }\nsecond",
      children: [
        {
          type: "Text",
          level: 0,
          start: 0,
          end: 5,
          value: "first",
        },
        {
          type: "Eol",
          level: 0,
          start: 5,
          end: 6,
          value: "\n",
        },
        {
          type: "Code",
          level: 0,
          codeStart: 8,
          codeEnd: 24,
          code: [" inner \n\n\n code "],
          start: 6,
          end: 25,
          value: "${ inner \n\n\n code }",
        },
        {
          type: "Eol",
          level: 0,
          start: 25,
          end: 26,
          value: "\n",
        },
        {
          type: "Text",
          level: 0,
          start: 26,
          end: 32,
          value: "second",
        },
      ],
    },
  },

  {
    input: "before ${code} after",
    description: "should read text with code blocks",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 20,
      value: "before ${code} after",
      children: [
        {
          type: "Text",
          level: 0,
          start: 0,
          end: 6,
          value: "before",
        },
        {
          type: "Space",
          level: 0,
          start: 6,
          end: 7,
          value: " ",
        },
        {
          type: "Code",
          level: 0,
          codeStart: 9,
          codeEnd: 13,
          code: ["code"],
          start: 7,
          end: 14,
          value: "${code}",
        },
        {
          type: "Space",
          level: 0,
          start: 14,
          end: 15,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 15,
          end: 20,
          value: "after",
        },
      ],
    },
  },
  {
    input: "before ${A1 `B1 ${C1 `${third level}` C2} B2` A2} after",
    description: "should read hierarchical code blocks",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 55,
      value: "before ${A1 `B1 ${C1 `${third level}` C2} B2` A2} after",
      children: [
        {
          type: "Text",
          level: 0,
          start: 0,
          end: 6,
          value: "before",
        },
        {
          type: "Space",
          level: 0,
          start: 6,
          end: 7,
          value: " ",
        },
        {
          type: "Code",
          level: 0,
          codeStart: 9,
          codeEnd: 48,
          code: [
            "A1 `B1 ",
            {
              type: "Code",
              level: 0,
              codeStart: 18,
              codeEnd: 40,
              code: [
                "C1 `",
                {
                  type: "Code",
                  level: 0,
                  codeStart: 24,
                  codeEnd: 35,
                  code: ["third level"],
                  start: 22,
                  end: 36,
                  value: "${third level}",
                },
                "` C2",
              ],
              start: 16,
              end: 41,
              value: "${C1 `${third level}` C2}",
            },
            " B2` A2",
          ],
          start: 7,
          end: 49,
          value: "${A1 `B1 ${C1 `${third level}` C2} B2` A2}",
        },
        {
          type: "Space",
          level: 0,
          start: 49,
          end: 50,
          value: " ",
        },
        {
          type: "Text",
          level: 0,
          start: 50,
          end: 55,
          value: "after",
        },
      ],
    },
  },
  {
    input: `(c) (C) (r) (R) (tm) (TM) (p) (P) +- ?!!.....`,
    description: "should read text with punctuation symbols",
    expected: {
      level: 3,
      type: "Block",
      start: 0,
      end: 45,
      value: "(c) (C) (r) (R) (tm) (TM) (p) (P) +- ?!!.....",
      children: [
        { type: "Punctuation", level: 0, start: 0, end: 1, value: "(" },
        { type: "Text", level: 0, start: 1, end: 2, value: "c" },
        { type: "Punctuation", level: 0, start: 2, end: 3, value: ")" },
        { type: "Space", level: 0, start: 3, end: 4, value: " " },
        { type: "Punctuation", level: 0, start: 4, end: 5, value: "(" },
        { type: "Text", level: 0, start: 5, end: 6, value: "C" },
        { type: "Punctuation", level: 0, start: 6, end: 7, value: ")" },
        { type: "Space", level: 0, start: 7, end: 8, value: " " },
        { type: "Punctuation", level: 0, start: 8, end: 9, value: "(" },
        { type: "Text", level: 0, start: 9, end: 10, value: "r" },
        { type: "Punctuation", level: 0, start: 10, end: 11, value: ")" },
        { type: "Space", level: 0, start: 11, end: 12, value: " " },
        { type: "Punctuation", level: 0, start: 12, end: 13, value: "(" },
        { type: "Text", level: 0, start: 13, end: 14, value: "R" },
        { type: "Punctuation", level: 0, start: 14, end: 15, value: ")" },
        { type: "Space", level: 0, start: 15, end: 16, value: " " },
        { type: "Punctuation", level: 0, start: 16, end: 17, value: "(" },
        { type: "Text", level: 0, start: 17, end: 19, value: "tm" },
        { type: "Punctuation", level: 0, start: 19, end: 20, value: ")" },
        { type: "Space", level: 0, start: 20, end: 21, value: " " },
        { type: "Punctuation", level: 0, start: 21, end: 22, value: "(" },
        { type: "Text", level: 0, start: 22, end: 24, value: "TM" },
        { type: "Punctuation", level: 0, start: 24, end: 25, value: ")" },
        { type: "Space", level: 0, start: 25, end: 26, value: " " },
        { type: "Punctuation", level: 0, start: 26, end: 27, value: "(" },
        { type: "Text", level: 0, start: 27, end: 28, value: "p" },
        { type: "Punctuation", level: 0, start: 28, end: 29, value: ")" },
        { type: "Space", level: 0, start: 29, end: 30, value: " " },
        { type: "Punctuation", level: 0, start: 30, end: 31, value: "(" },
        { type: "Text", level: 0, start: 31, end: 32, value: "P" },
        { type: "Punctuation", level: 0, start: 32, end: 33, value: ")" },
        { type: "Space", level: 0, start: 33, end: 34, value: " " },
        { type: "Text", level: 0, start: 34, end: 35, value: "+" },
        { type: "Punctuation", level: 0, start: 35, end: 36, value: "-" },
        { type: "Space", level: 0, start: 36, end: 37, value: " " },
        {
          type: "Punctuation",
          level: 0,
          start: 37,
          end: 45,
          value: "?!!.....",
        },
      ],
    },
  },
];