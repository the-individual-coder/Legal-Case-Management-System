const {Note} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class NoteController extends BaseController {
    constructor(){
        super(Note)
    }

    async getNotes(){
        const note = await Note.findAll()
        console.log("the note")
        return this.createResponse(note)
    }
}
