import { type TTestData } from "../data.types.ts";

export const testData: TTestData[] = [
  {
    input: "before ${code} after",
    description: "should read text with code blocks",
    expected: {
      type: "Block",
      start: 0,
      end: 20,
      value: "before ${code} after",
      children: [
        { type: "Word", value: "before", start: 0, end: 6 },
        { type: "Spaces", value: " ", start: 6, end: 7 },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 13,
          start: 7,
          end: 14,
          value: "${code}",
          children: [{ type: "Word", value: "code", start: 9, end: 13 }],
        },
        { type: "Spaces", value: " ", start: 14, end: 15 },
        { type: "Word", value: "after", start: 15, end: 20 },
      ],
    },
  },

  {
    description: "should read empty code blocks",
    input: "before ${} after",
    expected: {
      type: "Block",
      start: 0,
      end: 16,
      value: "before ${} after",
      children: [
        { type: "Word", value: "before", start: 0, end: 6 },
        { type: "Spaces", value: " ", start: 6, end: 7 },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 9,
          start: 7,
          end: 10,
          value: "${}",
        },
        { type: "Spaces", value: " ", start: 10, end: 11 },
        { type: "Word", value: "after", start: 11, end: 16 },
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
        { type: "Word", value: "before", start: 0, end: 6 },
        { type: "Spaces", value: " ", start: 6, end: 7 },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 43,
          start: 7,
          end: 44,
          value: "${ js `${inner code}` md```code\n``` }",
          children: [
            { type: "Spaces", value: " ", start: 9, end: 10 },
            { type: "Word", value: "js", start: 10, end: 12 },
            { type: "Spaces", value: " ", start: 12, end: 13 },
            {
              type: "Code",
              codeStart: 16,
              codeEnd: 26,
              start: 14,
              end: 27,
              value: "${inner code}",
              children: [
                { type: "Word", value: "inner", start: 16, end: 21 },
                { type: "Spaces", value: " ", start: 21, end: 22 },
                { type: "Word", value: "code", start: 22, end: 26 },
              ],
            },
            { type: "Spaces", value: " ", start: 28, end: 29 },
            { type: "Word", value: "md", start: 29, end: 31 },
            { type: "Word", value: "code", start: 34, end: 38 },
            { type: "Eol", value: "\n", start: 38, end: 39 },
            { type: "Spaces", value: " ", start: 42, end: 43 },
          ],
        },
        { type: "Spaces", value: " ", start: 44, end: 45 },
        { type: "Word", value: "after", start: 45, end: 50 },
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
        { type: "Word", value: "first", start: 0, end: 5 },
        { type: "Eol", value: "\n", start: 5, end: 6 },
        {
          type: "Code",
          codeStart: 8,
          codeEnd: 24,
          start: 6,
          end: 25,
          value: "${ inner \n\n\n code }",
          children: [
            { type: "Spaces", value: " ", start: 8, end: 9 },
            { type: "Word", value: "inner", start: 9, end: 14 },
            { type: "Spaces", value: " ", start: 14, end: 15 },
            { type: "Eol", value: "\n\n\n", start: 15, end: 18 },
            { type: "Spaces", value: " ", start: 18, end: 19 },
            { type: "Word", value: "code", start: 19, end: 23 },
            { type: "Spaces", value: " ", start: 23, end: 24 },
          ],
        },
        { type: "Eol", value: "\n", start: 25, end: 26 },
        { type: "Word", value: "second", start: 26, end: 32 },
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
        { type: "Word", value: "before", start: 0, end: 6 },
        { type: "Spaces", value: " ", start: 6, end: 7 },
        {
          type: "Code",
          codeStart: 9,
          codeEnd: 48,
          start: 7,
          end: 49,
          value: "${A1 `B1 ${C1 `${third level}` C2} B2` A2}",
          children: [
            { type: "Word", value: "A1", start: 9, end: 11 },
            { type: "Spaces", value: " ", start: 11, end: 12 },
            { type: "Word", value: "B1", start: 13, end: 15 },
            { type: "Spaces", value: " ", start: 15, end: 16 },
            {
              type: "Code",
              codeStart: 18,
              codeEnd: 40,
              start: 16,
              end: 41,
              value: "${C1 `${third level}` C2}",
              children: [
                { type: "Word", value: "C1", start: 18, end: 20 },
                { type: "Spaces", value: " ", start: 20, end: 21 },
                {
                  type: "Code",
                  codeStart: 24,
                  codeEnd: 35,
                  start: 22,
                  end: 36,
                  value: "${third level}",
                  children: [
                    { type: "Word", value: "third", start: 24, end: 29 },
                    { type: "Spaces", value: " ", start: 29, end: 30 },
                    { type: "Word", value: "level", start: 30, end: 35 },
                  ],
                },
                { type: "Spaces", value: " ", start: 37, end: 38 },
                { type: "Word", value: "C2", start: 38, end: 40 },
              ],
            },
            { type: "Spaces", value: " ", start: 41, end: 42 },
            { type: "Word", value: "B2", start: 42, end: 44 },
            { type: "Spaces", value: " ", start: 45, end: 46 },
            { type: "Word", value: "A2", start: 46, end: 48 },
          ],
        },
        { type: "Spaces", value: " ", start: 49, end: 50 },
        { type: "Word", value: "after", start: 50, end: 55 },
      ],
    },
  },
];