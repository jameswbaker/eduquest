import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import './CourseSummaryPage.css';
import StudentList from '../components/StudentList';
import StudentView from '../components/StudentView';

// const radarData = [92, 59, 90, 25, 56, 64, 40];
// const radarLabels = [
//     'Following instructions',
//     'Teamwork',
//     'Working independently',
//     'Communication',
//     'Time management',
//     'Problem solving',
//     'Learning new skills',
// ];

export default function CourseSummaryPage() {
    const location = useLocation(); // Get the current location object
    const queryParams = new URLSearchParams(location.search); // Parse query parameters
    const courseId = queryParams.get('courseId'); // Retrieve the 'courseId' parameter

    const [students, setStudents] = useState([]);     // Store student data
    const [error, setError] = useState('');          // Store error messages
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [radarLabels, setRadarLabels] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [processedData, setProcessedData] = useState('');

    // Fetch course details from Canvas API
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
  
    // Fetch students from Canvas API
    const fetchStudents = async () => {
        setError('');  // Reset error state
        try {
            console.log("HI");
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

    async function fetchGraphQLCourseDetails(courseId) {
        const query = `
            query MyQuery {
                courseDetails(courseId: ${courseId}) {
                id
                name
                submissionsConnection {
                    edges {
                    node {
                        _id
                        assignmentId
                        grade
                        assignment {
                        description
                        name
                        id
                        pointsPossible
                        scoreStatistic {
                            mean
                            count
                            maximum
                        }
                        submissionsConnection {
                            edges {
                            node {
                                id
                                score
                                rubricAssessmentsConnection {
                                nodes {
                                    _id
                                    assessmentRatings {
                                    description
                                    points
                                    criterion {
                                        description
                                        _id
                                    }
                                    }
                                }
                                }
                                userId
                            }
                            }
                        }
                        rubric {
                            criteria {
                            points
                            _id
                            description
                            }
                        }
                        }
                    }
                    }
                }
                }
            }
            `;

        
        try {
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
            credentials: 'include',
          });
      
          const result = await response.json();

          if (result.errors) {
            console.error('GraphQL errors:', result.errors);
          } else {
            console.log('Course details:', result.data.courseDetails);
            return result.data.courseDetails;
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
    };

    async function example(courseId) {
        const query = `
            query courseDetails(courseId: ${courseId}) {
                course(id: $courseId) {
                    id
                    _id
                    name
                }
            }
        `;

        try {
          const response = await axios.get(`http://localhost:4000/api/example/${courseId}`, {
            withCredentials: true,
          });
      
          const result = await response.json();

          console.log("RESULT:", result);

          if (result.errors) {
            console.error('GraphQL errors:', result.errors);
          } else {
            console.log('Course details:', result.data.courseDetails);
            return result.data.courseDetails;
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
    };

    async function example2(courseId) {
        try {
          const response = await axios.get(`http://localhost:4000/api/example2/${courseId}`, {
            withCredentials: true,
          });
      
          const course = response.data;
          console.log('Raw course data:', course);

          // Build our aggregator for all users
          const aggregatedData = aggregateAllRubricData(course);
          console.log('Aggregated rubric data:', aggregatedData);

          // Store it in React state
          setProcessedData(aggregatedData);
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
    };

    function aggregateAllRubricData(course) {
      // This will hold data in the shape:
      // {
      //   [userId]: {
      //     [criterionId]: {
      //       description: string,
      //       totalEarned: number,
      //       totalPossible: number
      //     }
      //   }
      // }
      const aggregator = {};
    
      const submissionsEdges = course?.submissionsConnection?.edges || [];
      submissionsEdges.forEach((submissionEdge) => {
        const submissionNode = submissionEdge.node;
        const assignment = submissionNode.assignment;
        if (!assignment) return;
    
        const rubric = assignment.rubric;
        if (!rubric?.criteria) return;
    
        // Go through each student's submission for this assignment
        const assignmentSubmissions = assignment?.submissionsConnection?.edges || [];
        assignmentSubmissions.forEach((submissionForUserEdge) => {
          const submissionForUser = submissionForUserEdge.node;
          if (!submissionForUser) return;
    
          const userId = submissionForUser.userId;
          // If aggregator[userId] is not created, create it
          if (!aggregator[userId]) {
            aggregator[userId] = {};
          }
    
          // Each submission has "rubricAssessmentsConnection" → array of rubric assessments
          const rubricAssessments = submissionForUser?.rubricAssessmentsConnection?.nodes || [];
          rubricAssessments.forEach((assessment) => {
            const assessmentRatings = assessment.assessmentRatings || [];
    
            // Create a map of criterionId -> pointsEarned for *this* assessment
            const ratingMap = {};
            assessmentRatings.forEach((rating) => {
              const criterionId = rating.criterion?._id;
              const description = rating.criterion?.description;
              if (!criterionId) return;
    
              ratingMap[criterionId] = {
                pointsEarned: rating.points,
                description, // keep the textual description
              };
            });
    
            // Now combine with the assignment's rubric definitions
            rubric.criteria.forEach((crit) => {
              const critId = crit._id;
              const maxPoints = crit.points || 0;
              const desc = crit.description;
    
              // See if this submission had a rating for that criterion (could be undefined)
              const ratingInfo = ratingMap[critId];
              const earnedPoints = ratingInfo?.pointsEarned ?? 0;
              const usedDescription = ratingInfo?.description || desc;
    
              // If aggregator[userId][critId] doesn't exist, initialize it
              if (!aggregator[userId][critId]) {
                aggregator[userId][critId] = {
                  description: usedDescription,
                  totalEarned: 0,
                  totalPossible: 0,
                };
              }
    
              aggregator[userId][critId].totalEarned += earnedPoints;
              aggregator[userId][critId].totalPossible += maxPoints;
            });
          });
        });
      });
    
      // Now compute final percentages
      // If you want to store them inside aggregator[userId][critId], you can do so:
      Object.keys(aggregator).forEach((userId) => {
        Object.keys(aggregator[userId]).forEach((critId) => {
          const entry = aggregator[userId][critId];
          let pct = 0;
          if (entry.totalPossible > 0) {
            pct = (entry.totalEarned / entry.totalPossible) * 100;
          }
          // You can store it or compute on the fly later. Let's store it:
          entry.percentage = pct;
        });
      });
    
      // aggregator is now shaped by user → criterion → {desc, totalEarned, totalPossible, percentage}
      return aggregator;
    }

    function computeRubricPercentage(course) {
        const result = [];

        // 1) Go through each submission in submissionsConnection
        const submissionsEdges = course?.submissionsConnection?.edges || [];
        submissionsEdges.forEach((submissionEdge) => {
            const submissionNode = submissionEdge.node;
            // The assignment object
            const assignment = submissionNode.assignment;
            if (!assignment) return;
        
            const assignmentName = assignment.name;
            const rubric = assignment.rubric;
            if (!rubric?.criteria) return;
        
            // 2) Access submissions within this assignment
            const assignmentSubmissions = assignment?.submissionsConnection?.edges || [];
            
            // Potentially multiple submissions for multiple users,
            // but in your example there's likely just one user.
            assignmentSubmissions.forEach((submissionForUserEdge) => {
              const submissionForUser = submissionForUserEdge.node;
              if (!submissionForUser) return;
        
              // 3) The array of rubric assessments (the scoring breakdown)
              const rubricAssessments = submissionForUser?.rubricAssessmentsConnection?.nodes || [];
        
              rubricAssessments.forEach((assessment) => {
                const assessmentRatings = assessment.assessmentRatings || [];
        
                // Create a map of criterionId -> pointsEarned
                const ratingMap = {};
                assessmentRatings.forEach((rating) => {
                  const criterionId = rating.criterion?._id;
                  if (!criterionId) return;
                  ratingMap[criterionId] = rating.points;
                });
        
                // 4) Now compute (points earned / points possible) for each criterion
                const criteriaScores = rubric.criteria.map((crit) => {
                  const maxPoints = crit.points;
                  const earnedPoints = ratingMap[crit._id] ?? 0;
                  
                  let percentage = null;
                  if (maxPoints > 0) {
                    percentage = (earnedPoints / maxPoints) * 100;
                  }
                  // If maxPoints is 0, we might say "N/A" or 0, or skip it
        
                  return {
                    criterionId: crit._id,
                    criterionDescription: crit.description,
                    pointsEarned: earnedPoints,
                    pointsPossible: maxPoints,
                    percentage,
                  };
                });
        
                // You might structure your result how you like. For example:
                const item = {
                  assignmentName,
                  userId: submissionForUser.userId, // or any user info you have
                  totalScore: submissionForUser.score, // total score
                  criteriaScores,
                };
        
                result.push(item);
              });
            });
        });
        return result;
    }
      

    useEffect(() => {
        fetchStudents();
        fetchCourseDetails();
        fetchGraphQLCourseDetails(10436535);
        // example(10436535);
        // example2(10436535);
        example2(10436535);
    }, []);

    useEffect(() => {
        loadRadarData(selectedStudent);
        console.log(selectedStudent);
    }, [processedData, selectedStudent]);

    const loadRadarData = async (selectedStudent) => {
        if (!selectedStudent) {
            // if no selected student, do nothing for now
            // TODO: aggregate
            return;
        }

        if (!processedData || processedData.length === 0) return;
        console.log("WE HAVE processedData");

        const userId = selectedStudent.user.id;
        const userCriteriaMap = processedData[userId];
        if (!userCriteriaMap) {
          // Means this user has no rubric data
          setRadarLabels([]);
          setRadarData([]);
          return;
        }
      
        // userCriteriaMap is an object of { [critId]: { description, totalEarned, totalPossible, percentage } }
        // Convert it to arrays for the chart
        const entries = Object.values(userCriteriaMap); 

        // For demonstration, just use the first item
        // const item = processedData[0];
        // console.log(item);
        // Convert criteriaScores into chart arrays
        const chartLabels = entries.map((e) => e.description);
        const chartData = entries.map((e) => e.percentage);

        console.log("Chart Labels: " + chartLabels);
        console.log("Chart Data: " + chartData);

        setRadarLabels(chartLabels);
        setRadarData(chartData);
    }

    const handleStudentSelect = (student) => {
        // Check if the clicked student is already selected
        if (selectedStudent?.user?.id === student.user.id) {
            // Deselect the student if it's already selected
            setSelectedStudentId('');
            setSelectedStudent('');
        } else {
            // Otherwise, select the student
            setSelectedStudentId(student.user.id); // Save the selected student ID to state
            setSelectedStudent(student);
            console.log("STUDENT SELECTED: ", student.user.name);
        }
    };

    return (
        <div>
            <Navbar />
            <div>
                <p>THIS IS THE TEACHER DASHBOARD PAGE</p>
                <h4>{courseCode}: {courseName}, Course ID: {courseId}</h4>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="chart_container">
                {/* render this if there is no selected student */}
                <StudentList students={students} handleStudentSelect={handleStudentSelect}  selectedStudent={selectedStudent}/>
                {/* render this if there is a selected student */}
                
                <div className="summary_container" id="chart_container">
                    <h4>Ability Chart</h4>
                    <RadarChart dataset={radarData} labels={radarLabels} dataset_label={selectedStudent ? selectedStudent.user.name + "'s Ability" : ""}/>
                    {/* History chart */}
                </div>
            </div>
            

            {/* Pull course information */}
            {/* Display blank ability chart */}
            {/* Consider making a separate component for the ability chart */}

            {/*
            FOR THE UI PEEPS:
            Things that need to be fixed:

            Sign Up page:
            - Display error message if Sign up fails
            - Display success message if Sign up works

            Login page:
            - Display error message if Login fails
            - Display success message if Login works

            Teacher Dashboard page:
            - After you sign up / login, the navbar should update so that the sign up/ sign in buttons 
            are replaced with the log out button, and the profile button
            - When you click on a course, you should have the ability to go back

            Overall:
            - Make things pretty
            */}
        </div>
    );
}