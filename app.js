const mysql = require('mysql');
const inquirer = require('inquirer');
require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,

    user: 'root',

    password: '!UCSD_fall@2020!',

    database: 'employee_managementDB',
});

connection.connect((err) => {
    if (err) throw err;
    const connected = console.log('connected as id ' + connection.threadId);
    start()
});

function start() {
    connection.query("SELECT * FROM roles", function(err,res) {
        if (err) throw err;
        global.roles = res;
        if (roles !== []) {
            global.roleNames = [];
        }
    });
    connection.query("SELECT roles.id, title, name FROM roles INNER JOIN departments ON roles.department_id = departments.id", function(err, res) {
        if (err) throw err;
        global.rolesDepartments = res
        for (i = 0; i < rolesDepartments.length; i++) {
            roleNames.push(rolesDepartments[i].title + " - " + rolesDepartments[i].name);
        };
    });
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;
        global.departments = res;
    });
    connection.query("SELECT * FROM employees", function(err, res) {
        if (err) throw err;
        global.employees = res;
        global.employeeNames = [];
        for (i = 0; i < employees.length; i++) {
            employeeNames.push(employees[i].first_name + " " + employees[i].last_name);
        }
    });
    connection.query("SELECT employees.id, first_name, last_name, role_id, manager_id, title, salary, department_id, name FROM departments, employees, roles WHERE roles.id = role_id and roles.department_id = departments.id and roles.title = 'Manager'", function(err, res) {
        if (err) throw err;
        global.managers = res;
        global.managerNames = [];
        for (i = 0; i < managers.length; i++) {
            var oneManagerName = managers[i].first_name + " " + managers[i].last_name + " - " + managers[i].name;
            managerNames.push(oneManagerName);
        }
        ask();
    })
};

function ask() {
    inquirer
        .prompt([
            {
                type : 'list',
                message: 'What would you like to access?',
                name: 'chooseAccess',
                choices: ['Departments', 'Employees', 'Roles', 'I am finished here']
            }
        ]).then((answers) => {
            switch(answers.chooseAccess) {
                case 'Departments': 
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'What would you like to do?',
                                name: 'departmentActions',
                                choices: ['Add a Department', 'View All Departments', 'View Department Budgets', 'Delete a Department']
                            }
                        ]).then((answers) => departmentFunction(answers.departmentActions));
                break
                case 'Employees': if (roles.length && departments.length) {
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'What would you like to do?',
                                name: 'employeeActions',
                                choices: ['Add an Employee', 'View All Employees', 'View Employees by Manager', 'Update Employee Roles', 'Update Employee Managers', 'Delete an Employee']
                            }
                        ]).then((answers) => employeeFunction(answers.employeeActions))
                } else {
                    console.log("Please make sure you have at least\n1 department\n1 role\nfor your new employee to fill");
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000)
                };
                break
                case 'Roles': if (departments.length) {
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'What would you like to do?',
                                name: 'roleActions',
                                choices: ['Add a Role', 'View All Roles', 'Delete a Role']
                            }
                        ]).then((answers) => roleFunction(answers.roleActions));
                } else {
                    console.log("Please make sure you have at least\n1 department\nfor your new role to be a part of");
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000)
                }
                break
                default: connection.end();
            };
        });
};

function departmentFunction(departmentAnswer) {
    switch(departmentAnswer) {
        case 'Add a Department':
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'New Department Name: ',
                    name: 'departmentName'
                }
            ]).then((answer) => {
                var set = {
                    name: answer.departmentName
                };
                add('departments', set);
            });
        break
        case 'View All Departments': console.table('Several objects', departments);
            var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000);
        break
        case 'View Department Budgets': console.log("You chose " + departmentAnswer);
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a department:",
                    name: "departmentBudget",
                    choices: departments
                }
            ]).then(function(answer) {
                connection.query("SELECT employees.id, first_name, last_name, role_id, manager_id, title, salary, name FROM departments, employees, roles WHERE roles.id = role_id and roles.department_id = departments.id and name = ?", [answer.departmentBudget], function(err, res) {
                    if (err) throw err;
                    var departmentBudget = 0;
                    for (i = 0; i < res.length; i++) {
                        departmentBudget+=res[i].salary;
                    };
                    console.log(answer.departmentBudget + " Budget: $" + departmentBudget);
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000);
                })
            })
        break
        case 'Delete a Department':
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a department to delete:",
                    name: "departmentDelete",
                    choices: departments
                }
            ]).then(function(answer) {
                connection.query("DELETE FROM departments WHERE name = ?", [answer.departmentDelete], function(err, res) {
                    if (err) throw err;
                    console.log("Deleted " + answer.departmentDelete + ".");
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 1000);
                })
            })
        break
    };
};

