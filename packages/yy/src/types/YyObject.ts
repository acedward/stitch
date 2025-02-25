// Generated by ts-to-zod
import { invert } from '@bscotch/utility';
import { z } from 'zod';
import { yyBaseSchema } from './YyBase.js';
import { yypResourceIdSchema } from './Yyp.js';
import { unstable } from './utility.js';

export const yyObjectEventNums = {
  Create: 0 as const,
  Destroy: 1 as const,
  Alarm: 2 as const,
  Step: 3 as const,
  Draw: 8 as const,
  Cleanup: 12 as const,
};

export const yyObjectEventNames = invert(yyObjectEventNums);

export type YyObjectEventNumbers = typeof yyObjectEventNums;
export type YyObjectEventNames = typeof yyObjectEventNames;
export type YyObjectEventName = keyof YyObjectEventNumbers;
export type YyObjectEventNumber = keyof YyObjectEventNames;

export enum YyObjectPropertyVarType {
  Real,
  Integer,
  String,
  Boolean,
  Expression,
  Asset,
  List,
  Colour,
}

export type YyObjectEvent = z.infer<typeof yyObjectEventSchema>;
export const yyObjectEventSchema = unstable({
  isDnD: z.boolean().default(false),
  /**
   * Numeric identifier for an event subtype.
   * E.g. "Step End" has eventType for Step and
   * eventNum for End.
   */
  eventNum: z.number().default(0),
  /**
   * Numeric identifier representing the event type (e.g. for the Create or Draw events)
   */
  eventType: z.number(),
  collisionObjectId: yypResourceIdSchema.nullable().default(null),
  name: z.string().default(''),
  tags: z.array(z.string()).optional(),
  resourceVersion: z.literal('1.0').default('1.0'),
  resourceType: z.literal('GMEvent').default('GMEvent'),
  parent: z.unknown().optional(),
});

const yyObjectPropertyVarTypeSchema = z.nativeEnum(YyObjectPropertyVarType);

export type YyObjectProperty = z.infer<typeof yyObjectPropertySchema>;
export const yyObjectPropertySchema = unstable({
  /** The variable's name */
  name: z.string(),
  varType: yyObjectPropertyVarTypeSchema,
  /** Stringified starting value. If a color, prefixed with a '$' (unkown format). */
  value: z.string(),
  rangeEnabled: z.boolean().default(false),
  /** (Unknown parameter) */
  rangeMin: z.number(),
  /** (Unknown parameter) */
  rangeMax: z.number(),
  /**
   * Always exists, but only meaningful for Lists
   */
  listItems: z.array(z.string()).default([]),
  /**
   * Always exists, but only meaningful for Lists
   */
  multiselect: z.boolean().default(false),
  /**
   * (Unknown parameter)
   */
  filters: z.array(z.unknown()).default([]),
  tags: z.array(z.string()).optional(),
  resourceVersion: z.literal('1.0').default('1.0'),
  resourceType: z.literal('GMObjectProperty').default('GMObjectProperty'),
});

export type YyObject = z.infer<typeof yyObjectSchema>;
export const yyObjectSchema = yyBaseSchema.extend({
  spriteId: yypResourceIdSchema.nullable().default(null),
  solid: z.boolean().default(false),
  visible: z.boolean().default(true),
  /**
   * If self (default) can be set to null
   */
  spriteMaskId: yypResourceIdSchema.nullable().default(null),
  persistent: z.boolean().default(false),
  parentObjectId: yypResourceIdSchema.nullable().default(null),
  physicsObject: z.boolean().default(false),
  physicsSensor: z.boolean().default(false),
  physicsShape: z.number().default(1),
  physicsGroup: z.number().default(1),
  physicsDensity: z.number().default(0),
  physicsRestitution: z.number().default(0),
  physicsLinearDamping: z.number().default(0),
  physicsAngularDamping: z.number().default(0),
  physicsFriction: z.number().default(0),
  physicsStartAwake: z.boolean().default(true),
  physicsKinematic: z.boolean().default(false),
  physicsShapePoints: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
      }),
    )
    .default([]),
  eventList: z.array(yyObjectEventSchema).default([]),
  properties: z.array(yyObjectPropertySchema).default([]),
  /**
   * (Unknown parameter)
   */
  overriddenProperties: z.array(z.unknown()).default([]),
  managed: z.boolean().optional(),
  resourceType: z.literal('GMObject').default('GMObject'),
});
