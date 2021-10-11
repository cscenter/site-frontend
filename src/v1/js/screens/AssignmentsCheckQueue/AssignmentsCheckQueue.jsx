import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';
import { useAsync } from 'react-async';
import { formatWithOptions } from 'date-fns/fp';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';

import { createNotification } from 'utils';
import Checkbox from 'components/Checkbox';
import PersonalAssignmentList from './PersonalAssignmentList';
import CourseFilterForm from './CourseFilterForm';
import {
  activityOptions,
  scoreOptions,
  parseAssignments,
  useFilterState,
  getFilteredPersonalAssignments
} from './utils';

const fetchPersonalAssignments = async (
  { csrfToken, timeZone, assignments, personalAssignments },
  { signal }
) => {
  const { setPersonalAssignments, scoreStates } = personalAssignments;
  const { setAssignments } = assignments;
  const requestPersonalAssignments = ky.get(personalAssignments.endpoint, {
    headers: {
      'X-CSRFToken': csrfToken
    },
    searchParams: personalAssignments.searchParams,
    throwHttpErrors: false,
    signal: signal
  });
  const requestAssignments = ky.get(assignments.endpoint, {
    headers: {
      'X-CSRFToken': csrfToken
    },
    throwHttpErrors: false,
    signal: signal
  });
  Promise.all([requestPersonalAssignments, requestAssignments])
    .then(async responses => {
      const [responsePersonalAssignments, responseAssignments] = responses;
      if (!responsePersonalAssignments.ok || !responseAssignments.ok) {
        return Promise.reject(new Error('fail'));
      }
      return Promise.all([
        responsePersonalAssignments.json(),
        responseAssignments.json()
      ]);
    })
    .then(responses => {
      let dateToString = formatWithOptions({ locale: ru }, 'dd LLL HH:mm');
      const [personalAssignments, assignments] = responses;
      personalAssignments.forEach((item, i) => {
        if (item.activity) {
          const zonedDate = utcToZonedTime(item.activity.dt, timeZone);
          item.activity.dtFormatted = dateToString(zonedDate);
        }
        personalAssignments[i] = {
          id: item.id,
          assignmentId: item.assignmentId,
          assignee: item.assignee,
          student: item.student,
          score: item.score,
          state: item.state,
          scoreStatus: scoreStates[item.state],
          activity: item.activity
        };
      });
      dateToString = formatWithOptions({ locale: ru }, 'dd.MM.yyyy HH:mm');
      const assignmentsMap = parseAssignments(assignments, timeZone, ru);
      setAssignments(assignmentsMap);
      setPersonalAssignments(personalAssignments);
    })
    .catch(error => {
      createNotification('Что-то пошло не так. Попробуйте позже.', 'error');
    });
};

function AssignmentsCheckQueue({
  csrfToken,
  timeZone,
  courseOptions,
  courseTeachers,
  courseGroups,
  scoreStates,
  initialState
}) {
  const { course } = initialState;
  const [personalAssignments, setPersonalAssignments] = useState(null);
  const [selectedAssignments, setSelectedAssignments] = useState(
    initialState.assignments
  );
  const [assignments, setAssignments] = useState(new Map());
  const { isPending } = useAsync({
    promiseFn: fetchPersonalAssignments,
    csrfToken,
    timeZone,
    personalAssignments: {
      endpoint: `/api/v1/teaching/courses/${course}/personal-assignments/`,
      searchParams: { assignments: selectedAssignments },
      scoreStates,
      setPersonalAssignments
    },
    assignments: {
      endpoint: `/api/v1/teaching/courses/${course}/assignments/`,
      setAssignments
    }
  });
  const [filters, onFilterChange] = useFilterState({
    score: [],
    reviewers: [],
    studentGroups: [],
    activity: []
  });

  console.debug('filters on render', filters);

  const assignmentOptions = [];
  assignments.forEach((assignment, key) => {
    assignmentOptions.push({
      value: assignment.id,
      label: assignment.title
    });
  });

  const setFilterValues = (name, value, checked) => {
    let values;
    values = filters[name] || [];
    if (checked) {
      values.push(value);
    } else {
      values = values.filter(v => v !== value);
    }
    onFilterChange({ name, value: values });
  };

  const setActivityFilter = e =>
    setFilterValues('activity', e.target.value, e.target.checked);

  const setScoreFilter = e =>
    setFilterValues('score', e.target.value, e.target.checked);

  const setReviewersFilter = e =>
    setFilterValues('reviewers', e.target.value, e.target.checked);

  const setStudentGroupsFilter = e =>
    setFilterValues('studentGroups', e.target.value, e.target.checked);

  const filteredPersonalAssignments = getFilteredPersonalAssignments(
    personalAssignments,
    filters
  );

  const hideStudentsGroupFilter = true;

  return (
    <>
      <CourseFilterForm
        timeZone={timeZone}
        courseOptions={courseOptions}
        assignmentOptions={assignmentOptions}
        initialFilters={{ course, assignments: selectedAssignments }}
      />
      <div className="row">
        <div className="col-xs-9">
          <PersonalAssignmentList
            isLoading={personalAssignments === null}
            assignments={assignments}
            items={filteredPersonalAssignments}
          />
        </div>

        <div className="col-xs-3">
          <div className="mb-30">
            <h5>Последняя активность</h5>
            {activityOptions.map(option => (
              <Checkbox
                name="activity"
                key={option.value}
                value={option.value}
                onChange={setActivityFilter}
                label={option.label}
              />
            ))}
          </div>

          <div className="mb-30">
            <h5>Оценка</h5>
            {scoreOptions.map(option => (
              <Checkbox
                key={`score-${option.value}`}
                name="score"
                value={option.value}
                onChange={setScoreFilter}
                label={option.label}
              />
            ))}
          </div>

          <div className="mb-30">
            <h5>Проверяющий</h5>
            <>
              {courseTeachers.map(option => (
                <Checkbox
                  key={`reviewer-${option.value}`}
                  name="reviewers"
                  value={option.value}
                  onChange={setReviewersFilter}
                  label={option.label}
                />
              ))}
            </>
          </div>

          {!hideStudentsGroupFilter && (
            <div className="mb-30">
              <h5>Студенческая группа</h5>
              <>
                {courseGroups.map(option => (
                  <Checkbox
                    name="studentGroups"
                    key={`student-group-${option.value}`}
                    value={option.value}
                    onChange={setStudentGroupsFilter}
                    label={option.label}
                  />
                ))}
              </>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

AssignmentsCheckQueue.propTypes = {
  csrfToken: PropTypes.string.isRequired,
  timeZone: PropTypes.string.isRequired,
  initialState: PropTypes.shape({
    course: PropTypes.number.isRequired,
    assignments: PropTypes.arrayOf(PropTypes.number)
  }).isRequired,
  courseOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  scoreStates: PropTypes.object.isRequired,
  courseTeachers: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool.isRequired
    })
  ).isRequired,
  courseGroups: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      selected: PropTypes.bool.isRequired
    })
  ).isRequired
};

export default AssignmentsCheckQueue;
