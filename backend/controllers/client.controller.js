const {Client} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class ClientController extends BaseController {
    constructor(){
        super(Client)
    }

    async getClients(){
        const client = await Client.findAll()
        console.log("the client")
        return this.createResponse(client)
    }
}
