# Backend APIs for Grace and Cindy

## Setup

### Database Maintenance and Testing

Download MySQL Workbench

Add a new MySQL connection
* Look at the ".env" file in the "backend" folder.
* "Hostname" in MySQL should be the value of DB_HOST in the .env
* "Port" in MySQL should be the value of DB_PORT in the .env
* "Username" in MySQL should be the value of DB_USER in the .env
* "Password" in MySQL should be the value of DB_PASSWORD in the .env

Verify that the MySQL connection works by clicking "Test Connection"
* If the connection fails, its likely that the database is not actually running on AWS.
* To check if the server is running, log in to the upenn-cis-4000-group-007-f24 AWS account
* NOTE: You may need to ask Vivi for an MFA code
* Navigate to "RDS" > "Databases" and verify eduquestdb is running and available
Hit "OK" in MySQL
Open up the DB in MySQL workbench

MySQL Workbench Usage
* NOTE: We use the CANVAS_TOKEN as the Account_Id in the SQL table. So, you can't make multiple accounts with the same Canvas token. This means that every time you want to sign up with the same Canvas token, you first have to remove the account from the database as follows.
* First, type "USE EDUQUEST_DB" and hit the lightning icon
* To view the accounts in the table:
"SELECT *
FROM Account_Info"
* To clear the accounts from the table:
"DELETE FROM Account_Info"
* NOTE: if you get an error when trying to delete from the table, input just this command:
"SET SQL_SAFE_UPDATES = 0;"

Congrats! You're now able to access the database and list/remove account entries.

### Running the servers

Step 1: Run both servers:
* canvas_server.js
* db_server.js

Create 2 terminals. Cd into the backend directory.

In terminal 1, run "node canvas_server.js" to start the canvas server.
* This file contains the necessary calls to the Canvas API.
In terminal 2, run "node db_server.js" to start the database server.
* This file contains the necessary calls to the MySQL database.

Step 2: Verify that servers are running by inspecting the console outputs of the servers.

Step 3: How to use APIs from the frontend

canvas_server.js
* Fetch Courses
"
const fetchCourses = async () => {
        setError(''); // Reset error state
        try {
            const response = await axios.get('http://localhost:4000/api/courses', {
                withCredentials: true,
            });
            console.log(response);
            setCourses(response.data); // Store the fetched courses
        } catch (error) {
            console.error('Error fetching courses:', error.response ? error.response.data : error.message);
            setError('Error fetching courses. Please check your token and permissions.');
        }
    };
"
* Fetch Course details
"
const fetchCourseDetails = async () => {
        setError('');
        try {
            const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/course-details`, {
                withCredentials: true,
            });
            setCourseName(response.data.course_name);
            setCourseCode(response.data.course_code);
            setAssignments(response.data.assignments);
        } catch (error) {
            console.error('Error fetching students:', error.response ? error.response.data : error.message);
            setError('Error fetching students. Please check your token and permissions.');
        }
    };
"
* Fetch Students
"
const fetchStudents = async () => {
        setError('');  // Reset error state
        try {
            const response = await axios.get(`http://localhost:4000/api/courses/${courseId}/students`, {
                withCredentials: true,
            });
            console.log(response.data);
            setStudents(response.data); // Store the fetched students
        } catch (error) {
            console.error('Error fetching students:', error.response ? error.response.data : error.message);
            setError('Error fetching students. Please check your token and permissions.');
        }
    };
"

* Get massive course object for rubric parsing and student score aggregation
* NOTE: see "additional frontend helpers" below. These are also necessary for the score aggregation to work. See CourseSummaryPage.js for usage.
"
async function example2(courseId) {
        try {
          const response = await axios.get(`http://localhost:4000/api/example2/${courseId}`, {
            withCredentials: true,
          });
      
          const course = response.data;
          console.log('Raw course data:', course);

          // Build our aggregator for all users
          const aggregatedData = aggregateAllRubricData(course);
          console.log('Aggregated rubric data by student:', aggregatedData);
          setProcessedData(aggregatedData);

          const assignmentData = computeAveragePercentageByAssignment(course);
          console.log('Aggregated rubric data by assignment:', assignmentData);
          setAssignmentAverages(assignmentData);
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
    };
"

* Additional frontend helpers
    * aggregateAllRubricData(course)
    * computeClassAverages(aggregator)
    * computeAveragePercentageByAssignment(course)

db_server.js
* Sign Up Action from frontend
"
const response = await fetch('http://localhost:5001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    canvasToken,
                }),
                credentials: 'include',
            });
"
* Login Action from frontend
"
const response = await fetch('http://localhost:5001/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              username,
              password,
          }),
          credentials: 'include',  // Include cookies in the request
      });
"

