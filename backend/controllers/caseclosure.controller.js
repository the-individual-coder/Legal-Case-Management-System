const {Caseclosure} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class CaseclosureController extends BaseController {
    constructor(){
        super(Caseclosure)
    }

    async getCaseclosures(){
        const caseclosure = await Caseclosure.findAll()
        console.log("the caseclosure")
        return this.createResponse(caseclosure)
    }
}
