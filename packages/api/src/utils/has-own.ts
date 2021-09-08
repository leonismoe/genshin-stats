export default function hasOwn<T, K extends keyof T>(object: T, key: PropertyKey): key is K {
  return Object.prototype.hasOwnProperty.call(object, key);
}
