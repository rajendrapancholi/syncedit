import type { NextFunction, Request, Response } from "express";

// Async handler for Express
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return fn(req, res, next).catch(next); 
  };

export default asyncHandler;
