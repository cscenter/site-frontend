import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { activityOptions, getScoreClass } from './utils';
import Pagination from 'components/Pagination';

const activityCodeLabels = {};
for (const option of activityOptions) {
  activityCodeLabels[option.value] = option.label;
}

function formatScore(score) {
  if (score === null) {
    return '—';
  }
  const suffix = '.00';
  const index = score.indexOf(suffix, score.length - suffix.length);
  if (index === -1) {
    return score;
  } else {
    return score.substring(0, index);
  }
}

const PersonalAssignment = ({ data, assignments }) => {
  const { student, assignee, activity, score, assignmentId } = data;
  const assignment = assignments.get(assignmentId);
  const studentFullName = `${student.lastName} ${student.firstName}`;
  let assigneeFullName = '—';
  if (assignee !== null) {
    assigneeFullName = `${assignee.teacher.lastName} ${assignee.teacher.firstName}`;
  }

  return (
    <tr>
      <td>
        <a href={`/teaching/assignments/submissions/${data.id}/`}>
          {studentFullName}
        </a>
      </td>
      <td>
        {activity === null && '—'}
        {activity !== null && (
          <>
            {activityCodeLabels[activity.code]}
            <br />
            <small className="text-muted">{activity.dtFormatted}</small>
          </>
        )}
      </td>
      <td>
        <a href={`/teaching/assignments/${assignment.id}/`}>
          {assignment.title}
        </a>
        <br />
        <small className="text-muted">
          Срок сдачи: {assignment.deadlineAtFormatted}
        </small>
      </td>
      <td>{assigneeFullName}</td>
      <td>
        <span className={`assignment-status ${getScoreClass(data.state)}`}>
          {formatScore(score)}/{assignment.maximumScore}
        </span>
      </td>
    </tr>
  );
};

PersonalAssignment.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    assignmentId: PropTypes.number.isRequired,
    student: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      patronymic: PropTypes.string
    }).isRequired,
    assignee: PropTypes.shape({
      id: PropTypes.number.isRequired,
      teacher: PropTypes.shape({
        id: PropTypes.number.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        patronymic: PropTypes.string
      }).isRequired
    }),
    score: PropTypes.string,
    state: PropTypes.string.isRequired,
    activity: PropTypes.shape({
      code: PropTypes.string.isRequired,
      dt: PropTypes.string.isRequired,
      dtFormatted: PropTypes.string
    })
  }),
  assignments: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      maximumScore: PropTypes.number.isRequired,
      deadlineAt: PropTypes.string.isRequired,
      deadlineAtFormatted: PropTypes.string.isRequired
    })
  ).isRequired
};

const itemsPerPage = 50;

const PersonalAssignmentList = ({ isLoading, assignments, items }) => {
  const [page, setPage] = useState(1);
  const isShowPagination = items.length > itemsPerPage;
  return (
    <>
      <div className="panel">
        <div className="panel-body">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Последняя&nbsp;активность</th>
                <th>Задание</th>
                <th style={{ width: '60px' }}>Проверяющий</th>
                <th style={{ width: '60px' }}>Оценка</th>
              </tr>
            </thead>
            <tbody>
              {!items.length && (
                <tr>
                  <td colSpan="5" className="empty-results">
                    {!isLoading &&
                      assignments.size > 0 &&
                      !items.length &&
                      'Измените параметры фильтрации.'}
                    {!isLoading &&
                      !assignments.size &&
                      'Для выбранного курса задания не найдены.'}
                  </td>
                </tr>
              )}
              {items.length > 0 &&
                items
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  .map(item => (
                    <PersonalAssignment
                      key={`personal-assignment-${item.id}`}
                      data={item}
                      assignments={assignments}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      </div>
      {isShowPagination && (
        <Pagination
          totalItems={items.length}
          pageSize={itemsPerPage}
          currentPage={page}
          onChangePage={setPage}
        />
      )}
    </>
  );
};

PersonalAssignmentList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  assignments: PropTypes.objectOf(Map)
};

export default PersonalAssignmentList;
