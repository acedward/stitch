import { ok } from 'assert';
import { IToken } from 'chevrotain';
import type { GmlFile } from './project.gml.js';
import { Location } from './symbols.location.js';
import type { Self } from './symbols.self.js';
import { LocalVariable } from './symbols.symbol.js';

/**
 * A region of code that has access to a single combination of
 * local and self variables. Scope ranges do not overlap and are not
 * nested. Two scope ranges can map to the same pair of local and self vars.
 */
export class ScopeRange {
  /** The immediately adjacent ScopeRange */
  protected _next: ScopeRange | undefined = undefined;
  readonly start: Location;

  constructor(
    public self: Self,
    public local: LocalScope,
    start: Location | GmlFile,
    public end: Location | undefined = undefined,
  ) {
    this.start = start instanceof Location ? start : new Location(start, 0);
  }

  /**
   * Create the next ScopeRange, adjacent to this one.
   * This sets the end location of this scope range to
   * match the start location of the next one. The self
   * and local values default to the same as this scope range,
   * so at least one will need to be changed!
   */
  createNext(offset: number): ScopeRange {
    this.end = this.start.at(offset);
    ok(
      !this._next,
      'Cannot create a next scope range when one already exists.',
    );
    this._next = new ScopeRange(this.self, this.local, this.end);
    return this._next;
  }
}

/**
 * A collection of local variables that are all available at the same time.
 */
export class LocalScope {
  readonly variables = new Map<string, LocalVariable>();
  readonly start: Location;

  constructor(location: Location | GmlFile) {
    this.start =
      location instanceof Location ? location : new Location(location, 0);
  }

  hasSymbol(name: string) {
    return this.variables.has(name);
  }

  getSymbol(name: string) {
    return this.variables.get(name);
  }

  addSymbol(token: IToken, isParam = false) {
    // TODO: If this variable already exists, emit a warning
    // and add it as a reference to the existing variable.
    this.variables.set(
      token.image,
      new LocalVariable(token.image, this.start.at(token), isParam),
    );
  }
}
