//allowable query keys
const INCLUDE = "include";
const LIMIT = "limit";
const PAGE = "page";
const ORDER = "order";
const SEARCH = "search";
const DATE_RANGE = "date_range";
const KEYWORD = "keyword";

const QUERIES = [INCLUDE, LIMIT, PAGE, ORDER];

//defaults
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 0;
const DEFAULT_ORDER = [['createdAt', 'DESC']];

const LoggerClass = require("./Logger.js");

module.exports = class BaseController {
  constructor(model) {
    if (model) {
      this.model = model;
      this.logger = LoggerClass;
    }
  }

  async find(req) {
    try {
      const options = this.constructOptions(req);
      const results = await this.model.findAndCountAll(options);
      return this.createResponse(results);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  async findById(req) {
    try {
      const results = await this.model.findByPk(req.params.id);
      return this.createResponse(results);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  async create(req) {
    try {
      let data = req.body;
      if (req.user) data.createdById = req.user.id;
      const results = await this.model.create(data);
      return this.createResponse(results);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  async update(req) {
    try {
      const id = req.params.id;
      const data = req.body;
      if (req.user) data.modifiedById = req.user.id;
      data.modifiedDate = new Date();
      await this.model.update(data, { where: { id } });
      const updated = await this.model.findByPk(id);
      return this.createResponse(updated);
    } catch (error) {
      return this.createResponse(null, error);
    }
  }

  constructSort(sortBy) {
    if (!sortBy) return DEFAULT_ORDER;
    return sortBy.split(",").map((srt) => {
      const [field, order = 'ASC'] = srt.split(":");
      return [field, order.toUpperCase()];
    });
  }

  constructSearch(req) {
    const where = {};
    const fields = req.query[SEARCH];

    if (fields) {
      fields.split(",").forEach((field) => {
        const [key, value] = field.split(":");
        if (value?.startsWith(".*") && value.endsWith(".*")) {
          where[key] = { [require("sequelize").Op.like]: `%${value.slice(2, -2)}%` };
        } else {
          where[key] = value;
        }
      });
    }

    const date_ranges = req.query[DATE_RANGE];
    if (date_ranges) {
      date_ranges.split(",").forEach((range) => {
        const [field, from, to] = range.split(":");
        where[field] = {
          ...(from && { [require("sequelize").Op.gte]: new Date(`${from}T00:00:00.000+08:00`) }),
          ...(to && { [require("sequelize").Op.lte]: new Date(`${to}T23:59:59.000+08:00`) }),
        };
      });
    }

    return where;
  }

  constructOptions(req) {
    const where = this.constructSearch(req);
    const order = this.constructSort(req.query.sort);
    const limit = req.query.paginate == "false" ? null : parseInt(req.query.limit) || DEFAULT_LIMIT;
    const page = parseInt(req.query.page) || 1;
    const offset = limit ? (page - 1) * limit : null;

    const options = { where, order };
    if (limit !== null) options.limit = limit;
    if (offset !== null) options.offset = offset;

    if (req.query[INCLUDE]) {
      options.include = req.query[INCLUDE].split(",").map((model) => ({ association: model }));
    }

    return options;
  }

  createResponse(results, error) {
    const response = {};
    if (error) {
      response.message = this.getError(error);
      response.error = error;
      response.status = error.status || (error.errors ? 422 : 500);
    } else if (results && typeof results.count !== 'undefined') {
      response.data = results.rows;
      response.count = results.count;
    } else {
      response.data = results;
    }
    return response;
  }

  getError(err) {
    let message = "We've encountered some issues. Please try again later.";
    if (err?.message) message = err.message;
    return message;
  }
};
