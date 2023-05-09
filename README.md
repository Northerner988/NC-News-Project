Instructions

1️⃣ In order to successfully connect to the databases locally, you must setup the necessary environment variables.

-Create two files in the root directory: .env.test and .env.development.

-The files contents should be formatted as follows:
Test file: PGDATABASE=database_name_here_test
Development file: PGDATABASE=database_name_here

-Replace database_name_here with the name of the database you are connecting to, this information can be found in the setup.sql file.
