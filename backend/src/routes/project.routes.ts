import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { acceptInvite, checkProjectAccess, create, getProjectDetails, getProjects, inviteMember, listMembers, updateMetadata } from "../controllers/project.controller";
import { canEdit, injectProjectAccess } from "../middlewares/accessMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/get-projects", getProjects);
router.post("/check-access", checkProjectAccess); 
router.post("/create", create);

router.post("/invite", injectProjectAccess, canEdit, inviteMember);
router.post("/:projectId/invite", injectProjectAccess, canEdit, inviteMember);
router.post("/accept-invite", acceptInvite);

router.get(
  "/members/:projectId",
  injectProjectAccess,
  listMembers,
);

router.get("/get-project/:projectId", injectProjectAccess, getProjectDetails);
router.patch(
  "/:projectId/metadata",
  injectProjectAccess,
  canEdit,
  updateMetadata,
);

export default router;

