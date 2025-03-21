import React, { useState, useEffect } from 'react';
import "./DataDashboard.css";
import { useParams, useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import RadarChart from '../components/RadarChart';
import { useCourseSummary } from '../hooks/useCourseSummary';
import { 
  computeClassAverages,  
  aggregateAllRubricData,  
  computeAveragePercentageByAssignment,
} from '../utils/courseSummaryUtils';

import RubricList from "../components/RubricList"; // Import modal component
import RubricCard from '../components/RubricCard';
import StudentCard from '../components/StudentCard';
import AssignmentCard from '../components/AssignmentCard';

import axios from 'axios'


const TDashboard = () => {
  const domain = process.env.REACT_APP_API_BASE_URL || 'localhost';
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const enrollmentType = ReactSession.get("enrollmentType");
    console.log(enrollmentType);
    if (enrollmentType === "StudentEnrollment") {
      alert("Not authorized to access teacher page");
      navigate('/dashboard/:studentId');
    }
  }, [navigate]);


  

  const [rubricOpen, setRubricOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('students'); // Default to 'students'

  const [selectedStudent, setSelectedStudent] = useState('');
  const toggleSelectedStudent = (student) => {
    if (selectedStudent?.user?.id === student.user.id) {
        // Deselect the student if it's already selected
        setSelectedStudent('');
    } else {
        // Otherwise, select the student
        setSelectedStudent(student);
        console.log("STUDENT SELECTED: ", student.user.name);
        filterRubricItemsByStudent(student);
    }
  }

  const filterRubricItemsByStudent = (student) => {
    console.log('this is the student selected: ', student);
  
    const studentRubrics = new Set(
      Object.values(processedData[student.user.id]).map(item => item.description)
    );
  
    console.log('this is studentRubrics: ', studentRubrics);
    setRubricItems(Array.from(studentRubrics));
  };
  

  const [selectedAssignment, setSelectedAssignment] = useState("");
  const toggleSelectedAssignment = (assignment) => {
    if (selectedAssignment?.id === assignment.id) {
        // Deselect the assignment if it's already selected
        setSelectedAssignment('');
    } else {
        // Otherwise, select the assignment
        setSelectedAssignment(assignment);
    }
  }

  const { 
    students, 
    assignments, 
    courseName, 
    courseCode, 
    rubricItems, 
    selectedRubricItems, 
    toggleRubricItem, 
    error,
    setError,
    setCourseName,
    setCourseCode,
    setAssignments,
    setRubricItems,
    fetchStudents,
    setSelectedRubricItems
  } = useCourseSummary(courseId);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    rubricItems: [],
    students: [],
    timeRange: "",
  });
  const [gameItems, setGameItems] = useState([]);

  const fetchGamesInCourse = async () => {
    setError('');
    try {
      const response = await axios.get(`http://${domain}:5001/get-class-games-results?course_id=${courseId}`, {
        withCredentials: true,
      });
      
      // Format game data in a consistent way
      const formattedGames = response.data.game_ids.map((id, index) => ({
        id: id,
        name: response.data.game_names[index],
        average: response.data.average_scores[index] || 0,
        type: 'game'
      }));
      
      setGameItems(formattedGames);
      console.log("Games loaded:", formattedGames);
    } catch (error) {
      console.error('Error fetching games:', error.response ? error.response.data : error.message);
      setError('Error fetching games. Please check your connection.');
    }
  };

  useEffect(() => {
    if (assignments.length > 0 && selectedRubricItems.length > 0) {
      const aggregatedData = aggregateAllRubricData(assignments, selectedRubricItems);
      setAnalyticsData(aggregatedData);
    }
  }, [assignments, selectedRubricItems]);


  /******** This is all stuff that James has added. 
   * I tried to put some stuff into courseSummaryUtils and useCourseSummary but there is still a lot left here
   * that needs access to various state variables so i kept this stuff at the top level */

  const [studentRadarData, setStudentRadarData] = useState('');
  const [studentRadarLabels, setStudentRadarLabels] = useState('');
  const [processedData, setProcessedData] = useState(null);

  const [assignmentRadarData, setAssignmentRadarData] = useState('');
  const [assignmentRadarLabels, setAssignmentRadarLabels] = useState('');
  const [assignmentAverages, setAssignmentAverages] = useState([]);

  // Fetch course details from Canvas API
  const fetchCourseDetails = async () => {
    setError('');
    try {
        const response = await axios.get(`http://${domain}:4000/api/courses/${courseId}/course-details`, {
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

  const filterSelectedRubricItems = (entries) => {
      return entries.filter((entry) => {
          return selectedRubricItems.has(entry.description);
      });
  }

  async function aggregateCourseDetails(courseId) {
    try {
      const response = await axios.get(`http://${domain}:4000/api/course-details-agg/${courseId}`, {
        withCredentials: true,
      });
  
      const course = response.data;
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

  useEffect(() => {
    fetchStudents();
    fetchCourseDetails();
    fetchGamesInCourse();
    aggregateCourseDetails(courseId);
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


  const loadRadarDataByStudent = async (selectedStudent) => {
    console.log("LOADING RADAR DATA: ", selectedRubricItems);
    
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

const handleSelectedTab = (input) => {
  setSelectedTab(input);
  setSelectedStudent(null);
  setSelectedRubricItems(new Set());
  setSelectedAssignment("");
  if (input === 'students') {

  } else if (input === 'assignments') {

  } else {
    console.log("error: handleSelectedTab: input not students or assignments")
  }
}

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

const getRadarData = () => {
  if (selectedTab === 'assignments') {
    return assignmentRadarData;
  }
  return studentRadarData;
}

const getRadarLabels = () => {
  if (selectedTab === 'assignments') {
    return assignmentRadarLabels;
  }
  return studentRadarLabels;
}

const getChartLabel = () => {

  if (selectedTab === 'assignments') {
    return selectedAssignment ? `Class Performance on ${selectedAssignment.name}` : "Class Performance on All Assignments";
  }

  return selectedStudent ? selectedStudent.user.name + "'s Ability" : "Class Average Ability";
}

/******** */



  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
      <div className="go-back-link">
            <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                navigate('/teacherBoard');
            }}
            style={{ textDecoration: 'none', color: '#007bff' }}
            >
            {/* ← Back to Dashboard */}
            ⬅️

            </a>
            <h1>{courseName || "Loading..."}</h1>
        </div>
        <div className="teacher-navbar">
          <button 
              className={`icon-button ${selectedTab === 'students' ? 'active' : ''}`} 
              onClick={() => handleSelectedTab('students')}
            >
              Students
            </button>
            <button 
              className={`icon-button ${selectedTab === 'assignments' ? 'active' : ''}`} 
              onClick={() => handleSelectedTab('assignments')}
            >
              Assignments
          </button>
          {/* <button className="icon-button" onClick={() => setRubricOpen(true)}>Bucket</button> */}
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Student List */}
        <div className="courses-section">
          <h2>{selectedTab === 'students' ? "Student List" : "Assignment List"}</h2>
          <div className="courses-list">
            {selectedTab === 'students' ? (
              // Render Student List
              students.map((student, index) => (
                <StudentCard 
                  key={index} 
                  studentName={student.user.name} 
                  grade={student.grades.current_score} 
                  // color="blue"
                  color={selectedStudent === student ? "green" : "blue"} // Change color when selected
                  onClick={() => toggleSelectedStudent(student)}
                />
              ))
            ) : (
              // TODO: assignment card HAS NO due date for now. wait for backend
              assignments.map((assignment, index) => (
                <AssignmentCard 
                  key={index} 
                  assignmentName={assignment.name} 
                  dueDate={assignment.dueAt} 
                  color={selectedAssignment === assignment ? "green" : "blue"}
                  onClick={() => toggleSelectedAssignment(assignment)} 
                />
              ))
            )}
          </div>
        </div>

        <div className="courses-section">
          <h2>Rubric Items</h2>
          <div className="courses-list">
            {rubricItems.map((item, index) => (
              <RubricCard 
                key={index} 
                rubricName={item} 
                color={selectedRubricItems.has(item) ? "green" : "blue"}
                onClick={() => toggleRubricItem(item)}
              />
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="powerchart-history-container">
          <section className="profile-section">
            <header className="charts-header">
              <h2>Summary</h2>
            </header>
              <RadarChart 
                dataset={getRadarData()}
                labels={getRadarLabels()} 
                dataset_label={getChartLabel()}
              />
          </section>

          {/* <section className="charts-section">
            <header className="charts-header">
              <h2>History</h2>
            </header>
          </section> */}
        </div>

        <div>
          <RubricList 
          isOpen={rubricOpen} 
          onClose={() => setRubricOpen(false)} 
          rubricItems={rubricItems} 
          />
        </div>

      </div>
    </div>
  );
};

export default TDashboard;
