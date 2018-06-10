var inquirer = require('inquirer');
var mysql = require("mysql");
require("dotenv").config();
const cTable = require("console.table");
var values = [];
var departmentNames = [];
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.password,

    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    question();
});

function viewProducts() {
    values = [];
    var query = "SELECT departments.department_id, departments.department_name, departments.overhead_cost, SUM(products.product_sales) AS sales,(SUM(products.product_sales)-departments.overhead_cost) AS profits FROM departments INNER JOIN products ON departments.department_name=products.department_name GROUP BY department_id";

    connection.query(query, function (error, results) {
        if (error) throw error;
        for (var i = 0; i < results.length; i++) {
        values.push([results[i].department_id, results[i].department_name, results[i].overhead_cost, results[i].sales, results[i].profits]);
        };
        console.table(["Department Id", "Department", "Over Head", "Product Sales", "Profit"], values);
        next();
    });
};
    function createDepartment() {
        departmentNames = []; 
        connection.query("SELECT department_name FROM departments", function (error, results) {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                departmentNames.push(results[i].department_name);
            };
        })
        inquirer.prompt([
            {
                name: "department",
                type: "input",
                message: "What is the name of the new Department?",
                validate: function (department) {
                    if (isNaN(department) === true) {
                        for (var i = 0; i < departmentNames.length; i++) {
                            if (departmentNames[i] === department) {
                                console.log("\nThat Department alread exists");
                                return false;
                            };
                            return true;
                        };
                        
                    };
                }
            }, {
                name: "overhead",
                type: "input",
                message: "What is the over head cost of the department?",
                validate: function (overhead) {
                    if (isNaN(overhead) === false && Number.isInteger(parseInt(overhead))) {
                        return true;
                    }
                    return false;
                }
            },
        ]).then(function (answer) {
            var query = connection.query(
                "INSERT INTO departments SET ?",
                {
                    department_name: answer.department,
                    overhead_cost: answer.overhead,
                },
                function (err, res) {
                    console.log(res.affectedRows + " A new Department has been added called " + answer.department + " With a Over Head of " + answer.overhead);
                    next();
                }
            )
        })
    }
    function question() {
        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "What would you like to do?",
                choices: ["View Product Sales by Department", "Create New Department"]
            },
        ]).then(function (answer) {
            switch (answer.choice) {
                case "View Product Sales by Department":
                    return viewProducts();
                case "Create New Department":
                    return createDepartment();
            };
        });
    };
    function next() {
        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "Would you like to check more Departments?",
                choices: ["YES", "NO"]

            },
        ]).then(function (answer) {
            switch (answer.choice) {
                case "YES":
                    return question();
                case "NO":
                    return connection.end();
            }
        });
    };