"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNewSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const company = await Company.create(req.body);
		return res.status(201).json({ company });
	} catch (err) {
		return next(err);
	}
});

// /** GET /  =>
//  *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
//  *
//  * Can filter on provided search filters:
//  * - minEmployees
//  * - maxEmployees
//  * - name (will find case-insensitive, partial matches)
//  *
//  * Authorization required: none
//  */

// router.get("/", async function (req, res, next) {
// 	try {
// 		let companies;
// 		// if there are filters provided in the search query string
// 		if (Object.keys(req.query).length !== 0) {
// 			//only these filters are allowed, otherwise a BadRequestError is thrown
// 			const acceptedParams = ["name", "minEmployees", "maxEmployees"];
// 			const params = req.query;
// 			for (let param in params) {
// 				if (!acceptedParams.includes(param)) return next(new BadRequestError("That is not a valid query parameter"));
// 			}
// 			companies = await Company.findAll(params);
// 		} else {
// 			companies = await Company.findAll();
// 		}

// 		return res.json({ companies });
// 	} catch (err) {
// 		return next(err);
// 	}
// });

// /** GET /[handle]  =>  { company }
//  *
//  *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
//  *   where jobs is [{ id, title, salary, equity }, ...]
//  *
//  * Authorization required: none
//  */

// router.get("/:handle", async function (req, res, next) {
// 	try {
// 		const company = await Company.get(req.params.handle);
// 		return res.json({ company });
// 	} catch (err) {
// 		return next(err);
// 	}
// });

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
