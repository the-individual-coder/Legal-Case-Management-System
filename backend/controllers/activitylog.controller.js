const {Activitylog} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class ActivitylogController extends BaseController {
    constructor(){
        super(Activitylog)
    }

    async getActivitylogs(){
        const activitylog = await Activitylog.findAll()
        console.log("the activitylog")
        return this.createResponse(activitylog)
    }
}
