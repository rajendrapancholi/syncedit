import type { Response } from "express";
import {
  acceptInviteByToken,
  createProject,
  fetchProjectById,
  fetchProjectsByOwnerId,
  getProjectAccess,
  getProjectMembers,
  inviteUserByEmail,
  updateProjectMetadata,
} from "../services/project.service";
import type { AuthRequest } from "../types/express";
import { randomUUID } from "crypto";
import asyncHandler from "../utils/asyncHandler";
import { getProjectTree } from "../services/file.service";
import { getIO } from "../sockets/socket";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectName, projectDesc } = req.body;
  const userId = req.user?.id;

  if (!projectName || !userId) {
    return res.status(400).json({ message: "Name and User ID required" });
  }

  const projectId = randomUUID(); // Generate here to return to frontend
  const project = await createProject(
    projectName,
    projectId,
    userId,
    projectDesc,
  );

  res.status(201).json({
    message: "Project initialized",
    projectId: project.id,
  });
});

export const getProjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const projects = await fetchProjectsByOwnerId(userId);
      return res.json({ projects });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export const updateMetadata = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (!projectId || !name || !description) {
      return res.status(400).json({
        message: "Project ID, name, and description are all required!",
      });
    }

    const updated = await updateProjectMetadata(projectId, name, description);

    res.json({ message: "Project updated", project: updated });
  },
);

export const checkProjectAccess = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.body.projectId || req.params.projectId;
    const userId = req.user?.id;

    if (!projectId || !userId) {
      return res
        .status(400)
        .json({ message: "Project ID and User ID are required" });
    }

    const accessLevel = await getProjectAccess(userId, projectId);

    if (accessLevel === "none") {
      return res.status(403).json({
        authorized: false,
        message: "No access to this project",
      });
    }

    return res.json({
      authorized: true,
      accessLevel,
    });
  } catch (error) {
    console.error("Access Controller Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during access check" });
  }
};

export const getProjectDetails = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res
      .status(400)
      .json({ message: "Project ID and User ID are required" });
  }

  try {
    // Fetch Project Metadata
    const project = await fetchProjectById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Fetch File Tree
    const tree = await getProjectTree(projectId);

    // Return everything + the access level (injected by middleware)
    console.log("tree: ", tree)
    return res.json({
      message: "success",
      project,
      tree,
      accessLevel: req.user?.projectAccess, // 'owner', 'edit', 'view'
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const inviteMember = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const projectId = req.params.projectId || req.body.projectId;
    const email = (req.body.email || "").trim();
    const accessLevel = (req.body.role || req.body.accessLevel || "edit") as
      | "view"
      | "edit"
      | "admin";

    if (!projectId) {
      return res.status(400).json({ message: "Project id is required!" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required!" });
    }

    const result = await inviteUserByEmail(
      projectId,
      email,
      accessLevel,
      req.user?.id,
    );

    if ("error" in result && result.error === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // Pending (user not registered yet)
    if ("pending" in result && result.pending) {
      // Optional: send email with link `${FRONTEND}/invite/${result.token}`
      return res.status(200).json({
        message:
          "Invite created. User is not registered yet — share the invite link or they will get access after signing up.",
        pending: true,
        token: result.token,
        // frontend can build: /invite/{token}
      });
    }

    if ("alreadyMember" in result && result.alreadyMember) {
      return res.status(200).json({
        message: "User is already a member of this project",
        member: result.member,
      });
    }

    const { member, user } = result as {
      member: any;
      user: { id: string; name: string; email: string };
    };

    // LIVE NOTIFICATIONS 
    try {
      const io = getIO();
      const project = await fetchProjectById(projectId);
      const inviterName = req.user?.email || "A collaborator";

      // Notify the invited user (personal room)
      io.to(`user:${user.id}`).emit("notification", {
        type: "invite",
        message: `You were invited to "${project?.name || "a project"}"`,
        projectId,
        projectName: project?.name,
        accessLevel,
        from: inviterName,
        timestamp: Date.now(),
      });

      // Notify everyone currently in the project room
      io.to(projectId).emit("member-joined", {
        user: { id: user.id, name: user.name, email: user.email },
        accessLevel,
        message: `${user.name} was added to the project`,
        timestamp: Date.now(),
      });

      // Also push a system notification into the project room
      io.to(projectId).emit("notification", {
        type: "system",
        message: `${user.name} joined the project`,
        projectId,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error("Socket notify error (invite):", e);
    }

    return res.status(200).json({
      message: "Member invited successfully",
      member,
      user,
    });
  },
);

/** Accept pending invite by token */
export const acceptInvite = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.body;
    const userId = req.user?.id;

    if (!token || !userId) {
      return res.status(400).json({ message: "Token and auth required" });
    }

    const result = await acceptInviteByToken(token, userId);

    if ("error" in result) {
      if (result.error === "INVALID_OR_EXPIRED") {
        return res.status(400).json({ message: "Invite is invalid or expired" });
      }
      if (result.error === "EMAIL_MISMATCH") {
        return res
          .status(403)
          .json({ message: "This invite was sent to a different email" });
      }
      return res.status(400).json({ message: "Could not accept invite" });
    }

    // Live notify project room that they joined
    try {
      const io = getIO();
      io.to(result.projectId).emit("member-joined", {
        user: result.user,
        accessLevel: result.accessLevel,
        message: `${result.user.name} joined the project`,
        timestamp: Date.now(),
      });
      io.to(result.projectId).emit("notification", {
        type: "system",
        message: `${result.user.name} joined the project`,
        projectId: result.projectId,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error("Socket notify error (accept):", e);
    }

    return res.json({
      message: "Successfully joined the project",
      projectId: result.projectId,
      projectName: result.projectName,
      accessLevel: result.accessLevel,
    });
  },
);

/** List project members */
export const listMembers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ message: "Project id required" });
    }
    const members = await getProjectMembers(projectId);
    return res.json({ members });
  },
);