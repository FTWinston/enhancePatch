import { pathSeparator } from './Operation';

export function splitPath(path?: string) {
    return path === undefined || path === ''
        ? []
        : path
              .split(pathSeparator)
              .map((part) =>
                  part.replace(/~1/g, pathSeparator).replace(/~0/g, '~')
              );
}
