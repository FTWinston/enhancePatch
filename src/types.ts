export const isArray = Array.isArray;
export const isMap = (o: any): o is Map<any, any> => o instanceof Map;
export const isSet = (o: any): o is Set<any> => o instanceof Set;
export const isObject = (o: any): o is Record<any, any> =>
    o !== null && typeof o === 'object';
export const isNumber = (o: any): o is number => typeof o === 'number';
export const isIndexString = (o: string) => o.match(/^[0-9]+$/);
