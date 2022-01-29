const inquirer = require('inquirer');
const connection = require('./config');
require('console.table');

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
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
      }
    ]).then(async(response) => {
      if (response.action === 'Quit') {
        console.log('ok');
      } else if (response.action === 'View All Employees') {
        try {
          await viewEmp();
          await getQuestion();
        } catch (error) {
          console.log(e);
        }
      }
    });
};

getQuestion();
