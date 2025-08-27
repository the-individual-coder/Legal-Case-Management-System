const {User} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class UserController extends BaseController {
    constructor(){
        super(User)
    }

    async getUsers(){
        const user = await User.findAll()
        console.log("the user")
        return this.createResponse(user)
    }
}