function employeeFunction(employeeAnswer) {
    switch(employeeAnswer) {
        case 'Add an Employee':
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'First Name of New Employee: ',
                    name: 'employeeFirst'
                },
                {
                    type: 'input',
                    message: 'Last Name of New Employee',
                    name: 'employeeLast'
                },
                {
                    type: 'list',
                    message: 'Select the Role of the New Employee: ',
                    name: 'employeeRole',
                    choices: roleNames
                },
                {
                    type: 'list',
                    message: 'Select the Manager of New Employee (if no choices then you must add a manager - "type ctrl + c" then "node app" to start over): ',
                    name: 'employeeManager',
                    choices: managerNames,
                    when: (answer) => answer.employeeRole.split(" - ")[0] != "Manager"
                }
            ]).then((answer) => {
                var employeeRoleID;
                for (i = 0; i < roles.length; i++) {
                    if (answer.employeeRole.split(" - ")[0] === rolesDepartments[i].title && answer.employeeRole.split(" - ")[1] === rolesDepartments[i].name) {
                        employeeRoleID = rolesDepartments[i].id;
                        break;
                    }
                }
                var employeeManagerID;
                if (answer.employeeManager) {
                    for (i = 0; i < managers.length; i++) {
                        if (answer.employeeManager.split(" - ")[0] === managers[i].first_name + " " + managers[i].last_name && answer.employeeManager.split(" - ")[1] === managers[i].name) {
                            employeeManagerID = managers[i].id;
                            break;
                        }
                    }
                }
                if (answer.employeeRole.split(" - ")[0] === "Manager") {
                    var set = {
                        first_name: answer.employeeFirst,
                        last_name: answer.employeeLast,
                        role_id: employeeRoleID,
                        manager_id: 0
                    }
                } else {
                    var set = {
                        first_name: answer.employeeFirst,
                        last_name: answer.employeeLast,
                        role_id: employeeRoleID,
                        manager_id: employeeManagerID
                    }
                }
                add('employees', set);
            });
        break
        case 'View All Employees': console.table('Several objects', employees);
            var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000);
        break
        case 'View Employees by Manager':
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a manager:",
                    name: "employeeManager",
                    choices: managerNames
                }
            ]).then(function(answer) {
                for (i = 0; i < managers.length; i++) {
                    if (answer.employeeManager.split(" - ")[0] === managers[i].first_name + " " + managers[i].last_name && answer.employeeManager.split(" - ")[1] === managers[i].name) {
                        managerID = managers[i].id;
                        break;
                    }
                };
                connection.query("Select * FROM employees WHERE manager_id = ?", [managerID], function(err, res) {
                    if (err) throw err;
                    if (res.length) {
                        console.table('Several objects', res);
                        var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000);
                    }
                    else {
                        console.log("The manager you selected has no employees reporting to him/her.");
                        console.log();
                        var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000);
                    }
                })
            })
        break
        case 'Update Employee Roles':
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select an employee:",
                    name: "employeeUpdateRole",
                    choices: employeeNames
                },
                {
                    type: "list",
                    message: "Select the employee's new role:",
                    name: "employeeRole",
                    choices: roleNames
                }
            ]).then(function(answer) {
                var employeeRoleID;
                for (i = 0; i < roles.length; i++) {
                    if (answer.employeeRole.split(" - ")[0] === rolesDepartments[i].title && answer.employeeRole.split(" - ")[1] === rolesDepartments[i].name) {
                        employeeRoleID = rolesDepartments[i].id;
                        break;
                    }
                };
                connection.query("UPDATE employees SET role_id = ? WHERE first_name = ? and last_name = ?", [employeeRoleID, answer.employeeUpdateRole.split(" ")[0], answer.employeeUpdateRole.split(" ")[1]], function(err, res) {
                    if (err) throw err;
                    console.log("Updated " + answer.employeeUpdateRole + "'s role to " + answer.employeeRole);
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 1000);
                })
            })
        break
        case 'Update Employee Managers':
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select an employee:",
                    name: "employeeUpdateManager",
                    choices: employeeNames
                },
                {
                    type: "list",
                    message: "Select the employee's new manager:",
                    name: "employeeManager",
                    choices: managerNames
                }
            ]).then(function(answer) {
                var managerID;
                for (i = 0; i < managers.length; i++) {
                    if (answer.employeeManager.split(" - ")[0] === managers[i].first_name + " " + managers[i].last_name && answer.employeeManager.split(" - ")[1] === managers[i].name) {
                        managerID = managers[i].id;
                        break;
                    }
                };
                connection.query("UPDATE employees SET manager_id = ? WHERE first_name = ? and last_name = ?", [managerID, answer.employeeUpdateManager.split(" ")[0], answer.employeeUpdateManager.split(" ")[1]], function(err, res) {
                    if (err) throw err;
                    console.log("Updated " + answer.employeeUpdateManager + "'s manager to " + answer.employeeManager);
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 1000);
                })
            })
    };
};

function roleFunction(roleAnswer) {
    switch(roleAnswer) {
        case 'Add a Role': inquirer.prompt([
            {
                type: 'input',
                message: 'New Role Name: ',
                name: 'roleName'
            },
            {
                type: 'number',
                message: 'New Role Salary (simply enter a whole number): ',
                name: 'roleSalary',
            },
            {
                type: 'list',
                message: 'Select the Department of the New Role: ',
                name: 'roleDepartment',
                choices: departments
            }
        ]).then((answer) => {
            connection.query("SELECT id FROM departments WHERE ?", {name: answer.roleDepartment}, function(err, res) {
                if (err) throw err;
                var set = {
                    title: answer.roleName,
                    salary: answer.roleSalary,
                    department_id: res[0].id
                }
                add('roles', set);
            });
        });;
        break
        case 'View All Roles': console.table('Several objects', roles);
            var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 3000);
        break
        case 'Delete a Role':
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a role to delete:",
                    name: "roleDelete",
                    choices: roleNames
                }
            ]).then(function(answer) {
                var roleID;
                for (i = 0; i < rolesDepartments.length; i++) {
                    if (answer.roleDelete === rolesDepartments[i].title + " - " + rolesDepartments[i].name) {
                        roleID = rolesDepartments[i].id;
                        break
                    }
                }
                connection.query("DELETE FROM roles WHERE id = ?", [roleID], function(err, res) {
                    if (err) throw err;
                    console.log("Deleted " + answer.roleDelete + ".")
                    console.log();
                    var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 1000);
                })
            })
        break
    };
};

function add(item, set) {
    connection.query("INSERT INTO " + item + " SET ?", set, function(err, res) {
        if (err) throw err;
        console.log("Added to " + item + "!");
        console.log();
        var waitConsoleLog = setInterval(function() {start(); clearInterval(waitConsoleLog)}, 1000);
    });
};