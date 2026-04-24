import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

export function requireUser(req: AuthedRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const token = auth.slice("Bearer ".length).trim();
  jwt.verify(
    token,
    config.jwtSecret,
    { algorithms: ["HS256"], issuer: config.jwtIssuer },
    (err, decoded) => {
      if (err || !decoded) {
        res.status(401).json({ error: "invalid_token" });
        return;
      }
      req.user = decoded as JwtPayload;
      next();
    }
  );
}
