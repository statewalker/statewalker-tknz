import { TTestData } from "./data.types.ts";

export const testData: TTestData[] = [
  {
    input: " A B C ",
    description: "should read text and spaces",
    expected: {
      type: "Block",
      start: 0,
      end: 7,
      value: " A B C ",
      children: [
        {
          type: "Space",
          start: 0,
          end: 1,
          value: " ",
        },
        {
          type: "Text",
          start: 1,
          end: 2,
          value: "A",
        },
        {
          type: "Space",
          start: 2,
          end: 3,
          value: " ",
        },
        {
          type: "Text",
          start: 3,
          end: 4,
          value: "B",
        },
        {
          type: "Space",
          start: 4,
          end: 5,
          value: " ",
        },
        {
          type: "Text",
          start: 5,
          end: 6,
          value: "C",
        },
        {
          type: "Space",
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
      type: "Block",
      start: 0,
      end: 8,
      value: " A B C \n",
      children: [
        {
          type: "Space",
          start: 0,
          end: 1,
          value: " ",
        },
        {
          type: "Text",
          start: 1,
          end: 2,
          value: "A",
        },
        {
          type: "Space",
          start: 2,
          end: 3,
          value: " ",
        },
        {
          type: "Text",
          start: 3,
          end: 4,
          value: "B",
        },
        {
          type: "Space",
          start: 4,
          end: 5,
          value: " ",
        },
        {
          type: "Text",
          start: 5,
          end: 6,
          value: "C",
        },
        {
          type: "Space",
          start: 6,
          end: 7,
          value: " ",
        },
        {
          type: "Eol",
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
      type: "Block",
      start: 0,
      end: 16,
      value: "before     after",
      children: [
        {
          type: "Text",
          start: 0,
          end: 6,
          value: "before",
        },
        {
          type: "Space",
          start: 6,
          end: 11,
          value: "     ",
        },
        {
          type: "Text",
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
      type: "Block",
      start: 0,
      end: 50,
      value: "before ${ js `${inner code}` md```code\n``` } after",
      children: [
        { type: "Text", start: 0, end: 6, value: "before" },
        { type: "Space", start: 6, end: 7, value: " " },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 43,
          start: 7,
          end: 44,
          value: "${ js `${inner code}` md```code\n``` }",
          children: [
            {
              type: "Code",
              codeStart: 16,
              codeEnd: 26,
              start: 14,
              end: 27,
              value: "${inner code}",
            },
          ],
        },
        { type: "Space", start: 44, end: 45, value: " " },
        { type: "Text", start: 45, end: 50, value: "after" },
      ],
    },
  },
  // -------------------------------------------------------------
  {
    input: "first\n\nsecond",
    description: "should read paragraphs until the next empty line",
    expected: {
      type: "Block",
      start: 0,
      end: 5,
      value: "first",
      children: [
        {
          type: "Text",
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
      type: "Block",
      start: 0,
      end: 32,
      value: "first\n${ inner \n\n\n code }\nsecond",
      children: [
        { type: "Text", start: 0, end: 5, value: "first" },
        { type: "Eol", start: 5, end: 6, value: "\n" },
        {
          type: "Code",
          codeStart: 8,
          codeEnd: 24,
          start: 6,
          end: 25,
          value: "${ inner \n\n\n code }",
        },
        { type: "Eol", start: 25, end: 26, value: "\n" },
        { type: "Text", start: 26, end: 32, value: "second" },
      ],
    },
  },

  {
    input: "before ${code} after",
    description: "should read text with code blocks",
    expected: {
      type: "Block",
      start: 0,
      end: 20,
      value: "before ${code} after",
      children: [
        { type: "Text", start: 0, end: 6, value: "before" },
        { type: "Space", start: 6, end: 7, value: " " },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 13,
          start: 7,
          end: 14,
          value: "${code}",
        },
        { type: "Space", start: 14, end: 15, value: " " },
        { type: "Text", start: 15, end: 20, value: "after" },
      ],
    },
  },
  {
    input: "before ${A1 `B1 ${C1 `${third level}` C2} B2` A2} after",
    description: "should read hierarchical code blocks",
    expected: {
      type: "Block",
      start: 0,
      end: 55,
      value: "before ${A1 `B1 ${C1 `${third level}` C2} B2` A2} after",
      children: [
        { type: "Text", start: 0, end: 6, value: "before" },
        { type: "Space", start: 6, end: 7, value: " " },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 48,
          start: 7,
          end: 49,
          value: "${A1 `B1 ${C1 `${third level}` C2} B2` A2}",
          children: [
            {
              type: "Code",
              codeStart: 18,
              codeEnd: 40,
              start: 16,
              end: 41,
              value: "${C1 `${third level}` C2}",
              children: [
                {
                  type: "Code",
                  codeStart: 24,
                  codeEnd: 35,
                  start: 22,
                  end: 36,
                  value: "${third level}",
                },
              ],
            },
          ],
        },
        { type: "Space", start: 49, end: 50, value: " " },
        { type: "Text", start: 50, end: 55, value: "after" },
      ],
    },
  },
  {
    input: `(c) (C) (r) (R) (tm) (TM) (p) (P) +- ?!!.....`,
    description: "should read text with punctuation symbols",
    expected: {
      type: "Block",
      start: 0,
      end: 45,
      value: "(c) (C) (r) (R) (tm) (TM) (p) (P) +- ?!!.....",
      children: [
        { type: "Punctuation", start: 0, end: 1, value: "(" },
        { type: "Text", start: 1, end: 2, value: "c" },
        { type: "Punctuation", start: 2, end: 3, value: ")" },
        { type: "Space", start: 3, end: 4, value: " " },
        { type: "Punctuation", start: 4, end: 5, value: "(" },
        { type: "Text", start: 5, end: 6, value: "C" },
        { type: "Punctuation", start: 6, end: 7, value: ")" },
        { type: "Space", start: 7, end: 8, value: " " },
        { type: "Punctuation", start: 8, end: 9, value: "(" },
        { type: "Text", start: 9, end: 10, value: "r" },
        { type: "Punctuation", start: 10, end: 11, value: ")" },
        { type: "Space", start: 11, end: 12, value: " " },
        { type: "Punctuation", start: 12, end: 13, value: "(" },
        { type: "Text", start: 13, end: 14, value: "R" },
        { type: "Punctuation", start: 14, end: 15, value: ")" },
        { type: "Space", start: 15, end: 16, value: " " },
        { type: "Punctuation", start: 16, end: 17, value: "(" },
        { type: "Text", start: 17, end: 19, value: "tm" },
        { type: "Punctuation", start: 19, end: 20, value: ")" },
        { type: "Space", start: 20, end: 21, value: " " },
        { type: "Punctuation", start: 21, end: 22, value: "(" },
        { type: "Text", start: 22, end: 24, value: "TM" },
        { type: "Punctuation", start: 24, end: 25, value: ")" },
        { type: "Space", start: 25, end: 26, value: " " },
        { type: "Punctuation", start: 26, end: 27, value: "(" },
        { type: "Text", start: 27, end: 28, value: "p" },
        { type: "Punctuation", start: 28, end: 29, value: ")" },
        { type: "Space", start: 29, end: 30, value: " " },
        { type: "Punctuation", start: 30, end: 31, value: "(" },
        { type: "Text", start: 31, end: 32, value: "P" },
        { type: "Punctuation", start: 32, end: 33, value: ")" },
        { type: "Space", start: 33, end: 34, value: " " },
        { type: "Text", start: 34, end: 35, value: "+" },
        { type: "Punctuation", start: 35, end: 36, value: "-" },
        { type: "Space", start: 36, end: 37, value: " " },
        { type: "Punctuation", start: 37, end: 45, value: "?!!....." },
      ],
    },
  },
];
