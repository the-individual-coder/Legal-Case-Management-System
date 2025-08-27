const {Calendarevent} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class CalendareventController extends BaseController {
    constructor(){
        super(Calendarevent)
    }

    async getCalendarevents(){
        const calendarevent = await Calendarevent.findAll()
        console.log("the calendarevent")
        return this.createResponse(calendarevent)
    }
}
