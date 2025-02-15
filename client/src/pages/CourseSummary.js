import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import './CourseSummaryPage.css';
import StudentList from '../components/StudentList';
import AssignmentList from '../components/AssignmentList';

export default function CourseSummaryPage() {
    const location = useLocation(); // Get the current location object
    const queryParams = new URLSearchParams(location.search); // Parse query parameters
    const courseId = queryParams.get('courseId'); // Retrieve the 'courseId' parameter

    const [students, setStudents] = useState([]);     // Store student data
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState('');          // Store error messages
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [studentRadarLabels, setStudentRadarLabels] = useState([]);
    const [studentRadarData, setStudentRadarData] = useState([]);
    const [assignmentRadarLabels, setAssignmentRadarLabels] = useState([]);
    const [assignmentRadarData, setAssignmentRadarData] = useState([]);
    const [processedData, setProcessedData] = useState('');
    const [assignmentAverages, setAssignmentAverages] = useState([]);
    const [rubricItems, setRubricItems] = useState([]);
    const [selectedRubricItems, setSelectedRubricItems] = useState(new Set());

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
            extractRubricItems(response.data.assignments);
        } catch (error) {
            console.error('Error fetching students:', error.response ? error.response.data : error.message);
            setError('Error fetching students. Please check your token and permissions.');
        }
    };

    const extractRubricItems = (assignments) => {
        const uniqueRubrics = new Set();
        assignments.forEach((assignment) => {
            assignment.rubric?.forEach((criterion) => {
                uniqueRubrics.add(criterion.description);
            });
        });
        setRubricItems([...uniqueRubrics]);
    };

    const toggleRubricItem = (item) => {
        setSelectedRubricItems((prev) => {
            const newSelection = new Set(prev);
            if (newSelection.has(item)) {
                newSelection.delete(item);
            } else {
                newSelection.add(item);
            }
            return new Set(newSelection);
        });
    };

    const filterSelectedRubricItems = (entries) => {
        return entries.filter((entry) => {
            return selectedRubricItems.has(entry.description);
        });
    }
  
    // Fetch students from Canvas API
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

    function computeClassAverages(aggregator) {
        const classMap = {};
        // 1) Identify all unique criteria across *all* users
        const allCritIds = new Set();
        Object.keys(aggregator).forEach((userId) => {
            Object.keys(aggregator[userId]).forEach((critId) => {
                allCritIds.add(critId);
            });
        });

        // 2) For each criterion, sum across all users that have data
        allCritIds.forEach((critId) => {
            let totalEarned = 0;
            let totalPossible = 0;
            let description = null;
        
            Object.keys(aggregator).forEach((userId) => {
              const entry = aggregator[userId][critId];
              if (entry) {
                totalEarned += entry.totalEarned;
                totalPossible += entry.totalPossible;
                if (!description) {
                  description = entry.description; 
                }
              }
            });
        
            let percentage = 0;
            if (totalPossible > 0) {
              percentage = (totalEarned / totalPossible) * 100;
            }
        
            classMap[critId] = {
              description: description || "Unknown Criterion",
              totalEarned,
              totalPossible,
              percentage,
            };
        });
    
        return classMap;
    }

    function computeAveragePercentageByAssignment(course) {
        const aggregator = {};

        // Go through each "submission edge" at the course level
        const submissionsEdges = course?.submissionsConnection?.edges || [];
        submissionsEdges.forEach((submissionEdge) => {
            const submissionNode = submissionEdge.node;
            const assignment = submissionNode.assignment;
            if (!assignment) return;

            const assignmentId = submissionNode.assignmentId;       // Canvas's assignment ID (GraphQL)
            const assignmentName = assignment.name;
            const rubric = assignment.rubric;
            if (!rubric?.criteria) return;

            // Make sure aggregator has an entry for this assignment
            if (!aggregator[assignmentId]) {
                aggregator[assignmentId] = {
                    assignmentName,
                    criteriaMap: {}, // Keyed by criterionId
                };
            }

            // Now go through the assignment's own submissions
            const assignmentSubmissions = assignment?.submissionsConnection?.edges || [];
            assignmentSubmissions.forEach((subEdge) => {
                const submissionForUser = subEdge.node;
                if (!submissionForUser) return;

                // Each submission has 0+ rubric assessments
                const rubricAssessments = submissionForUser?.rubricAssessmentsConnection?.nodes || [];
                rubricAssessments.forEach((assessment) => {
                    const assessmentRatings = assessment.assessmentRatings || [];

                    // Map of criterionId -> pointsEarned (just for this single assessment)
                    const ratingMap = {};
                    assessmentRatings.forEach((rating) => {
                        const critId = rating.criterion?._id;
                        const critDesc = rating.criterion?.description;
                        if (!critId) return;
                        ratingMap[critId] = {
                            pointsEarned: rating.points,
                            description: critDesc,
                        };
                    });

                    // For each criterion in the rubric, see if the submission had a rating
                    rubric.criteria.forEach((crit) => {
                        const critId = crit._id;
                        const critMax = crit.points || 0;
                        const critDesc = crit.description;

                        // If no rating found for this criterion, assume 0 earned
                        const ratingInfo = ratingMap[critId];
                        const earned = ratingInfo?.pointsEarned ?? 0;
                        const usedDesc = ratingInfo?.description || critDesc;

                        // Add or init aggregator for this criterion
                        if (!aggregator[assignmentId].criteriaMap[critId]) {
                            aggregator[assignmentId].criteriaMap[critId] = {
                            description: usedDesc,
                            sumEarned: 0,
                            sumPossible: 0,
                            };
                        }

                        aggregator[assignmentId].criteriaMap[critId].sumEarned += earned;
                        aggregator[assignmentId].criteriaMap[critId].sumPossible += critMax;
                    });
                });
            });
        });

        // Now compute "average" (sumEarned / sumPossible * 100) for each assignment + criterion
        Object.keys(aggregator).forEach((assignmentId) => {
            const criteriaScores = aggregator[assignmentId].criteriaMap || {};
    
            Object.keys(criteriaScores).forEach((critId) => {
                const { sumEarned, sumPossible } = criteriaScores[critId];
                let averagePercentage = 0;
                if (sumPossible > 0) {
                    averagePercentage = (sumEarned / sumPossible) * 100;
                }
                criteriaScores[critId].averagePercentage = averagePercentage;
            });
        });
    
        // Return an object indexed by assignmentId
        return aggregator;
    }

    useEffect(() => {
        fetchStudents();
        fetchCourseDetails();
        example2(courseId);
    }, [courseId]);

    useEffect(() => {
        if (selectedRubricItems.size > 0) {
            loadRadarDataByStudent(selectedStudent);
            loadRadarDataByAssignment(selectedAssignment);
        } else {
            setStudentRadarLabels([]);
            setStudentRadarData([]);
            setAssignmentRadarLabels([]);
            setAssignmentRadarData([]);
        }
    }, [processedData, selectedStudent, selectedAssignment, selectedRubricItems]);

    // useEffect(() => {
    //     loadRadarDataByStudent(selectedStudent);
    // }, [processedData, selectedStudent, selectedRubricItems]);

    // useEffect(() => {
    //     loadRadarDataByAssignment(selectedAssignment);
    // }, [processedData, selectedAssignment, selectedRubricItems]);

    const loadRadarDataByStudent = async (selectedStudent) => {
        console.log(selectedRubricItems);
        
        if (!selectedStudent) {
            const classAverages = computeClassAverages(processedData);
            const entries = Object.values(classAverages);
            const filteredEntries = filterSelectedRubricItems(entries);
            filteredEntries.sort((a, b) => a.description.localeCompare(b.description));

            const chartLabels = filteredEntries.map((e) => e.description);
            const chartData = filteredEntries.map((e) => e.percentage);
            console.log("Chart labels: ", chartLabels);
            console.log("Chart data: ", chartData);
            setStudentRadarLabels(chartLabels);
            setStudentRadarData(chartData);
            return;
        }

        if (!processedData || processedData.length === 0) return;
        const userId = selectedStudent.user.id;
        const userCriteriaMap = processedData[userId];
        if (!userCriteriaMap) {
          // Means this user has no rubric data
          setStudentRadarLabels([]);
          setStudentRadarData([]);
          return;
        }
      
        // userCriteriaMap is an object of { [critId]: { description, totalEarned, totalPossible, percentage } }
        // Convert it to arrays for the chart
        const entries = Object.values(userCriteriaMap); 
        const filteredEntries = filterSelectedRubricItems(entries);
        filteredEntries.sort((a, b) => a.description.localeCompare(b.description));

        // Convert criteriaScores into chart arrays
        const chartLabels = filteredEntries.map((e) => e.description);
        const chartData = filteredEntries.map((e) => e.percentage);
        console.log("Chart labels: ", chartLabels);
        console.log("Chart data: ", chartData);
        setStudentRadarLabels(chartLabels);
        setStudentRadarData(chartData);
    }

    const handleStudentSelect = (student) => {
        // Check if the clicked student is already selected
        if (selectedStudent?.user?.id === student.user.id) {
            // Deselect the student if it's already selected
            setSelectedStudent('');
        } else {
            // Otherwise, select the student
            setSelectedStudent(student);
            console.log("STUDENT SELECTED: ", student.user.name);
        }
    };

    const loadRadarDataByAssignment = (selectedAssignment) => {
        if (!assignmentAverages || assignmentAverages.length === 0) {
            setAssignmentRadarLabels([]);
            setAssignmentRadarData([]);
            return;
        }
        
        // No assignment selected => show entire class average across all assignments
        if (!selectedAssignment) {
            const classAverages = computeClassAverages(processedData);
            const entries = Object.values(classAverages);
            const filteredEntries = filterSelectedRubricItems(entries);
            filteredEntries.sort((a, b) => a.description.localeCompare(b.description));

            const chartLabels = filteredEntries.map((e) => e.description);
            const chartData = filteredEntries.map((e) => e.percentage);
            console.log("Chart labels: ", chartLabels);
            console.log("Chart data: ", chartData);
            setAssignmentRadarLabels(chartLabels);
            setAssignmentRadarData(chartData);
            return;
        }

        // Assignment selected => show only those rubric items under this assignment
        const assignmentAvg = assignmentAverages[selectedAssignment.id];
        const criteriaScores = Object.values(assignmentAvg.criteriaMap);
        const filteredCriteria = filterSelectedRubricItems(criteriaScores);
        filteredCriteria.sort((a, b) => a.description.localeCompare(b.description));

        const labels = filteredCriteria.map((c) => c.description);
        const data = filteredCriteria.map((c) => c.averagePercentage);
        console.log("Chart labels: ", labels);
        console.log("Chart data: ", data);
        setAssignmentRadarLabels(labels);
        setAssignmentRadarData(data);
    };

    const handleAssignmentSelect = (assignment) => {
        // Check if the clicked assignment is already selected
        if (selectedAssignment?.id === assignment.id) {
            // Deselect the assignment if it's already selected
            setSelectedAssignment('');
        } else {
            // Otherwise, select the assignment
            setSelectedAssignment(assignment);
            console.log("ASSIGNMENT SELECTED: ", assignment.name);
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

            <div className="dashboard_layout">
                <div className="rubric_column">
                    <h4>Rubric Items</h4>
                    {rubricItems.map((item) => (
                        <div
                            key={item}
                            className={`rubric-item ${selectedRubricItems.has(item) ? 'selected' : ''}`}
                            onClick={() => toggleRubricItem(item)}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* This is the view by students */}
                <div className="content_container">
                    <div className="chart_container">
                        <StudentList students={students} handleStudentSelect={handleStudentSelect} selectedStudent={selectedStudent}/>
                        
                        <div className="summary_container" id="chart_container">
                            <h4>Student Ability Chart</h4>
                            <RadarChart 
                                dataset={studentRadarData} 
                                labels={studentRadarLabels} 
                                dataset_label={selectedStudent ? selectedStudent.user.name + "'s Ability" : "Class Average Ability"}
                            />
                            {/* History chart */}
                        </div>
                    </div>

                    {/* This is the view by assignments */}
                    <div className="chart_container">
                        <AssignmentList assignments={assignments} handleAssignmentSelect={handleAssignmentSelect} selectedAssignment={selectedAssignment}/>
                        
                        <div className="summary_container" id="chart_container">
                            <h4>Assignment Ability Chart</h4>
                            <RadarChart 
                                dataset={assignmentRadarData} 
                                labels={assignmentRadarLabels} 
                                dataset_label={selectedAssignment ? `${selectedAssignment.name} Performance` : "Assignments Overview"}
                            />
                            {/* History chart */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}