"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForJobsFilters } = require("../helpers/sql");

/** Related functions for jobs. */
class Job {
	/** Create a job (from data), update db, return new job data.
	 *
	 * data should be { title, salary, equity, company_handle }
	 *
	 * Returns { id, title, salary, equity, company_handle }
	 *
	 * Throws BadRequestError if job already in database.
	 * */

	static async create({ title, salary, equity, companyHandle }) {
		const duplicateCheck = await db.query(
			`SELECT title
           FROM jobs
           WHERE title = $1 AND company_handle=$2`,
			[title, companyHandle]
		);

		if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate job: ${title}`);

		const result = await db.query(
			`INSERT INTO jobs
           (title, salary, equity, company_handle )
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[title, salary, equity, companyHandle]
		);
		const job = result.rows[0];
		console.log(job);
		return job;
	}

	/** Find all jobs.
	 *
	 * Returns [{ id, title, salary, equity, company_handle }, ...]
	 * */

	static async findAll(filters = {}) {
		//uses helper method to get a list of where expressions for each filter, and a list of corresponding values
		const { whereExpressions, values } = sqlForJobsFilters(filters);
		let query = `SELECT id, title, salary, equity, company_handle AS "companyHandle"
                  FROM jobs`;

		//if there are filters, they are added to the query
		if (whereExpressions.length > 0) {
			query += " WHERE " + whereExpressions.join(" AND ");
		}
		query += ` ORDER BY name`;
		const jobs = await db.query(query, values);
		return jobs.rows;
	}

	/** Given a job title and companyHandle, return data about job.
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
	 *
	 * Throws NotFoundError if not found.
	 **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT  id, title, salary, equity, company_handle AS 'companyHandle'
           FROM jobs
           WHERE id = $1`,
			[id]
		);

		const job = jobRes.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Update job data with `data`.
	 *
	 * This is a "partial update" --- it's fine if data doesn't contain all the
	 * fields; this only changes provided ones.
	 *
	 * Data can include: { title, salary, equity }
	 *
	 * Returns { id, title, salary, equity, companyHandle }
	 *
	 * Throws NotFoundError if not found.
	 */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {
			companyHandle: "company_handle"
		});
		const idVarIdx = "$" + (values.length + 1);

		const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
		const result = await db.query(querySql, [...values, id]);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Delete given job from database; returns undefined.
	 *
	 * Throws NotFoundError if job not found.
	 **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
			[id]
		);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);
	}
}

module.exports = Job;
