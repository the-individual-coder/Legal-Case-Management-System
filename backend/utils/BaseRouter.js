let controller;
let mappings = [];

const GET = 'get'
const POST = 'post'
const PUT = 'put'
const PATCH = 'patch'

const express = require('express')

module.exports = class BaseRouter {
    /**
     * 
     * @param {Controller} controller 
     */
    constructor(controller) {
        this.controller = controller
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.getId = this.getId.bind(this);
        this.update = this.update.bind(this);
    }

    /**
     * @description GET route
     * @param {HttpRequest} req 
     * @param {HttpResponse} res 
     * @param {*} next 
     */
    // @API({path:'/', method:'get'}) //- proposed decorator usage [WIP] -abalita
    async get(req, res, next) {
        let response = await this.controller.find(req)
        res.status((response && response.status) || 200).json(response)
    }

    /**
     * @description POST route
     * @param {HttpRequest} req 
     * @param {HttpResponse} res 
     * @param {*} next 
     */
    async post(req, res, next) {
        let response = await this.controller.create(req)
        res.status(response.status || 200).json(response)
    }

    /**
     * @description GET route (/:id) 
     * @param {HttpRequest} req 
     * @param {HttpResponse} res 
     * @param {*} next 
     */
    async getId(req, res, next) {
        let response = await this.controller.findById(req)
        res.status(response.status || 200).json(response)
    }

    /**
     * @description PUT route (/:id) 
     * @param {HttpRequest} req 
     * @param {HttpResponse} res 
     * @param {*} next 
     */
    async update(req, res, next) {
        let response = await this.controller.update(req)
        res.status(response.status || 200).json(response)
    }


    /**
     * @description default mappings that will be inherited across all router class
     * @returns {Array} mappings
     */
    getMapping = () => {
        return [
            { method: GET, path: '/', function: this.get },
            { method: POST, path: '/', function: this.post },
            { method: GET, path: '/:id', function: this.getId },
            { method: PUT, path: '/:id', function: this.update },
        ]
    }

    /**
     * @description additional mappings placeholder, designed to be overriden
     * @returns {Array} mappings
     */
    getAdditionalMapping = () => {
        return []
    }


    /**
     * @description create the express router
     * @returns {Router} router
     */
    getRoutes() {
        const router = express.Router();
        this.getAdditionalMapping().forEach(mapping => {
            if (typeof mapping.function === "string") {
                router.route(mapping.path)[mapping.method](((req, res, next) => { this.auditLog(req, mapping); next() }), async (req, res) => {
                    let response = await this.controller[mapping.function](req)
                    res.status(response && response.status ? response.status : 200).json(response)
                })
            } else router.route(mapping.path)[mapping.method](((req, res, next) => { this.auditLog(req, mapping); next() }), mapping.function)
        })

        this.getMapping().forEach(mapping => {
            if (mapping.middleware) {
                router.route(mapping.path)[mapping.method](mapping.middleware, mapping.function)
            } else if (typeof mapping.function === "string") {
                router.route(mapping.path)[mapping.method](((req, res, next) => { this.auditLog(req, mapping); next() }), async (req, res) => {
                    let response = await this.controller[mapping.function](req)
                    console.log('response :>> ', response);
                    res.status(response && response.status ? response.status : 200).json(response)
                })

            } else {
                router.route(mapping.path)[mapping.method](((req, res, next) => { this.auditLog(req, mapping); next() }), mapping.function)
            }

        })


        // auto-mapping for decorators [WIP] - abalita
        // mappings.forEach(mapping=>{
        //     console.log('mapping :>> ', mapping);
        //     router.route(mapping.path)[mapping.method](mapping.function)
        // })
        return router;
    }

    auditLog(req, mapping) {
        console.log('###auditLog :>> ', req.originalUrl, mapping);
        // console.log('this.controller :>> ', this.controller.model.getFields);
    }
}

function API(config) {

    return function (target) {
        console.log('target :>> ', target);
        const original = target.descriptor.value;
        target.descriptor.value = function (...args) {
            console.log('arguments: ', args);
            const result = original.apply(this, args);
            console.log('result: ', result);
            return result;
        }

        mappings.push({
            method: config.method,
            path: config.path,
            function: target.descriptor.value
        })

        return target;

    }

}