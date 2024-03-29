import { type TToken, TokenizerContext } from "../../src/base/index.ts";
import { describe, expect, it } from "../deps.ts";
import { newNgramsWithCode } from "./newNgramsWithCode.ts";
import { gramTestData } from "./ngrams.data.ts";

describe("ngrams", () => {
  function testGram(
    str: string,
    before: string,
    after: string,
    control: TToken & Record<string, any>
  ) {
    const ctx = new TokenizerContext(str, before.length);
    const readToken = newNgramsWithCode();
    const result = readToken(ctx);
    expect(result !== undefined).toBe(true);
    try {
      const token: TToken = result as TToken;
      expect(token).to.eql(control);
      expect(str.substring(0, token.start)).to.eql(before);
      expect(str.substring(token.end)).to.eql(after);
    } catch (error) {
      console.log(JSON.stringify(result));
      // console.log(JSON.stringify(result, null, 2));
      throw error;
    }
  }
  gramTestData.forEach((data) => {
    it(data.description, () => {
      testGram(data.input, data.before, data.after, data.expected);
    });
  });
});
