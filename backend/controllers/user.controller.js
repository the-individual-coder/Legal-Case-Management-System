const { User } = require("../models");
const BaseController = require("../utils/BaseController");
const { getPermissionsByRole } = require("../utils/rbac.js");

module.exports = class UserController extends BaseController {
  constructor() {
    super(User);
  }

  // GET /api/users?role=lawyer
  async getUsers(req, res) {
    try {
      const { role } = req.query;
      const where = {};
      if (role) where.role = role;

      const users = await User.findAll({
        where,
        attributes: ["id", "name", "email", "image", "role", "permissions"],
      });

      return this.createResponse({ success: true, data: users });
    } catch (err) {
      return this.createResponse({ success: false, message: err.message });
    }
  }

  // POST /api/users/sync
  async syncUser(req, res) {
    try {
      const { email, name, image, providerId } = req.body;
      console.log("Request body:", req.body);

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find existing user by email
      let user = await User.findOne({ where: { email } });
      console.log("Existing user:", user);

      if (!user) {
        // New user: default role 'client'
        const defaultRole = "client";
        user = await User.create({
          email,
          name,
          image,
          role: defaultRole,
          providerId,
          status: "active",
          permissions: getPermissionsByRole(defaultRole), // action-based perms
        });
      } else {
        // Update profile fields if changed
        user.name = name || user.name;
        user.image = image || user.image;

        // Always refresh permissions based on *current* role
        user.permissions = getPermissionsByRole(user.role);

        await user.save();
      }

      // Return normalized response
      const permissions = getPermissionsByRole(user.role);
      console.log("Synced permissions:", permissions);

      return this.createResponse({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions,
          image: user.image,
        },
      });
    } catch (error) {
      console.error("syncUser error:", error);
      return this.createResponse({
        success: false,
        message: "Internal server error",
      });
    }
  }
};
