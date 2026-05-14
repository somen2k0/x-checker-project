declare module "xss-clean" {
  import type { RequestHandler } from "express";
  function xssClean(): RequestHandler;
  export = xssClean;
}

declare module "hpp" {
  import type { RequestHandler } from "express";
  interface HppOptions {
    whitelist?: string | string[];
    checkQuery?: boolean;
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string;
  }
  function hpp(options?: HppOptions): RequestHandler;
  export = hpp;
}
