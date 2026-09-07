import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types/express";
import { verifyToken } from "../utils/tokenManager";
import { fetchUserById } from "../services/userService";

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated!" });
  try {
    // Decode the token
    let decoded = await verifyToken(token);
    if (!decoded)
      return res.status(401).json({ message: "Token is not valid!" });

    let user = await fetchUserById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found!" });

    // Attach user payload
    req.user = {
      id: user.id, 
      email: user.email,
      role: user.role, 
    };

    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error! authentication failed!" });
  }
};

export default authMiddleware;
