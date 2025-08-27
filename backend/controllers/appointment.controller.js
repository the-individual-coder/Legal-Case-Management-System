const {Appointment} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class AppointmentController extends BaseController {
    constructor(){
        super(Appointment)
    }

    async getAppointments(){
        const appointment = await Appointment.findAll()
        console.log("the appointment")
        return this.createResponse(appointment)
    }
}
