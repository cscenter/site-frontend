import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';
import _xor from 'lodash-es/xor';
import 'bootstrap-select/js/bootstrap-select';
import 'bootstrap-select/js/i18n/defaults-ru_RU';
import { parseAssignments } from './utils';

const onCourseChange = async (
  course,
  timeZone,
  assignmentsSelectRef,
  setCourse,
  setAssignments
) => {
  const endpoint = `/api/v1/teaching/courses/${course}/assignments/`;

  const response = await ky.get(endpoint);
  const assignmentsSelect = $(assignmentsSelectRef.current);
  const data = await response.json();
  const assignments = parseAssignments({ items: data, timeZone });
  const options = [];
  assignments.forEach(item => {
    options.push(
      $('<option>', {
        text: item.title,
        value: item.id
      })
    );
  });
  assignmentsSelect.empty().append(options);
  assignmentsSelect.attr('disabled', options.length === 0);
  setCourse(course);
  setAssignments([]);
};

const CourseFilterForm = ({
  timeZone,
  courseOptions,
  assignmentOptions,
  initialFilters
}) => {
  const assignmentsSelectRef = useRef(null);
  const [course, setCourse] = useState(initialFilters.course);
  const [assignments, setAssignments] = useState(
    initialFilters.selectedAssignments
  );
  const filterButtonDisabled =
    assignments.length === 0 ||
    _xor(assignments, initialFilters.selectedAssignments).length === 0;

  const submitForm = e => {
    e.preventDefault();
    window.location.href =
      window.location.pathname +
      `?course=${course}&assignments=${assignments.join(',')}`;
  };

  useEffect(() => {
    $('select[name=assignments], select[name=course]').selectpicker({
      iconBase: 'fa',
      tickIcon: 'fa-check'
    });
  }, []);

  useEffect(() => {
    $('select[name=assignments]').selectpicker('refresh');
  });

  return (
    <form
      action=""
      className="mb-30"
      id="assignment-filters"
      onSubmit={submitForm}
    >
      <div className="row">
        <div className="col-xs-4">
          <div className="form-group">
            <label htmlFor="id_course" className="control-label">
              Прочтение курса
            </label>
            <div className="controls">
              <select
                name="course"
                className="select form-control my-picker"
                id="id_course"
                value={course}
                onChange={e => {
                  onCourseChange(
                    e.target.value,
                    timeZone,
                    assignmentsSelectRef,
                    setCourse,
                    setAssignments
                  );
                }}
              >
                {courseOptions.map(option => (
                  <option key={`course-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="col-xs-5">
          <div className="form-group">
            <label htmlFor="id_assignment" className="control-label">
              Задания
            </label>
            <div className="controls">
              <select
                ref={assignmentsSelectRef}
                name="assignments"
                className="select form-control my-picker"
                id="id_assignment"
                multiple
                size="1"
                value={assignments}
                disabled={assignmentOptions.length === 0}
                onChange={e => {
                  const selectedValues = $(assignmentsSelectRef.current)
                    .val()
                    .map(v => parseInt(v));
                  setAssignments(selectedValues);
                }}
                data-selected-text-format="count > 1"
              >
                {assignmentOptions.map(option => (
                  <option
                    key={`assignment-${option.value}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="col-xs-3">
          <button
            type="submit"
            className="btn btn-primary btn-block -inline-submit"
            disabled={filterButtonDisabled}
          >
            Фильтровать
          </button>
        </div>
      </div>
    </form>
  );
};

CourseFilterForm.propTypes = {
  timeZone: PropTypes.string.isRequired,
  courseOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  assignmentOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  initialFilters: PropTypes.shape({
    course: PropTypes.number.isRequired,
    selectedAssignments: PropTypes.arrayOf(PropTypes.number).isRequired
  }).isRequired
};

export default CourseFilterForm;
