const { LawyerRecommendation, Case, User, Appointment } = require("../models");
const BaseController = require("../utils/BaseController");
const { Op } = require("sequelize");
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
      if (!caseData) {
        return this.createResponse({
          success: false,
          message: "Case not found",
        });
      }

      // Fetch all active lawyers
      const lawyers = await User.findAll({
        where: { role: "lawyer", status: "active" },
      });

      // Get the date range for this case (assuming the case has a startDate and endDate)
      const caseStartDate = caseData.startDate;
      const caseEndDate = caseData.endDate;

      // Calculate lawyer scores based on availability
      const recommendations = await Promise.all(
        lawyers.map(async (lawyer) => {
          // Fetch lawyer appointments within the case time frame
          const appointments = await Appointment.findAll({
            where: {
              lawyerId: lawyer.id,
              scheduledAt: {
                [Op.between]: [caseStartDate, caseEndDate],
              },
            },
          });

          // Calculate availability score (higher is more available)
          const availabilityScore = 100 - appointments.length * 10; // Simple scoring logic

          // Generate the recommendation object
          return {
            lawyerId: lawyer.id,
            lawyerName: lawyer.name,
            score: availabilityScore, // Add lawyer availability score
            notes: `Auto-recommended for case ${caseData.title} based on availability`,
          };
        })
      );

      // Sort lawyers by availability score (higher score = more available)
      recommendations.sort((a, b) => b.score - a.score);

      // Save recommendations
      for (const rec of recommendations) {
        await LawyerRecommendation.create({
          caseId,
          lawyerId: rec.lawyerId,
          score: rec.score,
          notes: rec.notes,
        });
      }

      // Log the activity
      await this.logActivity({
        userId,
        action: "recommend",
        targetType: "Case",
        targetId: caseId,
        details: `Generated lawyer recommendations for case ${caseId} based on availability`,
      });

      return this.createResponse({
        success: true,
        data: recommendations,
        message: "Recommendations generated based on availability",
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
