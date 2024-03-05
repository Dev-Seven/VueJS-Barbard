export const format = (e: unknown) =>
  e instanceof Error ? `${e.name} - ${e.message} - ${e.cause} - ${e.stack}` : e;
