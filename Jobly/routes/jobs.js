"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNewSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const { JsonWebTokenError } = require("jsonwebtoken");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, jobNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (err) {
		return next(err);
	}
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle  }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
	try {
		let jobs;
		// if there are filters provided in the search query string
		if (Object.keys(req.query).length !== 0) {
			//only these filters are allowed, otherwise a BadRequestError is thrown
			const acceptedParams = ["title", "minSalary", "hasEquity"];
			const params = req.query;
			for (let param in params) {
				if (!acceptedParams.includes(param)) return next(new BadRequestError("That is not a valid query parameter"));
			}
			jobs = await Job.findAll(params);
		} else {
			jobs = await Job.findAll();
		}

		return res.json({ jobs });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

// /** PATCH /[handle] { fld1, fld2, ... } => { company }
//  *
//  * Patches company data.
//  *
//  * fields can be: { name, description, numEmployees, logo_url }
//  *
//  * Returns { handle, name, description, numEmployees, logo_url }
//  *
//  * Authorization required: login
//  */

// router.patch("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
// 	try {
// 		const validator = jsonschema.validate(req.body, companyUpdateSchema);
// 		if (!validator.valid) {
// 			const errs = validator.errors.map((e) => e.stack);
// 			throw new BadRequestError(errs);
// 		}

// 		const company = await Company.update(req.params.handle, req.body);
// 		return res.json({ company });
// 	} catch (err) {
// 		return next(err);
// 	}
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: login
//  */

// router.delete("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
// 	try {
// 		await Company.remove(req.params.handle);
// 		return res.json({ deleted: req.params.handle });
// 	} catch (err) {
// 		return next(err);
// 	}
// });

module.exports = router;
