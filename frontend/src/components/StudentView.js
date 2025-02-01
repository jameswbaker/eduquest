import React, { useEffect, useState } from 'react';
import '../pages/CourseSummaryPage.css';

export default function StudentView({ student }) {

    return (
        <div className="summary_container" id="students_container">
            {student ? <div 
                className="student_item" 
                key={student.user.id} 
            >
                {student.user.name}
                <img href={student.user.avatar_url}/>
            </div> : <div/>}
        </div>
    );
}