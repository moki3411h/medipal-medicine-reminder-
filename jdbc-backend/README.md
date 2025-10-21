# JDBC Connectivity

This folder contains Java JDBC files for database connectivity.

## Files:
- **DatabaseConnection.java** - Establishes JDBC connection to MySQL
- **MedicineDAO.java** - Data Access Object for medicine operations

## Database Configuration:
- Database: MySQL
- JDBC URL: jdbc:mysql://localhost:3306/medipal_db
- Driver: com.mysql.cj.jdbc.Driver

## Features:
- Add medicine to database
- Retrieve medicine list
- Update medicine details
- Delete medicine records

All operations use JDBC PreparedStatement for security.
