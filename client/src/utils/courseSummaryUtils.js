export function aggregateAllRubricData(course) {
    const aggregator = {};
    const submissionsEdges = course?.submissionsConnection?.edges || [];

    submissionsEdges.forEach(submissionEdge => {
        const submissionNode = submissionEdge.node;
        const assignment = submissionNode.assignment;
        if (!assignment) return;

        const rubric = assignment.rubric;
        if (!rubric?.criteria) return;

        const assignmentSubmissions = assignment?.submissionsConnection?.edges || [];
        assignmentSubmissions.forEach(submissionForUserEdge => {
            const submissionForUser = submissionForUserEdge.node;
            if (!submissionForUser) return;

            const userId = submissionForUser.userId;
            if (!aggregator[userId]) aggregator[userId] = {};

            const rubricAssessments = submissionForUser?.rubricAssessmentsConnection?.nodes || [];
            rubricAssessments.forEach(assessment => {
                const assessmentRatings = assessment.assessmentRatings || [];
                const ratingMap = {};

                assessmentRatings.forEach(rating => {
                    const criterionId = rating.criterion?._id;
                    const description = rating.criterion?.description;
                    if (criterionId) ratingMap[criterionId] = { pointsEarned: rating.points, description };
                });

                rubric.criteria.forEach(crit => {
                    const critId = crit._id;
                    const maxPoints = crit.points || 0;
                    const desc = crit.description;
                    const ratingInfo = ratingMap[critId];
                    const earnedPoints = ratingInfo?.pointsEarned ?? 0;
                    const usedDescription = ratingInfo?.description || desc;

                    if (!aggregator[userId][critId]) {
                        aggregator[userId][critId] = { description: usedDescription, totalEarned: 0, totalPossible: 0 };
                    }

                    aggregator[userId][critId].totalEarned += earnedPoints;
                    aggregator[userId][critId].totalPossible += maxPoints;
                });
            });
        });
    });

    Object.keys(aggregator).forEach(userId => {
        Object.keys(aggregator[userId]).forEach(critId => {
            const entry = aggregator[userId][critId];
            entry.percentage = entry.totalPossible > 0 ? (entry.totalEarned / entry.totalPossible) * 100 : 0;
        });
    });

    return aggregator;
}
