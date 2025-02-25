import { Pathy, pathy } from '@bscotch/pathy';
import fsp from 'fs/promises';
import path from 'path';

export type AnyFunc = (...args: any) => any;
export type Checked<T extends AnyFunc> =
  | [error: Error, result: null]
  | [error: null, result: ReturnType<T>];

export type AsyncableChecked<T extends AnyFunc> =
  ReturnType<T> extends Promise<any> ? Promise<Checked<T>> : Checked<T>;

export function check<T extends AnyFunc>(
  func: T,
  message: string,
): AsyncableChecked<T> {
  const handleError = (err: unknown): [Error, null] => {
    const error = new Error(message);
    error.cause = err;
    return [error, null];
  };
  try {
    const result = func();
    // Handle async functions
    if (result instanceof Promise) {
      return result.then(
        (result) => [null, result],
        (cause) => handleError(cause),
      ) as AsyncableChecked<T>;
    }
    return [null, result] as AsyncableChecked<T>;
  } catch (cause) {
    return handleError(cause) as AsyncableChecked<T>;
  }
}

export class SpriteSourceError extends Error {
  constructor(message: string, cause?: any, asserter?: Function) {
    super(message);
    this.name = 'SpriteSourceError';
    this.cause = cause;
    Error.captureStackTrace(this, asserter || this.constructor);
  }
}

export function assert(
  condition: any,
  message: string,
  cause?: any,
): asserts condition {
  if (!condition) {
    const err = new SpriteSourceError(message, cause, assert);
    throw err;
  }
}

export function rethrow(cause: any, message: string) {
  const error = new Error(message);
  error.cause = cause;
  throw error;
}

export async function getDirs(
  rootFolder: string,
  maxDepth = Infinity,
): Promise<Pathy[]> {
  const spriteDirs: Pathy[] = [];

  async function walk(dir: string, depth = 1): Promise<void> {
    if (depth > maxDepth) return;
    const files = await fsp.readdir(dir, { withFileTypes: true });
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          // Add as a Pathy instance where the cwd is the root folder
          spriteDirs.push(pathy(filePath, rootFolder));
          await walk(filePath, depth + 1);
        }
      }),
    );
  }

  await walk(rootFolder);
  return spriteDirs;
}

/**
 * Delete the PNG images inside a folder. Returns the list of
 * deleted images.
 */
export async function deletePngChildren(path: Pathy) {
  if (!(await path.exists())) {
    return [];
  }
  const files = await fsp.readdir(path.absolute);
  const deleteWaits: Promise<void>[] = [];
  const deleted: Pathy[] = [];
  for (const file of files) {
    if (file.match(/\.png$/i)) {
      const toDelete = path.join(file);
      deleted.push(toDelete);
      deleteWaits.push(fsp.unlink(toDelete.absolute));
    }
  }
  await Promise.all(deleteWaits);
  return deleted;
}

/**
 * Asynchronously get the size of a PNG image, given its path,
 * with maximal speed.
 */
export async function getPngSize(
  path: Pathy,
): Promise<{ width: number; height: number }> {
  const size = { width: 0, height: 0 };
  const fd = await fsp.open(path.absolute, 'r');
  try {
    const buf = Buffer.alloc(24);
    await fd.read(buf, 0, 24, 16);
    size.width = buf.readUInt32BE(0);
    size.height = buf.readUInt32BE(4);
  } finally {
    await fd.close();
  }
  assert(size.width > 0, `Invalid width for ${path}`);
  assert(size.height > 0, `Invalid height for ${path}`);
  return size;
}

/**
 * A decorator for async methods that ensures that calls to
 * the method are resolved in order, and that only one call
 * is active at a time.
 */
export function Sequential() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    let promise: Promise<any> = Promise.resolve();

    descriptor.value = function (...args: any[]) {
      const result = promise.then(() => {
        promise = originalMethod.apply(this, args);
        return promise;
      });
      return result;
    };

    return descriptor;
  };
}

export const sequential = Sequential();
