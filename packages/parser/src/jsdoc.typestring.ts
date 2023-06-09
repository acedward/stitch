// Handle GameMaker JSDoc typestrings
// GameMaker allows for some variations on the allowed syntax.
// Examples:
//  - `String`
//  - `String|Real`
//  - `String,Real`
//  - `String OR Real`
//  - `Array`
//  - `Array<String>`
//  - `Array[String|Real]`

import { ok } from 'assert';

export interface FeatherTypeUnion {
  kind: 'union';
  types: FeatherType[];
}

export interface FeatherType {
  kind: 'type';
  name: string;
  of?: FeatherTypeUnion;
}

export function parseFeatherTypeString(typeString: string): FeatherTypeUnion {
  // Patterns
  const whitespace = /\s+/y;
  const leftBracket = /[<[]/y;
  const rightBracket = /[>\]]/y;
  const or = /(\bOR\b|\bor\b|\||,)/y;
  const identifier = /[a-zA-Z_][a-zA-Z0-9_.]*/y;
  let currentPosition = 0;

  const lex = (pattern: RegExp) => {
    pattern.lastIndex = currentPosition;
    const match = pattern.exec(typeString);
    if (!match) {
      return;
    }
    currentPosition = pattern.lastIndex;
    return match;
  };
  const rootUnion: FeatherTypeUnion = { kind: 'union', types: [] };
  const typeUnionStack: FeatherTypeUnion[] = [rootUnion];
  0;
  const currentUnion = (): FeatherTypeUnion => typeUnionStack.at(-1)!;
  let currentType: FeatherType | undefined;

  // Lex the string
  while (currentPosition < typeString.length) {
    let match: RegExpExecArray | undefined;

    match = lex(leftBracket);
    if (match) {
      ok(currentType, 'Unexpected left bracket');
      // Create a new union
      const union: FeatherTypeUnion = { kind: 'union', types: [] };
      // Add it to the current type
      currentType.of = union;
      // Push it onto the stack
      typeUnionStack.push(union);
      continue;
    }

    match = lex(rightBracket);
    if (match) {
      // Pop the current union off the stack
      typeUnionStack.pop();
      // Can only be followed by an OR, so unset the type
      currentType = undefined;
      continue;
    }

    match = lex(or);
    if (match) {
      continue;
    }

    match = lex(identifier);
    if (match) {
      // Create a new type
      const type: FeatherType = {
        kind: 'type',
        name: match[0],
      };
      // Add it to the current union
      currentUnion().types.push(type);
      currentType = type;
      continue;
    }

    match = lex(whitespace);
    if (match) {
      continue;
    }
    break;
  }

  return rootUnion;
}
