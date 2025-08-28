const { Users } = require("../models");
const BaseController = require("../utils/BaseController");
const { getPermissionsByRole } = require("../utils/rbac.ts");
module.exports = class UserController extends BaseController {
  constructor() {
    super(Users);
  }

  async getUsers() {
    const user = await Users.findAll();
    console.log("the user");
    return this.createResponse(user);
  }

  async syncUser(req, res) {
    try {
      const { email, name, image, providerId } = req.body;
      console.log("Request body:", req.body);

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find existing user by email
      let user = await Users.findOne({ where: { email } });
      console.log("the userr", user);
      if (!user) {
        // New user: create with default role 'client'
        user = await Users.create({
          email,
          name,
          image,
          role: "client",
          providerId, // store Google sub/id if available
          status: "active",
          permissions: getPermissionsByRole("client"), // initialize permissions
        });
      } else {
        // Existing user: update name/image if changed
        user.name = name || user.name;
        user.image = image || user.image;
        // Always update permissions based on current role
        user.permissions = getPermissionsByRole(user.role);

        await user.save();
      }

      // Ensure permissions are always returned
      const permissions = getPermissionsByRole(user.role);
      console.log("this is the user", user);
      return this.createResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
        image: user.image,
      });
    } catch (error) {
      console.error("syncUser error:", error);
      return this.createResponse({ error: "Internal server error" });
    }
  }
};
