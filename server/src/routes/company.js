import express from "express";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createCompany, getCompany, updateCompany } from "../utils/firebaseUtils.js";

const router = express.Router();

// POST /api/v1/company - Create company
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, email, website, description, industry, state, employees, createdBy } = req.body;

    if (!name || !email || !industry || !state) {
      return res.status(400).json({
        error: "Missing required fields: name, email, industry, state",
      });
    }

    const companyId = `company-${uuidv4().slice(0, 8)}`;

    const companyData = {
      name,
      email,
      website: website || null,
      description: description || null,
      industry,
      state,
      employees: parseInt(employees) || 1,
      plan: "starter",
      status: "active",
      apiKey: uuidv4(),
      maxUsers: 5,
      maxAgents: 3,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createCompany(companyId, companyData);

    res.status(201).json({
      success: true,
      companyId,
      company: companyData,
    });
  } catch (error) {
    console.error("Create company error:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/v1/company/:companyId - Get company
router.get("/:companyId", verifyToken, async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await getCompany(companyId);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/v1/company/:companyId - Update company
router.put("/:companyId", verifyToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const updates = req.body;

    const updatedCompany = await updateCompany(companyId, updates);

    res.json({
      success: true,
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
