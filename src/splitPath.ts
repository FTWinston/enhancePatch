export function splitPath(path?: string) {
    return path === undefined || path === ''
        ? []
        : path
              .split('/')
              .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
}
