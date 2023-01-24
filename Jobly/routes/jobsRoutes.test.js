"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, u1Token, adminToken } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
	const newJob = {
		title: "New Job",
		salary: 50000,
		equity: "0.0",
		companyHandle: "c1"
	};

	test("ok for admin users", async function () {
		const resp = await request(app).post("/jobs").send(newJob).set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: { id: expect.any(Number), ...newJob }
		});
	});

	test("bad request with missing data", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
				handle: "new",
				numEmployees: 10
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request with invalid data", async function () {
		const resp = await request(app)
			.post("/jobs")
			.send({
				...newJob,
				title: 47
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

// /************************************** GET /companies */

describe("GET /jobs", function () {
	test("ok for anon", async function () {
		const resp = await request(app).get("/jobs");
		expect(resp.body).toEqual({
			jobs: [
				{
					id: 1,
					title: "Job1",
					salary: 10000,
					equity: "0.0",
					companyHandle: "c1"
				},
				{
					id: 2,
					title: "Job2",
					salary: 50000,
					equity: "0.2",
					companyHandle: "c2"
				},
				{
					id: 3,
					title: "Job3",
					salary: 100000,
					equity: "0.7",
					companyHandle: "c3"
				}
			]
		});
	});

	describe("uses filters accurately", function () {
		test("title filter works", async function () {
			let resp = await request(app).get(`/jobs`).query({ title: "J" });
			console.log(resp.body);
			expect(resp.body.jobs.length).toBe(3);
			resp = await request(app).get("/jobs").query({ title: "1" });
			expect(resp.body.jobs.length).toBe(1);
			expect(resp.body).toEqual({
				jobs: [
					{
						id: 1,
						title: "Job1",
						salary: 10000,
						equity: "0.0",
						companyHandle: "c1"
					}
				]
			});
			resp = await request(app).get("/jobs").query({ name: "s" });
			expect(resp.body.jobs).toBe(undefined);
		});
		test("minSalary filter works", async function () {
			let resp = await request(app).get("/jobs").query({ minSalary: 10000 });
			expect(resp.body.jobs.length).toBe(3);
			expect(resp.body).toEqual({
				jobs: [
					{
						id: 1,
						title: "Job1",
						salary: 10000,
						equity: "0.0",
						companyHandle: "c1"
					},
					{
						id: 2,
						title: "Job2",
						salary: 50000,
						equity: "0.2",
						companyHandle: "c2"
					},
					{
						id: 3,
						title: "Job3",
						salary: 100000,
						equity: "0.7",
						companyHandle: "c3"
					}
				]
			});
			resp = await request(app).get("/jobs").query({ minSalary: 60000 });
			expect(resp.body.jobs.length).toBe(1);
		});
		// test("maxEmployees filter works", async function () {
		// 	let resp = await request(app).get("/companies").query({ maxEmployees: 3 });
		// 	expect(resp.body.companies.length).toBe(3);
		// 	expect(resp.body).toEqual({
		// 		companies: [
		// 			{
		// 				handle: "c1",
		// 				name: "C1",
		// 				description: "Desc1",
		// 				numEmployees: 1,
		// 				logoUrl: "http://c1.img"
		// 			},
		// 			{
		// 				handle: "c2",
		// 				name: "C2",
		// 				description: "Desc2",
		// 				numEmployees: 2,
		// 				logoUrl: "http://c2.img"
		// 			},
		// 			{
		// 				handle: "c3",
		// 				name: "C3",
		// 				description: "Desc3",
		// 				numEmployees: 3,
		// 				logoUrl: "http://c3.img"
		// 			}
		// 		]
		// 	});
		// 	resp = await request(app).get("/companies").query({ maxEmployees: 0 });
		// 	expect(resp.body.companies.length).toBe(0);
		// });

		test("request with inappropriate filters fails w/ 400", async function () {
			let resp = await request(app).get("/jobs").query({ pickles: "gerkin" });

			expect(resp.statusCode).toEqual(400);
		});
	});

	test("fails: test next() handler", async function () {
		// there's no normal failure event which will cause this route to fail ---
		// thus making it hard to test that the error-handler works with it. This
		// should cause an error, all right :)
		await db.query("DROP TABLE companies CASCADE");
		const resp = await request(app).get("/companies").set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(500);
	});
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
	test("works for anon", async function () {
		const resp = await request(app).get(`/jobs/1`);
		expect(resp.body).toEqual({
			job: {
				id: 1,
				title: "Job1",
				salary: 10000,
				equity: "0.0",
				companyHandle: "c1"
			}
		});
	});

	test("not found for no such job", async function () {
		const resp = await request(app).get(`/jobs/0`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
	test("works for admin users", async function () {
		const resp = await request(app)
			.patch(`/jobs/1`)
			.send({
				title: "New Title"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			job: {
				id: 1,
				title: "New Title",
				salary: 10000,
				equity: "0.0",
				companyHandle: "c1"
			}
		});
	});

	test("unauth for anon", async function () {
		const resp = await request(app).patch(`/jobs/1`).send({
			title: "New Title"
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("not found on no such job", async function () {
		const resp = await request(app)
			.patch(`/jobs/0`)
			.send({
				title: "New Title"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});

	test("bad request on companyHandle change attempt", async function () {
		const resp = await request(app)
			.patch(`/jobs/1`)
			.send({
				companyHandle: "c5"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request on id change attempt", async function () {
		const resp = await request(app)
			.patch(`/jobs/1`)
			.send({
				id: 7
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request on invalid data", async function () {
		const resp = await request(app)
			.patch(`/jobs/1`)
			.send({
				title: 47
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
	test("works for admin users", async function () {
		const resp = await request(app).delete(`/jobs/1`).set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: "1" });
	});

	test("unauth for anon", async function () {
		const resp = await request(app).delete(`/jobs/1`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found for no such job", async function () {
		const resp = await request(app).delete(`/job/0`).set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});
