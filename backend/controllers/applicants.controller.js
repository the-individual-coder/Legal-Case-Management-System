
const {Applicant} = require('../models')
const BaseController = require('../utils/BaseController')
module.exports = class ApplicantsController extends BaseController {
    constructor(){
        super(Applicant)
    }

    async getApplicants(){
        const applicants = await Applicant.findAll()
        console.log("the applicants")
        return this.createResponse(applicants)
    }
}

