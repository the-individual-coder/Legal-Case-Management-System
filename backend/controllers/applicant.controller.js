const {Applicant} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class ApplicantController extends BaseController {
    constructor(){
        super(Applicant)
    }

    async getApplicants(){
        const applicant = await Applicant.findAll()
        console.log("the applicant")
        return this.createResponse(applicant)
    }
}
