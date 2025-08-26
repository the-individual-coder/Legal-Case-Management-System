const  { createLogger, format, transports } = require('winston')

/**
 * References:
 * https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html
 * https://stackify.com/node-js-logging/
 * https://www.npmjs.com/package/winston
 */
module.exports = class LoggerClass {

    constructor() {
    }

    /**
     * @description app logging setup
     * @param {Express} app 
     */
    static setup(app) {
        // Logger instance
        const levels = {
            "error": 0,
            "warn": 1,
            "info": 2
        }

        this.logger = createLogger({
            levels,
            transports: [
                new transports.File({ filename: 'error.log', dirname: 'logs', level: 'error' }),
                new transports.File({ filename: 'warn.log', dirname: 'logs', level: 'warn' }),
                new transports.File({ filename: 'info.log', dirname: 'logs', level: 'info' })
            ]
        });

        // add console logging
        if (process.env.APP_LOGGING) this.logger.add(new transports.Console({ format: format.cli() }));

        // log on request error
        app.use((err, req, res, next) => {
            this.error(err);
            next()
        })
    }

    static error(message) {
        this.logger.error(message instanceof Error ? message.stack : message)
    }

    static info(...message) {
        this.logger.info(message.join(" "))
    }

    static warn(...message) {
        this.logger.warn(message.join(" "))
    }

    static log(level, message, callback) {
        this.logger.log(level, message, callback)
    }

}