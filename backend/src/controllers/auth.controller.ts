import bcrypt from 'bcryptjs';
import db from '../config/db';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';
import { blacklistToken, generateToken } from '../utils/tokenManager';
import { fetchUserById } from '../services/userService';
import { ENV, JWT_EXPIRY_MS } from '../config/env';

export const me = async (req: AuthRequest, res: Response) => {
  try {
    let user = await fetchUserById(req.user?.id || '');
    if (!user) return res.status(401).json({ message: 'User not found!' });
    return res.json({
      message: 'Success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Failed to fetch user!' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, pass } = req.body;

  if (!name || !email || !pass) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  try {
    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE email=$1', [
      email,
    ]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already registered!' });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(pass, 10);

    // Insert new user
    const sql =
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email';
    const result = await db.query(sql, [name, email, hashedPass]);

    console.log(result.rows[0]);

    return res.json({ message: 'success', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to register server!' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, pass } = req.body;
  if (!email || !pass)
    return res.status(400).json({ message: 'All fields are required!' });

  try {
    // Get user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials!' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      signed: false,
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production', // true in production
      sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: JWT_EXPIRY_MS,
      path: '/',
    });
    // Return response
    return res.json({
      message: 'Login success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to login!' });
  }
};

// Logout a user
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (token) {
      await blacklistToken(token);
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Session terminated successfully',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
};

export const checkAccess = async (req: Request, res: Response) => {
  const { userId, projectId } = req.body;
  const result = await db.query(
    'SELECT access_level FROM project_members WHERE user_id = $1 AND project_id = $2',
    [userId, projectId],
  );
  if (result.rows.length > 0) return res.sendStatus(200);
  return res.sendStatus(403);
};
