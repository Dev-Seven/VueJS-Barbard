import prodConfig from "./config.json" assert { type: "json" };
import devConfig from "./config_dev.json" assert { type: "json" };

export enum Env {
  prod = "prod",
  dev = "dev",
}

export const getConfig = () => {
  const env = process.env.ENV;
  console.log({ env: env });
  if (env == Env.dev) {
    return devConfig;
  } else if (env == Env.prod) {
    return prodConfig;
  }
  return devConfig;
};

export const isProd = () => process.env.ENV == Env.prod;
