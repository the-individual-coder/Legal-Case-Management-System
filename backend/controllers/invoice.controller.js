const {Invoice} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class InvoiceController extends BaseController {
    constructor(){
        super(Invoice)
    }

    async getInvoices(){
        const invoice = await Invoice.findAll()
        console.log("the invoice")
        return this.createResponse(invoice)
    }
}
