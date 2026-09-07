import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { injectProjectAccess, canEdit } from "../middlewares/accessMiddleware";
import { getTree, handleCreate, handleRemove, handleRename, handleUpdateContent } from "../controllers/file.controller";

const router = Router();

router.use(authMiddleware);

router.get("/tree/:projectId", injectProjectAccess, getTree);
router.post("/create", injectProjectAccess, canEdit, handleCreate);
router.patch("/rename/:id", injectProjectAccess, canEdit, handleRename);
router.put("/content/:id", injectProjectAccess, canEdit, handleUpdateContent);
router.delete("/:id", injectProjectAccess, canEdit, handleRemove);

export default router;