export const isNumber = (o: any): o is number => typeof o === 'number';
export const isIndexString = (o: string) => o.match(/^[0-9]+$/);
