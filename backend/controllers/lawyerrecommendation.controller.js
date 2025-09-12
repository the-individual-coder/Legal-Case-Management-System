const { LawyerRecommendation, Case, User } = require("../models");
const BaseController = require("../utils/BaseController");

module.exports = class LawyerrecommendationController extends BaseController {
  constructor() {
    super(LawyerRecommendation);
  }

  async getLawyerrecommendations() {
    const lawyerrecommendation = await LawyerRecommendation.findAll();
    console.log("the lawyerrecommendation");
    return this.createResponse(lawyerrecommendation);
  }

  // Recommend lawyers for a case
  async recommend(req, res) {
    try {
      const { caseId, userId } = req.params;

      const caseData = await Case.findByPk(caseId);
      console.log("the case data", caseData);
      if (!caseData) {
        return this.createResponse({
          success: false,
          message: "Case not found",
        });
      }

      // Fetch all lawyers
      const lawyers = await User.findAll({
        where: { role: "lawyer", status: "active" },
      });

      // Simple scoring (later: add ML or workload check)
      const recommendations = lawyers.map((lawyer) => ({
        lawyerId: lawyer.id,
        lawyerName: lawyer.name,
        score: Math.floor(Math.random() * 100), // placeholder score
        notes: `Auto-recommended for case ${caseData.title}`,
      }));

      // Save recommendations
      for (const rec of recommendations) {
        await LawyerRecommendation.create({
          caseId,
          lawyerId: rec.lawyerId,
          score: rec.score,
          notes: rec.notes,
        });
      }

      await this.logActivity({
        userId,
        action: "recommend",
        targetType: "Case",
        targetId: caseId,
        details: `Generated lawyer recommendations for case ${caseId}`,
      });

      return this.createResponse({
        success: true,
        data: recommendations,
        message: "Recommendations generated",
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // Confirm lawyer assignment
  async assign(req, res) {
    try {
      const { caseId, lawyerId, userId } = req.body;

      const caseData = await Case.findByPk(caseId);
      if (!caseData) {
        return this.createResponse({
          success: false,
          message: "Case not found",
        });
      }

      caseData.assignedLawyerId = lawyerId;
      await caseData.save();

      await this.logActivity({
        userId,
        action: "assign",
        targetType: "Case",
        targetId: caseId,
        details: `Assigned lawyer ${lawyerId} to case ${caseId}`,
      });

      return this.createResponse({
        success: true,
        data: caseData,
        message: "Lawyer assigned to case",
      });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }
};
