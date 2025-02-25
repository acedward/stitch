export type WithablePrimitiveName = (typeof withableTypes)[number];
export const withableTypes = [
  'Struct',
  'Asset.GMObject',
  'Id.Instance',
] as const;

export const utilityTypes = ['InstanceType', 'ObjectType'] as const;

export const withableTypesLower = withableTypes.map((t) =>
  t.toLowerCase(),
) as Lowercase<WithablePrimitiveName>[];

/** Base types, like Array, Real, Struct, etc */
export type BaseName = (typeof baseNames)[number];
export const baseNames = [
  'Array',
  'Bool',
  'Enum',
  'Function',
  'Pointer',
  'Real',
  'String',
  'Struct',
  'Undefined',
  'ArgumentIdentity',
] as const;
Object.freeze(Object.seal(baseNames));

export type PrimitiveName = (typeof primitiveNames)[number];
export const primitiveNames = [
  ...baseNames,
  'Any',
  'Asset.GMAnimCurve',
  'Asset.GMAudioGroup',
  'Asset.GMFont',
  'Asset.GMObject',
  'Asset.GMParticleSystem',
  'Asset.GMPath',
  'Asset.GMRoom',
  'Asset.GMScript',
  'Asset.GMSequence',
  'Asset.GMShader',
  'Asset.GMSound',
  'Asset.GMSprite',
  'Asset.GMTileSet',
  'Asset.GMTimeline',
  'Asset.Script',
  'Id.AudioEmitter',
  'Id.AudioListener',
  'Id.AudioSyncGroup',
  'Id.BackgroundElement',
  'Id.BinaryFile',
  'Id.Buffer',
  'Id.Camera',
  'Id.DsGrid',
  'Id.DsList',
  'Id.DsMap',
  'Id.DsPriority',
  'Id.DsQueue',
  'Id.DsStack',
  'Id.ExternalCall',
  'Id.Gif',
  'Id.Instance',
  'Id.Layer',
  'Id.MpGrid',
  'Id.ParticleEmitter',
  'Id.ParticleSystem',
  'Id.ParticleType',
  'Id.PhysicsIndex',
  'Id.PhysicsParticleGroup',
  'Id.Sampler',
  'Id.SequenceElement',
  'Id.Socket',
  'Id.Sound',
  'Id.SpriteElement',
  'Id.Surface',
  'Id.TextFile',
  'Id.Texture',
  'Id.TileElementId',
  'Id.TileMapElement',
  'Id.TimeSource',
  'Id.Uniform',
  'Id.VertexBuffer',
  'Id.VertexFormat',
  'Mixed',
  // Custom names (not in Feather)
  'EnumMember',
  'Unknown',
  'Never', // For things that throw
  ...utilityTypes,
] as const;
Object.freeze(Object.seal(primitiveNames));
