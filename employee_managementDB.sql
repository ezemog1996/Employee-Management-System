DROP DATABASE IF EXISTS employee_managementDB;

CREATE DATABASE employee_managementDB;

USE employee_managementDB;

CREATE TABLE employees(
	id INT AUTO_INCREMENT NOT NULL,
	first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE roles(
	id INT AUTO_INCREMENT NOT NULL,
	title VARCHAR(30) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE departments(
	id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

SELECT * FROM employees;
SELECT * FROM roles;
SELECT * FROM departments;