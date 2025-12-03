type TGenericObject = Record<string, unknown>;

const pick = <T extends TGenericObject, K extends keyof T>(
    obj: T,
    keys: K[]
): Partial<T> => {
    const result: Partial<T> = {};

    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
            result[key] = obj[key];
        }
    });

    return result;
};

export default pick;


