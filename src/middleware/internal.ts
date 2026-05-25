import { Response, NextFunction } from "express";
import { AuthedRequest } from "./jwt";

export function attachServiceIdentity(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
): void {
  const forwarded = req.headers["x-forwarded-user"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    req.user = { sub: forwarded, iss: "mesh-internal" };
  }
  next();
}
