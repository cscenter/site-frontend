import React, { useState, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';
import { useAsync } from 'react-async';
import { ru } from 'date-fns/locale';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';

import { createNotification } from 'utils';
import Checkbox from 'components/Checkbox';
import PersonalAssignmentList from './PersonalAssignmentList';
import CourseFilterForm from './CourseFilterForm';
import {
  activities,
  activityOptions,
  getFilteredPersonalAssignments,
  parseAssignments,
  parsePersonalAssignments,
  scoreOptions,
  stateReducer,
  useFilterState,
  FiltersURLSearchParams,
  useQuery
} from './utils';

const fetchData = async (
  { csrfToken, timeZone, updateState, initialState, queryParams },
  controller
) => {
  const searchParams = {
    course: queryParams.course || initialState.course,
    assignments: queryParams.assignments || initialState.selectedAssignments
  };
  return Promise.all([
    fetchCourseSettings([csrfToken, searchParams.course], controller),
    fetchPersonalAssignments(
      [csrfToken, timeZone, updateState, searchParams],
      controller
    )
  ])
    .then(responses => {
      const [[assignmentsJSON, enrollmentsJSON], personalAssignmentsJSON] =
        responses;
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
      const studentGroups = new Map();
      enrollmentsJSON.forEach(item => {
        studentGroups.set(item.student.id, item.studentGroupId);
      });
      const personalAssignments = parsePersonalAssignments({
        items: personalAssignmentsJSON,
        studentGroups,
        timeZone,
        locale: ru
      });
      updateState({
        isInitialized: true,
        assignments: assignmentsMap,
        assignmentOptions,
        studentGroups: studentGroups,
        personalAssignments
      });
    })
    .catch(error => {
      console.debug(error);
      createNotification('Что-то пошло не так. Попробуйте позже.', 'error');
    });
};

const fetchCourseSettings = async ([csrfToken, course], { signal }) => {
  const assignments = ky
    .get(`/api/v1/teaching/courses/${course}/assignments/`, {
      headers: {
        'X-CSRFToken': csrfToken
      },
      throwHttpErrors: false,
      signal: signal
    })
    .then(async response => {
      if (!response.ok) {
        return Promise.reject(new Error('fail'));
      }
      return response.json();
    });
  const enrollments = ky
    .get(`/api/v1/teaching/courses/${course}/enrollments/`, {
      headers: {
        'X-CSRFToken': csrfToken
      },
      throwHttpErrors: false,
      signal: signal
    })
    .then(async response => {
      if (!response.ok) {
        return Promise.reject(new Error('fail'));
      }
      return response.json();
    });
  return Promise.all([assignments, enrollments]);
};

const fetchPersonalAssignments = async (
  [csrfToken, timeZone, updateState, searchParams],
  { signal }
) => {
  return ky
    .get(
      `/api/v1/teaching/courses/${searchParams.course}/personal-assignments/`,
      {
        headers: {
          'X-CSRFToken': csrfToken
        },
        searchParams: { assignments: searchParams.assignments },
        throwHttpErrors: false,
        signal: signal
      }
    )
    .then(async response => {
      if (!response.ok) {
        return Promise.reject(new Error('fail'));
      }
      return response.json();
    });
};

const pullPersonalAssignments = async (
  [csrfToken, timeZone, updateState, studentGroups, searchParams],
  controller
) => {
  fetchPersonalAssignments(
    [csrfToken, timeZone, updateState, searchParams],
    controller
  )
    .then(data => {
      const personalAssignments = parsePersonalAssignments({
        items: data,
        studentGroups,
        timeZone,
        locale: ru
      });
      updateState({ personalAssignments });
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        console.debug('Abort fetch');
      } else {
        console.debug(error);
        createNotification('Что-то пошло не так. Попробуйте позже.', 'error');
      }
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
  const queryParams = useQuery();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [state, updateState] = useReducer(stateReducer, {
    isInitialized: false,
    course: initialState.course,
    assignments: new Map(),
    assignmentOptions: [],
    selectedAssignments: initialState.selectedAssignments,
    personalAssignments: null,
    studentGroups: null
  });
  const { assignments, assignmentOptions, studentGroups, personalAssignments } =
    state;
  const { counter: fetchCounter, run } = useAsync({
    promiseFn: fetchData,
    deferFn: pullPersonalAssignments,
    csrfToken,
    timeZone,
    queryParams,
    initialState,
    updateState
  });

  const [filters, onFilterChange] = useFilterState({
    activity: [activities.SC, activities.NS],
    score: [],
    reviewers: [],
    studentGroups: []
  });

  console.debug('filters on render', filters);

  const handleSubmitForm = ({ course, selectedAssignments }) => {
    const filterURLSearchParams = new FiltersURLSearchParams({
      course,
      assignments: selectedAssignments
    });
    filterURLSearchParams.assign({ reviewers: filters.reviewers });
    // In case of changing course value we should fetch new student groups
    // As a workaround let's reload the page
    if (filterURLSearchParams.course !== state.course) {
      window.location.href = filterURLSearchParams.toString();
      return;
    }
    console.debug('navigate()');
    navigate(window.location.pathname + filterURLSearchParams.toString());
  };

  // history.listen() callback
  useEffect(() => {
    if (!state.isInitialized) {
      return;
    }
    const filterURLSearchParams = new FiltersURLSearchParams({
      // Fallback to default values
      course: queryParams.course || initialState.course,
      assignments: queryParams.assignments || initialState.selectedAssignments
    });
    filterURLSearchParams.assign({ reviewers: filters.reviewers });
    // TODO: filter out personal assignments and update state instead of
    //  fetching if only some assignment checkboxes were removed
    run(csrfToken, timeZone, updateState, studentGroups, filterURLSearchParams);
    // Rerender multiple select in CourseFilterForm
    updateState({
      personalAssignments: null,
      selectedAssignments:
        queryParams.assignments || initialState.selectedAssignments
    });
    if (fetchCounter > 0) {
      setPage(1);
    }
    // Skip `state` to trigger callback on changing query parameters only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, csrfToken, setPage, timeZone, updateState, queryParams]);

  const setFilterValues = (name, value, checked) => {
    let values;
    values = filters[name] || [];
    if (checked) {
      values.push(value);
    } else {
      values = values.filter(v => v !== value);
    }
    setPage(1);
    onFilterChange({ name, value: values });
  };

  const setActivityFilter = e =>
    setFilterValues('activity', e.target.value, e.target.checked);

  const setScoreFilter = e =>
    setFilterValues('score', e.target.value, e.target.checked);

  const setReviewersFilter = e =>
    setFilterValues('reviewers', e.target.value, e.target.checked);

  const setStudentGroupsFilter = e =>
    setFilterValues(
      'studentGroups',
      parseInt(e.target.value, 10),
      e.target.checked
    );

  const filteredPersonalAssignments = getFilteredPersonalAssignments(
    personalAssignments,
    filters
  );

  return (
    <>
      <CourseFilterForm
        timeZone={timeZone}
        courseOptions={courseOptions}
        assignmentOptions={assignmentOptions}
        selectedCourse={state.course}
        selectedAssignments={state.selectedAssignments}
        onSubmitForm={handleSubmitForm}
      />
      <div className="row">
        <div className="col-xs-9">
          <PersonalAssignmentList
            page={page}
            setPage={setPage}
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
                defaultChecked={
                  filters.activity && filters.activity.includes(option.value)
                }
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
          {studentGroups !== null && (
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

export default function App(props) {
  return (
    <Router>
      <Routes>
        <Route
          path="/teaching/assignments/"
          element={<AssignmentsCheckQueue {...props} />}
        />
      </Routes>
    </Router>
  );
}
