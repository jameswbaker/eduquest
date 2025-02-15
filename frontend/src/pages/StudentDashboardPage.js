import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import RadarChart from '../components/RadarChart';
import AssignmentList from '../components/AssignmentList';
import './StudentDashboardPage.css';

export default function StudentDashboardPage() {
    const [courses, setCourses] = useState([]); // Store courses data
    const [error, setError] = useState(''); // Store error messages
    const [username, setUsername] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [assignmentRadarLabels, setAssignmentRadarLabels] = useState([]);
    const [assignmentRadarData, setAssignmentRadarData] = useState([]);
    const [processedData, setProcessedData] = useState('');
    const [assignmentAverages, setAssignmentAverages] = useState([]);
    const [rubricItems, setRubricItems] = useState([]);
    const [selectedRubricItems, setSelectedRubricItems] = useState(new Set());

    // Fetch student information
    const fetchStudentInfo = async() => {
        try {
            const response = await axios.get('http://localhost:4000/protected-route', {
                withCredentials: true,
            });
            setUsername(response.data.username);
        } catch (error) {
            console.error('Error fetching student:', error.response ? error.response.data : error.message);
            setError('Error fetching student. Please check your token and permissions.');
        }
    }

    // Fetch courses from Canvas API (REST)
    const fetchCourses = async () => {
        setError(''); // Reset error state
        try {
            const response = await axios.get('http://localhost:4000/api/courses', {
                withCredentials: true,
            });
            setCourses(response.data); // Store the fetched courses
        } catch (error) {
            console.error('Error fetching courses:', error.response ? error.response.data : error.message);
            setError('Error fetching courses. Please check your token and permissions.');
        }
    };

    // Run the GraphQL query when the component mounts
    useEffect(() => {
        fetchStudentInfo();
        fetchCourses();
    }, []); // Re-run the effect if the token changes

    // Fetch course details from Canvas API
    const fetchCourseDetails = async () => {
        setError('');
        if (selectedCourse) {
            try {
                const response = await axios.get(`http://localhost:4000/api/courses/${selectedCourse.id}/course-details`, {
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
        }
    };

    function toggleSelectedCourse(course) {
        if (selectedCourse?.id === course.id) {
            setSelectedCourse(''); // Deselect if it's already selected
            setAssignments([]); // Clear assignments
            setRubricItems([]); // Clear rubric items
            setAssignmentRadarData([]); // Clear chart data
        } else {
            setSelectedCourse(course);
        }
    }

    async function aggregateCourseDetails(courseId) {
        try {
          const response = await axios.get(`http://localhost:4000/api/course-details-agg/${courseId}`, {
            withCredentials: true,
          });
      
          const course = response.data;
          // Build our aggregator for all users
          const aggregatedData = aggregateAllRubricData(course);
          setProcessedData(aggregatedData);

          const assignmentData = computeAveragePercentageByAssignment(course);
          setAssignmentAverages(assignmentData);
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
        aggregateCourseDetails(selectedCourse.id);
    }, [selectedCourse]);

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
    };

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

    function aggregateAllRubricData(course) {
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
        if (selectedRubricItems.size > 0) {
            loadRadarDataByAssignment(selectedAssignment);
        } else {
            setAssignmentRadarLabels([]);
            setAssignmentRadarData([]);
        }
    }, [processedData, selectedAssignment, selectedRubricItems]);

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
        }
    };

    return (
        <div>
            <Navbar />
            <div> 
                <h4>Welcome {username} to Your Student Dashboard</h4>
            </div>
            {/* Display error message if there's an issue */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="dashboard-content">
                {/* Course List Column */}
                <div className="courses-column">
                    <h4 className="section-title">Courses</h4>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className={`student-course-item ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                            onClick={() => toggleSelectedCourse(course)}
                        >
                            {course.name}
                        </div>
                    ))}
                </div>

                {/* Main Content (Rubric, Assignments, Chart) */}
                <div className="main-content">
                    {selectedCourse ? (
                        <>
                            <h2 className="page-title">{courseCode}: {courseName}</h2>

                            <div className="dashboard-sections">
                                <div className="rubric-column">
                                    <h4 className="section-title">Rubric Items</h4>
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

                                <div className="chart-container">
                                    <div className="assignment-list-container">
                                        <AssignmentList 
                                            assignments={assignments} 
                                            handleAssignmentSelect={setSelectedAssignment} 
                                            selectedAssignment={selectedAssignment}
                                        />
                                    </div>
                                
                                    <div className="ability-container">
                                        <h4 className="section-title">Assignment Ability Chart</h4>
                                        <RadarChart 
                                            dataset={assignmentRadarData} 
                                            labels={assignmentRadarLabels} 
                                            dataset_label={selectedAssignment ? `${selectedAssignment.name} Performance` : "Assignments Overview"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-course-selected">
                            <p>Select a course to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
