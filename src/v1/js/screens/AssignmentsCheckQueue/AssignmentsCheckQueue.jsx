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
import isEqual from 'lodash-es/isEqual';

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
  useQueryParams
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
      const assignments = parseAssignments({
        items: assignmentsJSON,
        timeZone,
        locale: ru
      });
      const assignmentOptions = [];
      assignments.forEach((assignment, key) => {
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
        assignments,
        assignmentOptions, // TODO: useMemo instead
        studentGroups,
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

const refetchPersonalAssignments = async (
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
  const queryParams = useQueryParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [state, updateState] = useReducer(stateReducer, {
    isInitialized: false,
    assignments: new Map(),
    assignmentOptions: [],
    personalAssignments: null,
    studentGroups: null
  });
  const { assignments, assignmentOptions, studentGroups, personalAssignments } =
    state;
  const { counter: fetchCounter, run } = useAsync({
    promiseFn: fetchData,
    deferFn: refetchPersonalAssignments,
    csrfToken,
    timeZone,
    queryParams,
    initialState,
    updateState
  });

  const [filters, setFilters, onFilterChange] = useFilterState({
    course: initialState.course,
    assignments: initialState.selectedAssignments,
    activities: queryParams.activities || [activities.SC, activities.NS],
    score: queryParams.score || [],
    reviewers: queryParams.reviewers || [],
    studentGroups: queryParams.studentGroups || []
  });

  console.debug('filters on render', filters);

  const handleSubmitForm = ({ course, assignments }) => {
    const filterURLSearchParams = new FiltersURLSearchParams();
    filterURLSearchParams.assign(filters, {
      course,
      assignments
    });

    // In case of changing course value we should fetch new student groups
    // As a workaround let's reload the page
    if (filterURLSearchParams.course !== filters.course) {
      window.location.href = filterURLSearchParams.toString();
      return;
    }
    console.debug('navigate()', filterURLSearchParams);
    navigate(window.location.pathname + filterURLSearchParams.toString());
  };

  // history.listen() callback
  useEffect(() => {
    if (!state.isInitialized) {
      return;
    }
    console.debug('Eval history.listen() callback');

    const filtersPrevious = filters;
    const filtersNext = Object.assign({}, filtersPrevious, {
      course: queryParams.course || initialState.course,
      assignments: queryParams.assignments || initialState.selectedAssignments,
      score: queryParams.score || [],
      activities: queryParams.activities || [activities.SC, activities.NS],
      studentGroups: queryParams.studentGroups || [],
      reviewers: queryParams.reviewers || []
    });

    if (!isEqual(filtersPrevious, filtersNext)) {
      setFilters(filtersNext);
    }
    // Refetch logic
    const formFiltersPrevious = {
      course: filtersPrevious.course,
      assignments: filtersPrevious.assignments
    };
    const formFiltersNext = {
      course: filtersNext.course,
      assignments: filtersNext.assignments
    };
    if (!isEqual(formFiltersPrevious, formFiltersNext)) {
      // TODO(perf): filter out personal assignments and update state instead of
      //  fetching if only some assignment checkboxes were removed
      console.debug('Fetch personal assignments');
      const filterURLSearchParams = new FiltersURLSearchParams();
      filterURLSearchParams.assign(filtersNext);
      run(
        csrfToken,
        timeZone,
        updateState,
        studentGroups,
        filterURLSearchParams
      );
      // Rerender multiple select in CourseFilterForm
      updateState({
        personalAssignments: null
      });
    }

    if (fetchCounter > 0) {
      setPage(1);
    }
    // XXX: Skip `state` to trigger callback on changing query parameters only
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

    const filterURLSearchParams = new FiltersURLSearchParams();
    filterURLSearchParams.assign(filters, {
      [name]: values
    });
    navigate(window.location.pathname + filterURLSearchParams.toString());
  };

  const setActivitiesFilter = e =>
    setFilterValues('activities', e.target.value, e.target.checked);

  const setScoreFilter = e =>
    setFilterValues('score', e.target.value, e.target.checked);

  const setReviewersFilter = e => {
    const value =
      e.target.value !== 'unset'
        ? parseInt(e.target.value, 10)
        : e.target.value;
    setFilterValues('reviewers', value, e.target.checked);
  };

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
  const isLoaded = personalAssignments !== null;

  return (
    <>
      <h1 className="mb-30">
        Очередь проверки
        {isLoaded && (
          <span className="text-muted">
            &nbsp;{filteredPersonalAssignments.length}
          </span>
        )}
      </h1>
      <CourseFilterForm
        timeZone={timeZone}
        courseOptions={courseOptions}
        assignmentOptions={assignmentOptions}
        selectedCourse={filters.course}
        selectedAssignments={filters.assignments}
        onSubmitForm={handleSubmitForm}
      />
      <div className="row">
        <div className="col-xs-9">
          <PersonalAssignmentList
            page={page}
            setPage={setPage}
            isLoading={!isLoaded}
            assignments={assignments}
            items={filteredPersonalAssignments}
          />
        </div>

        <div className="col-xs-3">
          <div className="mb-30">
            <h5>Последняя активность</h5>
            {activityOptions.map(option => (
              <Checkbox
                name="activities"
                key={option.value}
                value={option.value}
                checked={
                  !!filters.activities &&
                  filters.activities.includes(option.value)
                }
                onChange={setActivitiesFilter}
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
                checked={
                  !!filters.score && filters.score.includes(option.value)
                }
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
                  checked={
                    !!filters.reviewers &&
                    filters.reviewers.includes(option.value)
                  }
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
                    checked={
                      !!filters.studentGroups &&
                      filters.studentGroups.includes(option.value)
                    }
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
