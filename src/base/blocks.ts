import {
  type TToken,
  type TTokenizerMethod,
  type TokenizerContext,
} from "./tokenizer.ts";

/**
 * Generic method to create a reader for a fenced block.
 * This method returns a reader consuming all characters until a fence
 * or an end token is found.
 *
 * @param type the type of produced tokens
 * @param readStart the method to read the start token; this returned generates
 * new tokens starting from the first token of the block
 * @param getContentTokenizer returns an optional function recognizing inner
 * tokens in the stream between the initial and final tokens
 * @param getEndTokenizer this function returns an optional method to recognize
 * the end token of the block; if this method is not provided the block will
 * be recognized until a fence is found
 * @returns a tokenizer method consuming all characters until the end of the block
 * or a fence is found
 */
export function newDynamicFencedBlockReader<T extends TToken = TToken>(
  type: string,
  readStart: TTokenizerMethod,
  getContentTokenizer: (startToken: TToken) => TTokenizerMethod | undefined,
  getEndTokenizer: (startToken: TToken) => TTokenizerMethod | undefined,
  includeEndToken = true
): TTokenizerMethod<T> {
  return (ctx: TokenizerContext): T | undefined =>
    ctx.guard((fences) => {
      const start = ctx.i;
      const startToken = readStart(ctx);
      let endToken: TToken | undefined;
      if (!startToken) return;
      const children = [startToken];
      ctx.i = startToken.end;

      const readToken = getContentTokenizer(startToken) || (() => undefined);
      const readEnd = getEndTokenizer(startToken);
      if (readEnd) fences.addFence(readEnd);

      while (ctx.i < ctx.length) {
        endToken = readEnd?.(ctx);
        if (endToken) {
          includeEndToken && children.push(endToken);
          ctx.i = endToken.end;
          break;
        }
        if (fences.isFenceBoundary()) {
          break;
        }
        const token = readToken(ctx);
        if (token) {
          children.push(token);
          ctx.i = token.end;
        } else {
          ctx.i++;
        }
      }
      const end = ctx.i;
      return {
        type,
        start,
        end,
        value: ctx.substring(start, end),
        children,
      } as T;
    });
}

/**
 * This function returns a reader producing tokens if the initial sequence
 * is found. Starting from the start token this method consumes all characters
 * until a fence or a end token is found. All tokens returned by the readToken
 * method are added to the children array of the resulting token.
 *
 * @param type the type of returned tokens
 * @param readStart the token reader for the start of the block
 * @param readToken optional token reader for the content of the block;
 * tokens returned by this method are added to the children array
 * of the returned token
 * @param readEnd optional token reader for the end of the block
 * @returns a tokenizer method consuming all characters until
 * the end of the block or a fence is found
 */
export function newFencedBlockReader<T extends TToken = TToken>(
  type: string,
  readStart: TTokenizerMethod,
  readToken?: TTokenizerMethod,
  readEnd?: TTokenizerMethod
): TTokenizerMethod<T> {
  return newDynamicFencedBlockReader(
    type,
    readStart,
    () => readToken,
    () => readEnd
  );
}

/**
 * This function returns a reader consuming all characters until
 * a fence is found. All tokens returned by the readToken method
 * are added to the children array.
 * @param type the type of the token to create
 * @param readToken the method to read the tokens
 * @returns a tokenizer method consuming all characters until
 * a fence is found
 */
export function newBlockReader(
  type: string,
  readToken?: TTokenizerMethod
): TTokenizerMethod {
  return (ctx: TokenizerContext): TToken | undefined =>
    ctx.guard((fences) => {
      const start = ctx.i;
      const len = ctx.length;
      let children: TToken[] | undefined;
      while (ctx.i < len) {
        if (fences.isFenceBoundary()) {
          break;
        }
        const token = readToken?.(ctx);
        if (token) {
          if (!children) children = [];
          children.push(token);
        } else {
          ctx.i++;
        }
      }
      const end = ctx.i;
      if (end === start && ctx.length > 0) return;
      const result: TToken = {
        type,
        start,
        end,
        value: ctx.substring(start, end),
      };
      if (children) result.children = children;
      return result;
    });
}

/**
 * Returns a tokenizer reading blocks of the specified type separated
 * by tokens generated by the `readSeparator` function.
 * @param type
 * @param readSeparator
 * @param readToken
 * @returns
 */
export function newBlocksSequenceReader(
  type: string,
  readSeparator: TTokenizerMethod,
  readToken?: TTokenizerMethod
): TTokenizerMethod {
  const readBlock = newBlockReader(type, readToken);
  return (ctx: TokenizerContext): TToken | undefined =>
    ctx.guard((fences) => {
      fences.addFence(readSeparator);
      return readBlock(ctx);
    });
}

/**
 * Reads and returns a composite token containing the specified number of
 * sub-tokens provided by the given reader.
 * @param type the type of the generated composite token
 * @param readToken a tokenizer generating individual tokens
 * @param min the minimal number of tokens to generate; 1 by default
 * @param max the maximal number of tokens to generate; +Infinity by default
 * @returns a tokenizer method generating a composite token
 */
export function newTokensSequenceReader(
  type: string,
  readToken: TTokenizerMethod,
  min: number = 1,
  max: number = Infinity
): TTokenizerMethod {

  return (ctx: TokenizerContext): TToken | undefined =>
    ctx.guard(() => {
      const start = ctx.i;
      let tokens: TToken[] | undefined;
      for (let i = 0; i < max && ctx.i < ctx.length; i++) {
        const token = readToken(ctx);
        if (!token) break;
        tokens = tokens || [];
        tokens.push(token);
      }
      if (!tokens || tokens.length < min || tokens.length > max) return;
      const end = ctx.i;
      return {
        type,
        start,
        end,
        value: ctx.substring(start, end),
        children: tokens,
      };
    });
}
