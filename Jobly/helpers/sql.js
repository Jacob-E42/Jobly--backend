const { BadRequestError } = require("../expressError");

/*
  Take data provided in an object and use it to return a SQL appropriate string 
  of specific columns to update in an UPDATE statement. 

  {firstName, lastName} -> {setCols: `first_name=$1, last_name=$2`, values: ['John', 'Smith']}

  An optional jsToSql paramter is an object which has the names of JS keys and the value set to the proper SQL equivalent.
  Ex: {firstName: "first_name"}

  If provided, the setCols string will use the SQL equivalent strings
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError("No data");

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);

	return {
		setCols: cols.join(", "),
		values: Object.values(dataToUpdate)
	};
}

function sqlForCompaniesFilters(filters) {
	const keys = Object.keys(filters);
}

module.exports = { sqlForPartialUpdate, sqlForCompaniesFilters };
