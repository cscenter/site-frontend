import React, { useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';
import { useAsync } from 'react-async';
import { ru } from 'date-fns/locale';

import { createNotification } from 'utils';
import Checkbox from 'components/Checkbox';
import PersonalAssignmentList from './PersonalAssignmentList';
import CourseFilterForm from './CourseFilterForm';
import {
  activityOptions,
  scoreOptions,
  stateReducer,
  parseAssignments,
  parsePersonalAssignments,
  useFilterState,
  getFilteredPersonalAssignments
} from './utils';

const fetchPersonalAssignments = async (
  { csrfToken, timeZone, updateState, state },
  { signal }
) => {
  const requestPersonalAssignments = ky.get(
    `/api/v1/teaching/courses/${state.course}/personal-assignments/`,
    {
      headers: {
        'X-CSRFToken': csrfToken
      },
      searchParams: { assignments: state.selectedAssignments },
      throwHttpErrors: false,
      signal: signal
    }
  );
  const requestAssignments = ky.get(
    `/api/v1/teaching/courses/${state.course}/assignments/`,
    {
      headers: {
        'X-CSRFToken': csrfToken
      },
      throwHttpErrors: false,
      signal: signal
    }
  );
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
      const [personalAssignmentsJSON, assignmentsJSON] = responses;
      const personalAssignments = parsePersonalAssignments({
        items: personalAssignmentsJSON,
        timeZone,
        locale: ru
      });
      const assignmentsMap = parseAssignments({
        items: assignmentsJSON,
        timeZone,
        locale: ru
      });
      const assignmentOptions = [];
      assignmentsMap.forEach((assignment, key) => {
        assignmentOptions.push({
          value: assignment.id,
          label: assignment.title
        });
      });
      updateState({
        personalAssignments,
        assignments: assignmentsMap,
        assignmentOptions
      });
    })
    .catch(error => {
      console.debug(error);
      createNotification('Что-то пошло не так. Попробуйте позже.', 'error');
    });
};

function AssignmentsCheckQueue({
  csrfToken,
  timeZone,
  courseOptions,
  courseTeachers,
  courseGroups,
  initialState
}) {
  const [state, updateState] = useReducer(stateReducer, {
    course: initialState.course,
    assignments: new Map(),
    assignmentOptions: [],
    selectedAssignments: initialState.selectedAssignments,
    personalAssignments: null
  });
  const { assignments, assignmentOptions, personalAssignments } = state;
  const { isPending } = useAsync({
    promiseFn: fetchPersonalAssignments,
    csrfToken,
    timeZone,
    state,
    updateState
  });
  const [filters, onFilterChange] = useFilterState({
    score: [],
    reviewers: [],
    studentGroups: [],
    activity: []
  });

  console.debug('filters on render', filters);

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
        initialFilters={state}
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
    selectedAssignments: PropTypes.arrayOf(PropTypes.number)
  }).isRequired,
  courseOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  courseTeachers: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
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
