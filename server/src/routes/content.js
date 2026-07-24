import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  listContent,
  getContent,
  updateContent,
  deleteContent,
} from "../utils/firebaseUtils.js";

const router = express.Router();

// GET /api/v1/content - list generated content with optional filters
router.get("/", verifyToken, async (req, res) => {
  try {
    const { companyId, type, platform, status } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const filters = {};
    if (type) filters.type = type;
    if (platform) filters.platform = platform;
    if (status) filters.status = status;

    const content = await listContent(companyId, filters);

    res.json({ success: true, content, count: content.length });
  } catch (error) {
    console.error("List content error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/content/:contentId - get single content item
router.get("/:contentId", verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const content = await getContent(companyId, contentId);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Get content error:", error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/v1/content/:contentId - update content (status, favorite, edits)
router.put("/:contentId", verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { companyId, ...updates } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    await updateContent(companyId, contentId, updates);

    res.json({ success: true, contentId, message: "Content updated" });
  } catch (error) {
    console.error("Update content error:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/v1/content/:contentId - permanently delete content
router.delete("/:contentId", verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    await deleteContent(companyId, contentId);

    res.json({ success: true, message: "Content deleted" });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
