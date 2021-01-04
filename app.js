const mysql = require('mysql');
const inquirer = require('inquirer');

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
            for (i = 0; i < roles.length; i++) {
                roleNames.push(roles[i].title)
            }
        }
    });
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;
        global.departments = res;
        if (departments !== []) {
            global.departmentNames = [];
            for (i = 0; i < departments.length; i++) {
                departmentNames.push(departments[i].name)
            }
        }
    });
    connection.query("SELECT * FROM employees", function(err, res) {
        if (err) throw err;
        global.employees = res;
        if (employees !== []) {
            global.managers = [];
            for (i = 0; i < employees.length; i++) {
                for (j = 0; j < roles.length; j++) {
                    if (employees[i].role_id === roles[i].id) {
                        managers.push(employees[i])
                    }
                }
            }
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
                        console.log("Please make sure you have at least\n1 department\n1 role for your new employee to fill");
                        var waitConsoleLog = setInterval(function() {ask(); clearInterval(waitConsoleLog)}, 3000)
                    };
                break
                case 'Roles': 
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'What would you like to do?',
                                name: 'roleActions',
                                choices: ['Add a Role', 'View All Roles', 'Delete a Role']
                            }
                        ]).then((answers) => roleFunction(answers.roleActions));
                break
                default: connection.end();
            };
        });
};

function departmentFunction(departmentAnswer) {
    switch(departmentAnswer) {
        case 'Add a Department': inquirer.prompt([
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
        case 'View All Departments': console.log("You chose " + departmentAnswer);
        break
        case 'View Department Budgets': console.log("You chose " + departmentAnswer);
        break
        case 'Delete a Department': console.log("You chose " + departmentAnswer);
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
                message: 'Select the Manager of New Employee: ',
                name: 'employeeManager',
                choices: managers,
                when: (answer) => answer.employeeRole != "Manager"
            }
        ]).then((answer) => {
            // var set = {
            //     first_name: answer.employeeFirst,
            //     last_name: answer.employeeLast,
            //     role_id: employeeRoleID
            //     manager_id:
            // }
            // add('employees', set);
        });
        break
        case 'View All Employees': console.log("You chose " + employeeAnswer);
        break
        case 'View Employees by Manager': console.log("You chose " + employeeAnswer);
        break
        case 'Update Employee Roles': console.log("You chose " + employeeAnswer);
        break
        case 'Update Employee Managers': console.log("You chose " + employeeAnswer);
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
                choices: departmentNames
            }
        ]).then((answer) => {
            connection.query("SELECT id FROM departments WHERE ?", {name: answer.roleDepartment}, function(err, res) {
                if (err) throw err;
                console.log(res[0].id)
                
                var set = {
                    title: answer.roleName,
                    salary: answer.roleSalary,
                    department_id: res[0].id
                }
                add('roles', set);
            });
        });;
        break
        case 'View All Roles': console.log("You chose " + roleAnswer);
        break
        case 'Delete a Role': console.log("You chose " + roleAnswer);
        break
    };
};

function add(item, set) {
    connection.query("INSERT INTO " + item + " SET ?", set, function(err, res) {
        if (err) throw err;
        console.log("Added to " + item + "!");
        start()
    });
};