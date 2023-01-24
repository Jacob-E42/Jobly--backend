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

	// 	describe("uses filters accurately", function () {
	// 		test("name filter works", async function () {
	// 			let resp = await request(app).get("/companies/").query({ name: "C" });
	// 			console.log(resp.body);
	// 			expect(resp.body.companies.length).toBe(4);
	// 			resp = await request(app).get("/companies").query({ name: "pan" });
	// 			expect(resp.body.companies.length).toBe(1);
	// 			expect(resp.body).toEqual({
	// 				companies: [{ handle: "c4", name: "Company1", numEmployees: 10, description: "Desc4", logoUrl: "http://c1.img" }]
	// 			});
	// 			resp = await request(app).get("/companies").query({ name: "sss" });
	// 			expect(resp.body.companies.length).toBe(0);
	// 		});
	// 		test("minEmployees filter works", async function () {
	// 			let resp = await request(app).get("/companies").query({ minEmployees: 3 });
	// 			expect(resp.body.companies.length).toBe(2);
	// 			expect(resp.body).toEqual({
	// 				companies: [
	// 					{ handle: "c3", name: "C3", numEmployees: 3, description: "Desc3", logoUrl: "http://c3.img" },
	// 					{ handle: "c4", name: "Company1", numEmployees: 10, description: "Desc4", logoUrl: "http://c1.img" }
	// 				]
	// 			});
	// 			resp = await request(app).get("/companies").query({ minEmployees: 15 });
	// 			expect(resp.body.companies.length).toBe(0);
	// 		});
	// 		test("maxEmployees filter works", async function () {
	// 			let resp = await request(app).get("/companies").query({ maxEmployees: 3 });
	// 			expect(resp.body.companies.length).toBe(3);
	// 			expect(resp.body).toEqual({
	// 				companies: [
	// 					{
	// 						handle: "c1",
	// 						name: "C1",
	// 						description: "Desc1",
	// 						numEmployees: 1,
	// 						logoUrl: "http://c1.img"
	// 					},
	// 					{
	// 						handle: "c2",
	// 						name: "C2",
	// 						description: "Desc2",
	// 						numEmployees: 2,
	// 						logoUrl: "http://c2.img"
	// 					},
	// 					{
	// 						handle: "c3",
	// 						name: "C3",
	// 						description: "Desc3",
	// 						numEmployees: 3,
	// 						logoUrl: "http://c3.img"
	// 					}
	// 				]
	// 			});
	// 			resp = await request(app).get("/companies").query({ maxEmployees: 0 });
	// 			expect(resp.body.companies.length).toBe(0);
	// 		});
	// 		test("minEmployees cannot be larger than maxEmployees", async function () {
	// 			let resp = await request(app).get("/companies").query({ minEmployees: 3, maxEmployees: 1 });
	// 			expect(resp.statusCode).toEqual(400);
	// 		});
	// 		test("request with inappropriate filters fails w/ 400", async function () {
	// 			let resp = await request(app).get("/companies").query({ pickles: "gerkin" });

	// 			expect(resp.statusCode).toEqual(400);
	// 		});
	// 	});

	// 	test("fails: test next() handler", async function () {
	// 		// there's no normal failure event which will cause this route to fail ---
	// 		// thus making it hard to test that the error-handler works with it. This
	// 		// should cause an error, all right :)
	// 		await db.query("DROP TABLE companies CASCADE");
	// 		const resp = await request(app).get("/companies").set("authorization", `Bearer ${u1Token}`);
	// 		expect(resp.statusCode).toEqual(500);
	// 	});
});

// /************************************** GET /companies/:handle */

// describe("GET /companies/:handle", function () {
// 	test("works for anon", async function () {
// 		const resp = await request(app).get(`/companies/c1`);
// 		expect(resp.body).toEqual({
// 			company: {
// 				handle: "c1",
// 				name: "C1",
// 				description: "Desc1",
// 				numEmployees: 1,
// 				logoUrl: "http://c1.img"
// 			}
// 		});
// 	});

// 	test("works for anon: company w/o jobs", async function () {
// 		const resp = await request(app).get(`/companies/c2`);
// 		expect(resp.body).toEqual({
// 			company: {
// 				handle: "c2",
// 				name: "C2",
// 				description: "Desc2",
// 				numEmployees: 2,
// 				logoUrl: "http://c2.img"
// 			}
// 		});
// 	});

// 	test("not found for no such company", async function () {
// 		const resp = await request(app).get(`/companies/nope`);
// 		expect(resp.statusCode).toEqual(404);
// 	});
// });

// /************************************** PATCH /companies/:handle */

// describe("PATCH /companies/:handle", function () {
// 	test("works for admin users", async function () {
// 		const resp = await request(app)
// 			.patch(`/companies/c1`)
// 			.send({
// 				name: "C1-new"
// 			})
// 			.set("authorization", `Bearer ${adminToken}`);
// 		expect(resp.body).toEqual({
// 			company: {
// 				handle: "c1",
// 				name: "C1-new",
// 				description: "Desc1",
// 				numEmployees: 1,
// 				logoUrl: "http://c1.img"
// 			}
// 		});
// 	});

// 	test("unauth for anon", async function () {
// 		const resp = await request(app).patch(`/companies/c1`).send({
// 			name: "C1-new"
// 		});
// 		expect(resp.statusCode).toEqual(401);
// 	});

// 	test("not found on no such company", async function () {
// 		const resp = await request(app)
// 			.patch(`/companies/nope`)
// 			.send({
// 				name: "new nope"
// 			})
// 			.set("authorization", `Bearer ${adminToken}`);
// 		expect(resp.statusCode).toEqual(404);
// 	});

// 	test("bad request on handle change attempt", async function () {
// 		const resp = await request(app)
// 			.patch(`/companies/c1`)
// 			.send({
// 				handle: "c1-new"
// 			})
// 			.set("authorization", `Bearer ${adminToken}`);
// 		expect(resp.statusCode).toEqual(400);
// 	});

// 	test("bad request on invalid data", async function () {
// 		const resp = await request(app)
// 			.patch(`/companies/c1`)
// 			.send({
// 				logoUrl: "not-a-url"
// 			})
// 			.set("authorization", `Bearer ${adminToken}`);
// 		expect(resp.statusCode).toEqual(400);
// 	});
// });

// /************************************** DELETE /companies/:handle */

// describe("DELETE /companies/:handle", function () {
// 	test("works for admin users", async function () {
// 		const resp = await request(app).delete(`/companies/c1`).set("authorization", `Bearer ${adminToken}`);
// 		expect(resp.body).toEqual({ deleted: "c1" });
// 	});

// 	test("unauth for anon", async function () {
// 		const resp = await request(app).delete(`/companies/c1`);
// 		expect(resp.statusCode).toEqual(401);
// 	});

// 	test("not found for no such company", async function () {
// 		const resp = await request(app).delete(`/companies/nope`).set("authorization", `Bearer ${adminToken}`);
// 		expect(resp.statusCode).toEqual(404);
// 	});
// });
