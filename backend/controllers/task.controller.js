const {Task} = require('../models')
const BaseController = require('../utils/BaseController')

module.exports = class TaskController extends BaseController {
    constructor(){
        super(Task)
    }

    async getTasks(){
        const task = await Task.findAll()
        console.log("the task")
        return this.createResponse(task)
    }
}
