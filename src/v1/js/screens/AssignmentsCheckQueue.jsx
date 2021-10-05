import React, { useState } from 'react';
import PropTypes from 'prop-types';

function AssignmentsCheckQueue({ reviewers, studentGroups }) {
  console.log(reviewers, studentGroups);
  const personalAssignments = [];

  return (
    <div className="row">
      <div className="col-xs-9">
        <div className="panel">
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Последняя активность</th>
                  <th>Задание</th>
                  <th>Студент</th>
                  <th style={{ width: '60px' }}>Проверяющий</th>
                  <th style={{ width: '60px' }}>Оценка</th>
                </tr>
              </thead>
              <tbody>
                {!personalAssignments.length && (
                  <tr>
                    <td colSpan="5" className="empty-results">
                      Измените параметры поиска.
                    </td>
                  </tr>
                )}
                {personalAssignments.length > 0 &&
                  personalAssignments.map(personalAssignment => (
                    // FIXME: create component from this one?
                    <tr key={`personal-assignment-${personalAssignment.pk}`}>
                      <td className="assignment">
                        <a href="">Комментaрий преподавателя</a>
                        <br />
                        <small className="text-muted">11 окт. 12:43</small>
                      </td>
                      <td>
                        assignmentTitle
                        <br />
                        <small className="text-muted">
                          Срок сдачи: 12.12.2020
                        </small>
                      </td>
                      <td>student full name</td>
                      <td>assignee</td>
                      <td>
                        <span className="assignment-status pass">
                          score/maxScore
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-xs-3">
        <div className="mb-30">
          <h5>Последняя активность</h5>
          <div className="checkbox">
            <label>
              <input type="checkbox" name="activity" value="solution" />{' '}
              Отправлено решение
            </label>
          </div>
          <div className="checkbox">
            <label>
              <input type="checkbox" name="activity" value="comment_student" />{' '}
              Комментарий студента
            </label>
          </div>
          <div className="checkbox">
            <label>
              <input type="checkbox" name="activity" value="comment_teacher" />{' '}
              Комментарий преподавателя
            </label>
          </div>
        </div>

        <div className="mb-30">
          <h5>Оценка</h5>
          <div className="checkbox">
            <label>
              <input type="checkbox" name="score" value="empty" /> Без оценки
            </label>
          </div>
          <div className="checkbox">
            <label>
              <input type="checkbox" name="score" value="set" /> С оценкой
            </label>
          </div>
        </div>

        <div className="mb-30">
          <h5>Проверяющий</h5>
          <>
            {reviewers.map(reviewer => (
              <div className="checkbox" key={`reviewer-${reviewer.value}`}>
                <label>
                  <input
                    type="checkbox"
                    name="reviewers"
                    value={reviewer.value}
                  />
                  {` ${reviewer.label}`}
                </label>
              </div>
            ))}
          </>
        </div>

        <div className="mb-30">
          <h5>Студенческая группа</h5>
          <>
            {studentGroups.map(studentGroup => (
              <div
                className="checkbox"
                key={`student-group-${studentGroup.value}`}
              >
                <label>
                  <input
                    type="checkbox"
                    name="student_groups"
                    value={studentGroup.value}
                  />
                  {` ${studentGroup.label}`}
                </label>
              </div>
            ))}
          </>
        </div>
      </div>
    </div>
  );
}

AssignmentsCheckQueue.propTypes = {
  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool.isRequired
    })
  ).isRequired,
  studentGroups: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool.isRequired
    })
  ).isRequired
};

export default AssignmentsCheckQueue;
