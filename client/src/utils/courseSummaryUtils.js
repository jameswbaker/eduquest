import axios from 'axios';

export function computeClassAverages(aggregator) {
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

export function aggregateAllRubricData(course) {
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

  export function computeAveragePercentageByAssignment(course) {
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