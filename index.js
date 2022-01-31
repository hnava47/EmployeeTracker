const inquirer = require('inquirer');
const connection = require('./config');
require('console.table');

const questions = ['View All Employees', 'View Employees by Manager', 'View Employees by Department', 'Add Employee', 'Update Employee Role', 'Update Employee Manager', 'Delete Employee', 'View All Roles', 'Add Role', 'Delete Role', 'View All Departments', 'Add Department', 'Delete Department', 'View Utilized Budget of Department','Quit']

const getRoles = async() => {
  const getRolesQuery = 'SELECT title FROM role;';
  const [roles] = await connection.query(getRolesQuery);

  let totalRoles = [];
  for (let i=0; i<roles.length; i++) {
    totalRoles.push(roles[i].title.toString());
  }

  return totalRoles;
};

const getEmployees = async() => {
  const getEmpQuery = 'SELECT CONCAT(first_name, " ", last_name) name FROM employee;';
  const [employees] = await connection.query(getEmpQuery);

  let totalEmp = [];
  for (let i=0; i<employees.length; i++) {
    totalEmp.push(employees[i].name.toString());
  }

  return totalEmp;
};

const getManagers = async() => {
  const getManagerQuery = 'SELECT CONCAT(first_name, " ", last_name) name FROM employee;';
  const [managers] = await connection.query(getManagerQuery);

  let totalManagers = ['None'];
  for (let i=0; i<managers.length; i++) {
    totalManagers.push(managers[i].name.toString());
  }

  return totalManagers;
};

const getDepartments = async() => {
  try {
    const getDepartmentQuery = 'SELECT * FROM department;';
    const [departments] = await connection.query(getDepartmentQuery);

    let totalDepts = [];
    for (let i=0; i<departments.length; i++) {
      totalDepts.push(departments[i].name.toString());
    }

    return totalDepts;
  } catch (e) {
    console.log(e);
  }
};

const viewEmp = async() => {
  try {
    const getEmpQuery = 'SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, " ", m.last_name) manager FROM role r, department d, employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.role_id = r.id AND r.department_id = d.id ORDER BY e.id;';
    const [employees] = await connection.query(getEmpQuery);
    console.table(employees);
  } catch (e) {
    console.log(e);
  }
};

const viewRoles = async() => {
  try {
    const getAllRolesQuery = 'SELECT r.id, r.title, r.salary, d.name department FROM role r, department d WHERE r.department_id = d.id ORDER BY r.id;';
    const [allRoles] = await connection.query(getAllRolesQuery);
    console.table(allRoles);
  } catch (e) {
    console.log(e);
  }
};

const viewDept = async() => {
  try {
    const getAllDeptQuery = 'SELECT * FROM department;';
    const [departments] = await connection.query(getAllDeptQuery);
    console.table(departments);
  } catch (e) {
    console.log(e);
  }
};

