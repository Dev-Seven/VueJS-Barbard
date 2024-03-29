export abstract class Usecase<T> {
  abstract execute(...args: unknown[]): Promise<T>;
}
