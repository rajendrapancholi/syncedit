# controller and service

Absolutely! Separating **controllers** and **services** is a good practice for clean architecture. Here’s how you can refactor your login logic.

We’ll create:

- **Controller** → handles request/response
- **Service** → handles business logic (DB queries, password check, JWT generation)

---

## 1. Service Layer

### `auth.service.ts`

```ts
import bcrypt from "bcrypt";
import db from "../db";
import { generateToken } from "../utils/jwt";

export interface LoginResult {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult | null> => {
  // Get user from DB
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) return null;

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  // Generate JWT token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: `${user.fname} ${user.lname}`,
      email: user.email,
    },
  };
};
```

✅ Responsibilities of the service:

- DB query
- Password comparison
- JWT generation
- Return clean object for controller

---

## 2. Controller Layer

### `auth.controller.ts`

```ts
import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  const { email, pass } = req.body;

  if (!email || !pass)
    return res.status(400).json({ message: "All fields are required!" });

  try {
    const result = await loginUser(email, pass);

    if (!result)
      return res.status(401).json({ message: "Invalid credentials!" });

    // Set cookie
    res.cookie("token", result.token, {
      signed: true,
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      message: "Login success",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to login!" });
  }
};
```

✅ Responsibilities of the controller:

- Validate input
- Call service
- Handle HTTP response (status, cookies, JSON)
- Error handling

---

## 3. Optional: JWT utility

### `utils/jwt.ts`

```ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: `${user.fname} ${user.lname}` },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};
```

---

## 4. Benefits of this separation

| Layer      | Responsibility                                         |
| ---------- | ------------------------------------------------------ |
| Controller | Request validation, response formatting, HTTP concerns |
| Service    | Business logic, database, authentication, JWT          |
| Utils      | Pure helpers (e.g., JWT generation, hashing)           |

This makes it:

- Easier to test (`loginUser` can be tested without HTTP)
- Easier to maintain and scale
- Cleaner and more modular

---

I can also **refactor your register and JWT verification logic the same way**, so your auth module becomes fully clean and modular.

Do you want me to do that next?
