"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companySearchSchema = require("../schemas/companySearchSchema.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, companyNewSchema);
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

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - name (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
	try {
		const params = req.query;

		// if there are filters provided in the search query string
		if (Object.keys(params).length !== 0) {
			if (params.maxEmployees) params.maxEmployees = +params.maxEmployees;
			if (params.minEmployees) params.minEmployees = +params.minEmployees;

			//only these filters are allowed, otherwise a BadRequestError is thrown
			const validator = jsonschema.validate(params, companySearchSchema);
			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}
		}
		console.log(params);
		const companies = await Company.findAll(params);

		return res.json({ companies });
	} catch (err) {
		return next(err);
	}
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
	try {
		const company = await Company.get(req.params.handle);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, companyUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const company = await Company.update(req.params.handle, req.body);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		await Company.remove(req.params.handle);
		return res.json({ deleted: req.params.handle });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
