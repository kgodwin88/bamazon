var inquirer = require('inquirer');
var mysql = require("mysql");
require("dotenv").config();
const cTable = require("console.table");
var itemId = [];
var values = [];
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.password,

    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    start();
});
function start() {
    inquirer.prompt([
        {
            name: "selection",
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View low Inventory", "Add to Inventory", "Add New Product"]
        },
    ]).then(function (answer) {
        switch (answer.selection) {
            case "View Products for Sale":
                return viewProducts();
            case "View low Inventory":
                return viewLowInventory();
            case "Add to Inventory":
                return addInventory();
            case "Add New Product":
                return addProduct();
        };
    });
};
function nextSelection() {
    inquirer.prompt([
        {
            name: "choice",
            type: "list",
            message: "Would you like to review more Inventory?",
            choices: ["YES", "NO"]

        },
    ]).then(function (answer) {
        switch (answer.choice) {
            case "YES":
                return start();
            case "NO":
                return connection.end();
        };
    });
};
function viewProducts() {
    displayItems();
    setTimeout(nextSelection, 250);

};

function viewLowInventory() {
    values = [];
    itemId = [];
    var query = "SELECT * FROM products HAVING(stock_quantity) <= 5";
            connection.query(query, function (error, results) {
                if (error) throw error;
                for (var i = 0; i < results.length; i++) {
            itemId.push(results[i].item_id);
            values.push([results[i].item_id, results[i].product_name, results[i].price, results[i].stock_quantity]);
        };
        console.table(["Item Id", "Product", "Price", "Quantity"], values);

        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                message: "Would you like to add inventory for an item?",
                choices: ["YES", "NO"]
            },
        ]).then(function (answer) {
            switch (answer.choice) {
                case "YES":
                    return updateInventory();
                case "NO":
                    return nextSelection();
            };
        });
    });
};
function updateInventory() {
    inquirer.prompt([
        {
            name: "item",
            type: "input",
            message: "What Item Id would you like to add inventory to?",
            validate: function (selection) {

                if (isNaN(selection) === false) {

                    for (var i = 0; i < itemId.length; i++) {
                        if (parseInt(selection) === parseInt(itemId[i])) {
                            return true;
                        };
                    };
                    console.log("\nEnter a valid item id")
                    return false;
                }
            }
        }, {
            name: "number",
            type: "input",
            message: "How much more inventory would you like to add to the selected item?",
            validate: function (number) {
                if (isNaN(number) === false && Number.isInteger(parseInt(number)) === true) {
                    return true;
                }
                return false;

            },
        },
    ]).then(function (answer) {
        var query = "SELECT * FROM products WHERE item_id = ?";
        connection.query(query, [answer.item], function (err, results) {
            var newQuantity = (parseInt(answer.number) + parseInt(results[0].stock_quantity));
            updateStock(answer.item, answer.number, results[0].product_name);

        });
    });
};
function updateStock(item, number, name) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: number
            },
            {
                item_id: item
            }
        ],
    );
    console.log("The new stock quantity is " + number + " for product " + name);
    nextSelection();
};
function addInventory() {
    displayItems();
    setTimeout(updateInventory, 500);
};
function addProduct() {
    itemId = [];
    var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
    connection.query(query, function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            itemId.push(results[i].item_id);
        };
    });
    inquirer.prompt([
        {
            name: "item",
            type: "input",
            message: "What is the Item Id of the New item?",
            validate: function (item) {
                if (isNaN(item) === false && Number.isInteger(parseInt(item)) === true) {
                    for (var i = 0; i < itemId.length; i++) {
                        if (parseInt(item) === parseInt(itemId[i])) {
                            console.log("\nThat Item Id has already been used");
                            return false;
                        }
                    }
                    return true;
                }
                return false;

            }
        },
        {
            name: "product",
            type: "input",
            message: "What is the name of the new item?",
            validate: function (product) {
                if (isNaN(product) === true) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "department",
            type: "input",
            message: "What is the name of the department for the new item?",
            validate: function (department) {
                if (isNaN(department) === true) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "price",
            type: "input",
            message: "What is the price of the new item?",
            validate: function (price) {
                if (isNaN(price) === false && Number.isInteger(parseInt(price)) === true) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "quantity",
            type: "input",
            message: "How much stock is available for the new Item?",
            validate: function (quantity) {
                if (isNaN(quantity) === false && Number.isInteger(parseInt(quantity)) === true) {
                    return true;
                }
                return false;
            }
        },

    ]).then(function (answer) {
        var query = connection.query(
            "INSERT INTO products SET ?",
            {
                item_id: answer.item,
                product_name: answer.product,
                department_name: answer.department,
                price: answer.price,
                stock_quantity: answer.quantity,
            },
            function (err, res) {
                console.log(res.affectedRows + " product added to stock!\n");
                nextSelection();
            })
    })
}
function displayItems() {
    values = [];
    itemId = [];
    var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
    connection.query(query, function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            itemId.push(results[i].item_id);
            values.push([results[i].item_id, results[i].product_name, results[i].price, results[i].stock_quantity]);
        };

        console.table(["Item Id", "Product", "Price", "Quantity"], values);
    });
};

