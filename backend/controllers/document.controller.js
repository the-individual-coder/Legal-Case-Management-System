const {Document} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class DocumentController extends BaseController {
    constructor(){
        super(Document)
    }

    async getDocuments(){
        const document = await Document.findAll()
        console.log("the document")
        return this.createResponse(document)
    }
}
