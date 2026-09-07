import pool from '../config/db';

export type ChatMessageRow = {
  id: string;
  project_id: string;
  user_id: string | null;
  username: string;
  message: string;
  created_at: Date;
};

export const saveChatMessage = async (msg: {
  id: string;
  projectId: string;
  userId?: string | null;
  username: string;
  message: string;
  timestamp?: number;
}) => {
  const createdAt = msg.timestamp ? new Date(msg.timestamp) : new Date();
  await pool.query(
    `INSERT INTO chat_messages (id, project_id, user_id, username, message, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      msg.id,
      msg.projectId,
      msg.userId || null,
      msg.username,
      msg.message,
      createdAt,
    ],
  );
};

export const getRecentChatMessages = async (projectId: string, limit = 100) => {
  const result = await pool.query<ChatMessageRow>(
    `SELECT * FROM chat_messages
     WHERE project_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [projectId, limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    username: row.username,
    message: row.message,
    timestamp: new Date(row.created_at).getTime(),
  }));
};
