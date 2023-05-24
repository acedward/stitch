import type { IToken } from 'chevrotain';
import type { Location } from './project.locations.js';
import type { SymbolBase, SymbolKind, SymbolRefBase } from './types.legacy.js';

export type ProjectSymbolType =
  | LocalVar
  | SelfSymbol
  | GlobalVar
  | GlobalFunction
  | FunctionParam
  | Macro
  | Enum
  | EnumMember;

export class SymbolRef implements SymbolRefBase {
  readonly type = 'symbolRef';
  constructor(
    public readonly symbol: ProjectSymbolType,
    public readonly location: Location,
    public readonly isDeclaration = false,
  ) {}

  get start() {
    return this.location.startOffset;
  }

  get end() {
    return this.start + this.symbol.name.length;
  }
}

abstract class ProjectSymbol implements SymbolBase {
  readonly type = 'symbol';
  readonly native = false;
  abstract kind: SymbolKind;
  location?: Location;
  refs = new Set<SymbolRef>();
  deprecated?: boolean;
  global?: boolean;

  constructor(public name: string, location: Location) {
    this.location = location;
    this.addRef(location, true);
  }

  get description() {
    return undefined;
  }

  get code(): string | undefined {
    return this.name;
  }

  addRef(location: Location, isDeclaration = false) {
    const ref = new SymbolRef(
      this as ProjectSymbolType,
      location,
      isDeclaration,
    );
    this.refs.add(ref);
    location.file?.addRef(ref);
  }

  get start() {
    return this.location?.startOffset || 0;
  }

  get end() {
    return this.start + this.name.length;
  }
}

export class LocalVar extends ProjectSymbol {
  readonly kind = 'localVariable';
  constructor(name: string, location: Location, public isParam = false) {
    super(name, location);
  }

  override get code() {
    return this.isParam ? this.name : `var ${this.name}`;
  }
}

export class SelfSymbol extends ProjectSymbol {
  readonly kind = 'selfVariable';
  constructor(name: string, location: Location, readonly isStatic = false) {
    super(name, location);
  }

  override get code() {
    return this.isStatic ? `static ${this.name}` : `self.${this.name}`;
  }
}

export class GlobalVar extends ProjectSymbol {
  override global = true;
  readonly kind = 'globalVariable';

  /**
   * Global variables live on the `global` object, and can either be defined
   * via `global.whatever = ...` or `globalvar whatever`. In the former case,
   * there is no unambiguous declaration location, so we set `isNotDeclaration`
   * to `true`.
   */
  constructor(_name: string, location: Location, isNotDeclaration = false) {
    super(_name, location);
    this.location = isNotDeclaration ? undefined : location;
    this.addRef(location, !isNotDeclaration);
  }

  override get code() {
    return `globalvar ${this.name}`;
  }
}

export class FunctionParam extends ProjectSymbol {
  readonly kind = 'functionParam';
  optional?: boolean;

  override get code() {
    return `/** @param */ ${this.name}`;
  }
}

export class GlobalFunction extends ProjectSymbol {
  override global = true;
  readonly kind = 'globalFunction';
  isConstructor?: boolean;
  params: FunctionParam[] = [];

  override get code() {
    const params = this.params.map((p) => p.name);
    let code = `function ${this.name} (${params.join(', ')})`;
    if (this.isConstructor) {
      code += ` constructor`;
    }
    return code;
  }

  addParam(paramIdx: number, token: IToken, location: Location) {
    if (this.params[paramIdx]) {
      // Update the location in case it has changed
      this.params[paramIdx].location = location;
    } else {
      this.params.push(new FunctionParam(token.image, location));
    }
  }
}

export class Macro extends ProjectSymbol {
  override global = true;
  readonly kind = 'macro';
}

export class EnumMember extends ProjectSymbol {
  readonly kind = 'enumMember';
  enum!: Enum;

  override get code() {
    return `enum ${this.enum.name}.${this.name}`;
  }
}

export class Enum extends ProjectSymbol {
  override global = true;
  readonly kind = 'enum';
  members: EnumMember[] = [];

  override get code() {
    let code = `enum ${this.name} {\n\t`;
    code += this.members.map((m) => m.name).join(',\n\t');
    code += `\n}`;
    return code;
  }

  // Ensure only added once!
  addMember(paramIdx: number, token: IToken, location: Location) {
    if (this.members[paramIdx]) {
      // Update the location in case it has changed
      this.members[paramIdx].location = location;
      this.members[paramIdx].name = token.image;
    } else {
      const member = new EnumMember(token.image, location);
      member.enum = this;
      this.members.push(member);
    }
  }

  hasMember(name: string) {
    return !!this.getMember(name);
  }

  getMember(name: string) {
    return this.members.find((m) => m.name === name);
  }
}