const getQuestion = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'action',
        choices: questions
      }
    ]).then(async(response) => {
      if (response.action === 'Quit') {
        console.log('Exiting program');
        process.exit();
      } else if (response.action === questions[0]) {
        try {
          await viewEmp();
        } catch (error) {
          console.log(e);
        }

        await getQuestion();
      } else if (response.action === questions[1]) {
        inquirer
          .prompt([
            {
              type: 'list',
              message: 'Select Manager',
              name: 'manager',
              choices: getManagers
            }
          ]).then(async(response) => {
            if (response.manager === 'None') {
              whereClause = 'e.manager_id IS NULL;';
            } else {
              whereClause = `CONCAT(m.first_name, " ", m.last_name) = '${response.manager}';`
            }

            try {
              const getEmpByManager = 'SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, " ", m.last_name) manager FROM role r, department d, employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.role_id = r.id AND r.department_id = d.id AND ' + whereClause;
              const [empByManger] = await connection.query(getEmpByManager);

              console.table(empByManger);
            } catch (e) {
              console.log(e);
            }

            await getQuestion();
          });
      } else if (response.action === questions[2]) {
        inquirer
          .prompt([
            {
              type: 'list',
              message: 'Select Department',
              name: 'department',
              choices: getDepartments
            }
          ]).then(async(response) => {
            try {
              const getEmpByDept = 'SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, " ", m.last_name) manager FROM role r, department d, employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.role_id = r.id AND r.department_id = d.id AND d.name = ?';
              const [empByDept] = await connection.query(getEmpByDept, response.department);

              console.table(empByDept);
            } catch (e) {
              console.log(e);
            }

            await getQuestion();
          });
      } else if (response.action === questions[3]) {
        inquirer
          .prompt([
            {
              type: 'input',
              message: "What is the employee's first name?",
              name: 'firstName'
            },
            {
              type: 'input',
              message: "What is the employee's last name?",
              name: 'lastName'
            },
            {
              type: 'list',
              message: "What is the employee's role?",
              name: 'role',
              choices: getRoles
            },
            {
              type: 'list',
              message: "Who is the employee's manager?",
              name: 'manager',
              choices: getManagers
            }
          ]).then(async(response) => {
            try {
              const insertEmp = 'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, NULL);';
              const roleIdQuery = 'SELECT id FROM role WHERE title = ?;';
              const [roleId] = await connection.query(roleIdQuery, response.role);

              if (response.manager === 'None') {
                await connection.query(insertEmp, [response.firstName, response.lastName, roleId[0].id]);
              } else {
                const managerName = response.manager.split(' ');
                const managerIdQuery = 'SELECT id FROM employee WHERE first_name = ? AND last_name = ?;';
                const [managerId] = await connection.query(managerIdQuery, [managerName[0], managerName[1]]);

                await connection.query(insertEmp, [response.firstName, response.lastName, roleId[0].id, managerId[0].id]);
              }

              console.log(`Added ${response.firstName} ${response.lastName} to the database`);
            } catch (e) {
              console.log(e);
            }

            await getQuestion();
          });
      } else if (response.action === questions[4]) {
        inquirer
          .prompt([
            {
              type: 'list',
              message: 'Which employee needs role update?',
              name: 'employee',
              choices: getEmployees
            },
            {
              type: 'list',
              message: "What is the employee's new role?",
              name: 'newRole',
              choices: getRoles
            }
          ]).then(async(response) => {
            try {
              const empName = response.employee.split(' ');
              const updateRoleQuery = 'UPDATE employee SET role_id = ? WHERE id = ?;';
              const roleIdQuery = 'SELECT id FROM role WHERE title = ?;';
              const empIdQuery = 'SELECT id FROM employee WHERE first_name = ? AND last_name = ?;';

              const [roleId] = await connection.query(roleIdQuery, response.newRole);
              const [empId] = await connection.query(empIdQuery, [empName[0], empName[1]]);
              await connection.query(updateRoleQuery, [roleId[0].id, empId[0].id]);

              console.log(`Updated ${response.employee}'s role to ${response.newRole} in the database`);
            } catch (e) {
              console.log(e);
            }

            await getQuestion();
          });
      } else if (response.action === questions[5]) {
        inquirer
          .prompt([
            {
              type: 'list',
              message: 'Which employee needs manager update?',
              name: 'employee',
              choices: getEmployees
            },
            {
              type: 'list',
              message: "Who is the employee's new manager?",
              name: 'newManager',
              choices: getManagers
            }
          ]).then(async(response) => {
            try {
              const empName = response.employee.split(' ');
              const empIdQuery = 'SELECT id FROM employee WHERE first_name = ? AND last_name = ?;';
              const [empId] = await connection.query(empIdQuery, [empName[0], empName[1]]);

              if (response.newManager === 'None') {
                const updateRoleQuery = 'UPDATE employee SET manager_id = NULL WHERE id = ?;';

                await connection.query(updateRoleQuery, empId[0].id);
              } else {
                const managerName = response.newManager.split(' ');
                const updateRoleQuery = 'UPDATE employee SET manager_id = ? WHERE id = ?;';
                const [managerId] = await connection.query(empIdQuery,[managerName[0], managerName[1]]);

                await connection.query(updateRoleQuery, [managerId[0].id, empId[0].id]);
              }

              console.log(`Updated ${response.employee}'s manager to ${response.newManager} in the database`);
            } catch (e) {
              console.log(e);
            }

            await getQuestion();
          });
      } else if (response.action === questions[6]) {
        inquirer
          .prompt([
            {
              type: 'list',
              message: 'Which employee do you want to delete?',
              name: 'employee',
              choices: getEmployees
            }
          ]).then(async(response) => {
            inquirer
              .prompt([
                {
                  type: 'list',
                  message: `You are about to delete ${response.employee}, are you sure you want to continue?`,
                  name: 'delete',
                  choices: ['Yes', 'No']
                }
              ]).then(async(resp) => {
                if (resp.delete === 'Yes') {
                  try {
                    const empName = response.employee.split(' ');
                    const deleteEmp = 'DELETE FROM employee WHERE id = ?;';
                    const empIdQuery = 'SELECT id FROM employee WHERE first_name = ? AND last_name = ?;';

                    const [empId] = await connection.query(empIdQuery, [empName[0], empName[1]]);
                    await connection.query(deleteEmp, empId[0].id);

                    console.log(`${response.employee} was deleted from the database`);
                  } catch (e) {
                    console.log(e);
                  }
                }

                await getQuestion();
              })
          });
      } else if (response.action === questions[7]) {
        try {
          await viewRoles();
        } catch (e) {
          console.log(e);
        }

        await getQuestion();
      } else if (response.action === questions[8]) {
        inquirer
          .prompt([
            {
              type: 'input',
              message: 'What is the name of the role?',
              name: 'roleName'
            },
            {
              type: 'input',
              message: 'What is the salary of the role?',
              name: 'salary'
            },
            {
              type: 'list',
              message: 'Which department does the role belong to?',
              name: 'department',
              choices: getDepartments
            }
          ]).then(async(response) => {
            if (parseFloat(response.salary) >= 0) {
              try {
                const insertRole = 'INSERT INTO role(title, salary, department_id) VALUES(?, ?, ?);';
                const getDeptId = 'SELECT id FROM department WHERE name = ?;';

                const [deptId] = await connection.query(getDeptId, response.department);
                await connection.query(insertRole, [response.roleName, response.salary, deptId[0].id]);

                console.log(`Added ${response.roleName} to the database`);
              } catch (e) {
                console.log(e);
              }
            } else {
              console.log('error: Salary must be a number greater than or equal to 0');
            }

            getQuestion();
          });
      } else if (response.action === questions[9]) {
        inquirer
          .prompt([
            {
              type: 'list',
              message: 'Which role do you want to delete?',
              name: 'role',
              choices: getRoles
            }
          ]).then(async(response) => {
            inquirer
              .prompt([
                {
                  type: 'list',
                  message: `You are about to delete ${response.role}, are you sure you want to continue?`,
                  name: 'delete',
                  choices: ['Yes', 'No']
                }
              ]).then(async(resp) => {
                if (resp.delete === 'Yes') {
                  try {
                    const deleteRole = 'DELETE FROM role WHERE title = ?;';
                    await connection.query(deleteRole, response.role);

                    console.log(`${response.role} was deleted from the database`);
                  } catch (e) {
                    console.log(e);
                  }
                }

                await getQuestion();
              })
          });
      } else if (response.action === questions[10]) {
        try {
          await viewDept();
        } catch (e) {
          console.log(e);
        }

        await getQuestion();
      } else if (response.action === questions[11]) {
        inquirer
          .prompt([
            {
              type: 'input',
              message: 'What is the name of the department?',
              name: 'department'
            }
          ]).then(async(response) => {
            try {
              const insertDept = 'INSERT INTO department(name) VALUES(?);';
              await connection.query(insertDept, response.department);

              console.log(`Added ${response.department} to the database`);
            } catch (e) {
              console.log(e);
            }

            await getQuestion();
          });
      } else if (response.action === questions[12]) {

      } else if (response.action === questions[13]) {

      }
    });
};

console.log(`
,-------------------------------------------------------.
|                                                       |
|     _____                 _                           |
|    | ____|_ __ ___  _ __ | | ___  _   _  ___  ___     |
|    |  _| | '_ \` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\    |
|    | |___| | | | | | |_| | | (_) | |_| |  __/  __/    |
|    |_____|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|    |
|                    |_|            |___/               |
|     __  __                                            |
|    |  \\/  | __ _ _ __   __ _  __ _  ___ _ __          |
|    | |\\/| |/ _\` | '_ \\/  _\` |/ _\` |/ _ \\ '__|         |
|    | |  | | (_| | | | | (_| | (_| |  __/ |            |
|    |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|            |
|                              |___/                    |
|                                                       |
\`-------------------------------------------------------'
`);
getQuestion();
