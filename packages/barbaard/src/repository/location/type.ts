export type LocationID = "hcmc" | "hanoi";
export type BarBaardLocation = {};

export const isBarbaardLocation = (o: unknown) => o instanceof Object;
