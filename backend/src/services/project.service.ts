import pool from "../config/db";
import type { ProjectType } from "../models/Project";
import redis from "../lib/redis";
import { randomUUID } from 'crypto';

export const createProject = async (
  name: string,
  projectId: string,
  ownerId: string,
  description: string
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create the project entry
    const projectRes = await client.query(
      "INSERT INTO projects (name, id, owner_id, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, projectId, ownerId, description || null]
    );

    // Automatically add owner to members table with 'owner' access_level
    await client.query(
      "INSERT INTO project_members (project_id, user_id, access_level) VALUES ($1, $2, $3)",
      [projectId, ownerId, 'owner']
    );

    await client.query("COMMIT");
    return (projectRes.rows[0] as ProjectType) || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const fetchProjectsByOwnerId = async (ownerId: string) => {
  const result = await pool.query(
    `SELECT p.*, pm.access_level 
     FROM projects p 
     JOIN project_members pm ON p.id = pm.project_id 
     WHERE pm.user_id = $1`,
    [ownerId]
  );
  return result.rows || [];
};

export const fetchProjectById = async (projectId: string) => {
  const result = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
  return result.rows[0] || null;
};

/**
 * Renames or updates project description
 */
export const updateProjectMetadata = async (
  projectId: string,
  name: string,
  description: string
) => {
  const result = await pool.query(
    "UPDATE projects SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
    [name, description, projectId]
  );
  return result.rows[0] as ProjectType;
};

export const getProjectAccess = async (userId: string, projectId: string) => {
  const cacheKey = `access:${userId}:${projectId}`;

  // Try to get from Redis
  const cachedAccess = await redis.get(cacheKey);
  if (cachedAccess) {
    console.log("Redis Cache Hit!");
    return cachedAccess; 
  }

  // Cache Miss - Go to Postgres
  console.log("Postgres Query...");
  const result = await pool.query(
    "SELECT access_level FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId]
  );

  const accessLevel = result.rows[0]?.access_level || "none";

  // Store in Redis for 1 hour (3600 seconds)
  await redis.setex(cacheKey, 3600, accessLevel);

  return accessLevel;
};

/**
 * Finds the projectId associated with a specific fileId
 */
export const getProjectIdByFileId = async (fileId: string): Promise<string | null> => {
  const result = await pool.query(
    "SELECT project_id FROM files WHERE id = $1",
    [fileId]
  );
  return result.rows[0]?.project_id || null;
};

export const inviteUserByEmail = async (
  projectId: string,
  email: string,
  accessLevel: "view" | "edit" | "admin" = "edit",
  inviterId?: string,
) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email
  const userResult = await pool.query(
    "SELECT id, name, email FROM users WHERE email = $1",
    [normalizedEmail],
  );
  const user = userResult.rows[0];

  if (!user) {
    // Pending invite (user has no account yet)
    const token = randomUUID();
    const payload = JSON.stringify({
      projectId,
      email: normalizedEmail,
      accessLevel,
      inviterId: inviterId || null,
      createdAt: new Date().toISOString(),
    });
    // 7 days
    await redis.setex(`invite:${token}`, 60 * 60 * 24 * 7, payload);
    return {
      pending: true as const,
      token,
      email: normalizedEmail,
      message: "User not registered. Pending invite created.",
    };
  }

  // Already a member?
  const existing = await pool.query(
    "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, user.id],
  );
  if (existing.rows[0]) {
    return {
      alreadyMember: true as const,
      member: existing.rows[0],
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  // Add to project_members
  const memberResult = await pool.query(
    `INSERT INTO project_members (project_id, user_id, access_level)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id)
     DO UPDATE SET access_level = EXCLUDED.access_level
     RETURNING *`,
    [projectId, user.id, accessLevel],
  );

  // Clear access cache
  await redis.del(`access:${user.id}:${projectId}`);

  return {
    pending: false as const,
    member: memberResult.rows[0],
    user: { id: user.id, name: user.name, email: user.email },
  };
};

/** Accept a pending invite token (for users who registered after invite) */
export const acceptInviteByToken = async (token: string, userId: string) => {
  const raw = await redis.get(`invite:${token}`);
  if (!raw) {
    return { error: "INVALID_OR_EXPIRED" as const };
  }

  const data = JSON.parse(raw) as {
    projectId: string;
    email: string;
    accessLevel: "view" | "edit" | "admin";
  };

  // Ensure the logged-in user's email matches the invite
  const userRes = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [userId],
  );
  const user = userRes.rows[0];
  if (!user || user.email.toLowerCase() !== data.email.toLowerCase()) {
    return { error: "EMAIL_MISMATCH" as const };
  }

  const memberResult = await pool.query(
    `INSERT INTO project_members (project_id, user_id, access_level)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id)
     DO UPDATE SET access_level = EXCLUDED.access_level
     RETURNING *`,
    [data.projectId, userId, data.accessLevel],
  );

  await redis.del(`invite:${token}`);
  await redis.del(`access:${userId}:${data.projectId}`);

  const project = await fetchProjectById(data.projectId);

  return {
    member: memberResult.rows[0],
    projectId: data.projectId,
    projectName: project?.name,
    accessLevel: data.accessLevel,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

/** List members of a project */
export const getProjectMembers = async (projectId: string) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, pm.access_level as role, pm.created_at as "joinedAt"
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.access_level DESC, u.name ASC`,
    [projectId],
  );
  return result.rows;
};

export const updateMemberAccess = async (
  projectId: string, userId: string, newLevel: "view" | "edit" | "admin" | "owner",
) => {
  const result = await pool.query(
    `UPDATE project_members SET access_level = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *`,
    [newLevel, projectId, userId],
  );
  await redis.del(`access:${userId}:${projectId}`);   // cache turant clear
  return result.rows[0];
};

export const removeMember = async (projectId: string, userId: string) => {
  await pool.query(`DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`, [projectId, userId]);
  await redis.del(`access:${userId}:${projectId}`);
};