const {Lawyerrecommendation} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class LawyerrecommendationController extends BaseController {
    constructor(){
        super(Lawyerrecommendation)
    }

    async getLawyerrecommendations(){
        const lawyerrecommendation = await Lawyerrecommendation.findAll()
        console.log("the lawyerrecommendation")
        return this.createResponse(lawyerrecommendation)
    }
}
