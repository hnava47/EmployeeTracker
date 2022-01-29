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

const viewEmp = async() => {
  try {
    const getEmpQuery = 'SELECT * FROM employee;';
    const [employees] = await connection.query(getEmpQuery);
    console.table(employees);
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
            }
          ]).then(async(response) => {

          });
      }
    });
};

getQuestion();
