const inquirer = require('inquirer');
const connection = require('./config');
require('console.table');

const questions = ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']

const getRoles = async() => {
  const getRolesQuery = 'SELECT title FROM role;';
  const [roles] = await connection.query(getRolesQuery);

  let totalRoles = [];
  for (let i=0; i<roles.length; i++) {
    totalRoles.push(roles[i].title.toString());
  }

  return totalRoles;
};

const getManagers = async() => {
  const getManagerQuery = 'SELECT CONCAT(first_name, " ", last_name) name FROM employee;';
  const [managers] = await connection.query(getManagerQuery);

  let totalManagers = ['None'];
  for (let i=0; i<managers.length; i++) {
    totalManagers.push(managers[i].name.toString());
  }

  return totalManagers;
}

const viewEmp = async() => {
  try {
    const getEmpQuery = 'SELECT e.id, e.first_name, e.last_name, r.title, d.name department, r.salary, CONCAT(m.first_name, " ", m.last_name) manager FROM role r, department d, employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.role_id = r.id AND r.department_id = d.id;';
    const [employees] = await connection.query(getEmpQuery);
    console.table(employees);
  } catch (e) {
    console.log(e);
  }
};

const viewRoles = async() => {
  try {
    const getAllRolesQuery = 'SELECT r.id, r.title, r.salary, d.name department FROM role r, department d WHERE r.department_id = d.id;';
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
          await getQuestion();
        } catch (error) {
          console.log(e);
        }
      } else if (response.action === questions[1]) {
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
              const managerName = response.manager.split(' ');
              const insertEmp = 'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?);';
              const roleIdQuery = 'SELECT id FROM role WHERE title = ?;';
              const managerIdQuery = 'SELECT id FROM employee WHERE first_name = ? AND last_name = ?;';

              const [roleId] = await connection.query(roleIdQuery, response.role);
              const [managerId] = await connection.query(managerIdQuery, [managerName[0], managerName[1]]);
              await connection.query(insertEmp, [response.firstName, response.lastName, roleId[0].id, managerId[0].id]);

              console.log(`Added ${response.firstName} ${response.lastName} to the database`);

              getQuestion();
            } catch (e) {
              console.log(e);
            }
          });
      } else if (response.action === questions[2]) {
        console.log('test');
      } else if (response.action === questions[3]) {
        try {
          await viewRoles();
          await getQuestion();
        } catch (e) {
          console.log(e);
        }
      } else if (response.action === questions[4]) {
        console.log('test');
      } else if (response.action === questions[5]) {
        try {
          await viewDept();
          await getQuestion();
        } catch (e) {
          console.log(e);
        }
      } else if (response.action === questions[6]) {
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

              getQuestion();
            } catch (e) {
              console.log(e);
            }
          });
      }
    });
};

getQuestion();
