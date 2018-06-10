var inquirer = require('inquirer');
var mysql = require("mysql");
require("dotenv").config();
const cTable = require("console.table");
let itemId = [];
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.password,

    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    displayItems();
});
var values = [];
function displayItems() {
    values = [];
    itenid = [];
    connection.query("SELECT item_id, product_name, price FROM products", function (err, results) {
        if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                itemId.push(results[i].item_id);
                values.push([results[i].item_id, results[i].product_name, results[i].price]);
            }
            console.table(["Item Id", "Product", "Price"], values);
        selectItem();
    });

};
function selectItem() {
    inquirer.prompt([
        {
            name: "selection",
            type: "input",
            message: "What Item id would you like to purchase?",
            validate: function (selection) {

                if (isNaN(selection) === false) {

                    for (var i = 0; i < itemId.length; i++) {
                        if (parseInt(selection) === parseInt(itemId[i])) {
                            return true;
                        }
                    }
                    console.log("\nEnter a valid item id")
                    return false;
                }
            }
        }, {
            name: "number",
            type: "input",
            message: "How many of the selected item would you like to purchase?",
            validate: function (number) {
                if (isNaN(number) === false && Number.isInteger(parseInt(number)) === true) {
                    return true;
                }
                return false;

            }
        }
    ]).then(function (answer) {
        console.log(answer.selection);
        var query = "SELECT * FROM products WHERE item_id = ?";
        connection.query(query, [answer.selection], function (err, res) {
            if (err) throw err;
            if (parseInt(res[0].stock_quantity) < parseInt(answer.number)) {
                console.log("\nSorry we have Insuffiecient Stock to Fulfill your order");
                reorder();
            } else {
                var newQuantity = (parseInt(res[0].stock_quantity) - parseInt(answer.number));
                var total = (parseFloat(res[0].price) * parseInt(answer.number));
                var salesTotal = (parseFloat(res[0].product_sales) + parseFloat(total))
                updateStock(answer.selection, newQuantity, salesTotal);
                console.log("You Purchase: " + answer.number + " of " + res[0].product_name + " for a total of " + total.toFixed(2));
                
                reorder();
            };
        });
    });
};

function updateStock(selection, number, total) {
    connection.query(
        "UPDATE products SET ?, ? WHERE ?",
        [
            {
                stock_quantity: number
            },
            {
                product_sales: total
            },
            {
                item_id: selection
            }
        ],
    );
};
function reorder() {
    inquirer.prompt([
        {
            name: "choice",
            type: "list",
            message: "Would you Like to purchase another item?",
            choices: ["YES", "NO"]
        }
    ]).then(function (answer) {
      switch (answer.choice){
          case "YES":
          displayItems();
          break;

          case "NO":
          connection.end();
          break;
      }
    });
};