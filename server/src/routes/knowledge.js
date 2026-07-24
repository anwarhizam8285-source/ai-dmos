import express from "express";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createKnowledge,
  getKnowledge,
  listKnowledge,
  updateKnowledge,
} from "../utils/firebaseUtils.js";

const router = express.Router();

// POST /api/v1/knowledge - Create knowledge document
router.post("/", verifyToken, async (req, res) => {
  try {
    const { companyId, title, content, category = "general", tags = [] } =
      req.body;

    if (!companyId || !title || !content) {
      return res.status(400).json({
        error: "Missing required fields: companyId, title, content",
      });
    }

    const documentId = `doc-${uuidv4().slice(0, 8)}`;

    const knowledgeData = {
      title,
      content,
      category,
      tags,
      version: 1,
      createdBy: req.user.uid,
      isPublished: true,
    };

    await createKnowledge(companyId, documentId, knowledgeData);

    res.status(201).json({
      success: true,
      documentId,
      document: { documentId, companyId, ...knowledgeData },
    });
  } catch (error) {
    console.error("Create knowledge error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/knowledge - List all knowledge documents
router.get("/", verifyToken, async (req, res) => {
  try {
    const { companyId, category } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const filters = category ? { category } : {};
    const knowledge = await listKnowledge(companyId, filters);

    res.json({
      success: true,
      documents: knowledge,
      count: knowledge.length,
    });
  } catch (error) {
    console.error("List knowledge error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/knowledge/:documentId - Get single knowledge document
router.get("/:documentId", verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const knowledge = await getKnowledge(companyId, documentId);

    if (!knowledge) {
      return res.status(404).json({ error: "Knowledge document not found" });
    }

    res.json({
      success: true,
      document: knowledge,
    });
  } catch (error) {
    console.error("Get knowledge error:", error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/v1/knowledge/:documentId - Update knowledge document
router.put("/:documentId", verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { companyId, title, content, category, tags } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (tags) updates.tags = tags;
    updates.updatedAt = new Date();

    await updateKnowledge(companyId, documentId, updates);

    res.json({
      success: true,
      documentId,
      message: "Knowledge updated",
    });
  } catch (error) {
    console.error("Update knowledge error:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/v1/knowledge/:documentId - Delete knowledge document
router.delete("/:documentId", verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId required" });
    }

    // Mark as deleted in Firestore
    await updateKnowledge(companyId, documentId, { isDeleted: true });

    res.json({
      success: true,
      message: "Knowledge deleted",
    });
  } catch (error) {
    console.error("Delete knowledge error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
