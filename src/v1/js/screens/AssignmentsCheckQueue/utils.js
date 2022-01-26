import { useState, useEffect, useRef, useMemo } from 'react';
import { formatWithOptions } from 'date-fns/fp';
import { utcToZonedTime } from 'date-fns-tz';
import { useLocation } from 'react-router-dom';

export const activities = {
  NS: 'ns',
  SC: 'sc',
  TC: 'tc',
  UNSET: 'unset'
};

export const activityOptions = [
  { value: activities.NS, label: 'Отправлено решение' },
  { value: activities.SC, label: 'Комментарий студента' },
  { value: activities.TC, label: 'Комментарий преподавателя' },
  { value: activities.UNSET, label: 'Нет активности' }
];

export const scoreOptions = [
  { value: 'unset', label: 'Без оценки' },
  { value: 'set', label: 'С оценкой' }
];

export function getScoreClass(status) {
  return (status || '').replace('/_/g', '-');
}

export const useIsMount = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

export const FiltersURLSearchParams = (function () {
  function FiltersURLSearchParams() {}

  FiltersURLSearchParams.prototype.assign = function (...sources) {
    Object.assign(this, ...sources);
  };

  // TODO: configure name alias and value serializer with object constructor or try to replace with `query-string` package
  FiltersURLSearchParams.prototype.toString = function () {
    let search = `?course=${this.course}&assignments=${this.assignments.join(',')}`;
    if (this['reviewers'] && this['reviewers'].length > 0) {
      search += `&reviewers=${this['reviewers'].join(',')}`;
    }
    const selectedActivities = this['activities'];
    if (selectedActivities && selectedActivities.length > 0) {
      search += `&activities=${selectedActivities.join(',')}`;
    } else {
      search += `&activities=`;
    }
    if (this['score'] && this['score'].length > 0) {
      search += `&score=${this['score'].join(',')}`;
    }
    if (this['studentGroups'] && this['studentGroups'].length > 0) {
      search += `&studentGroups=${this['studentGroups'].join(',')}`;
    }
    return search;
  };

  return FiltersURLSearchParams;
})();

// TODO: Include polyfill https://www.npmjs.com/package/@ungap/url-search-params
export function useQueryParams() {
  let location = useLocation();
  return useMemo(() => {
    const params = {};
    const props = new URLSearchParams(location.search);
    for (let [key, value] of props.entries()) {
      if (key === 'course') {
        value = parseInt(value, 10) || null;
      } else if (['assignments', 'studentGroups'].includes(key)) {
        value = value
          .split(',')
          .map(x => parseInt(x, 10))
          .filter(Boolean); // Removes all falsy values including zeroes
      } else if (['score', 'activities'].includes(key)) {
        value = value.split(',').filter(Boolean);
      } else if (key === 'reviewers') {
        value = value
          .split(',')
          .map(x => (x !== 'unset' ? parseInt(x, 10) : x))
          .filter(Boolean); // Removes all falsy values including zeroes
      }
      params[key] = value;
    }
    return params;
  }, [location.search]);
}

// Doesn't support updating deep object values
export const stateReducer = (state, updateArg) => {
  if (typeof updateArg === 'function') {
    return { ...state, ...updateArg(state) };
  }
  return { ...state, ...updateArg };
};

function sortPersonalAssignmentsByLatestActivityAsc(a, b) {
  if (a.activity === null && b.activity === null) {
    return 0;
  } else if (a.activity === null) {
    return -1;
  } else if (b.activity == null) {
    return 1;
  }
  return a.activity.dt - b.activity.dt;
}

export function parsePersonalAssignments({ items, studentGroups, timeZone, locale }) {
  const dateToString = formatWithOptions({ locale }, 'dd LLL HH:mm');
  items.forEach((item, i) => {
    if (item.activity) {
      const zonedDate = utcToZonedTime(item.activity.dt, timeZone);
      item.activity.dt = zonedDate;
      item.activity.dtFormatted = dateToString(zonedDate);
    }
    items[i] = {
      id: item.id,
      assignmentId: item.assignmentId,
      assignee: item.assignee,
      student: item.student,
      score: item.score,
      status: item.status,
      activity: item.activity,
      studentGroupId: studentGroups.get(item.student.id)
    };
  });
  items.sort(sortPersonalAssignmentsByLatestActivityAsc);
  return items;
}

export function parseAssignments({ items, timeZone, locale }) {
  const data = new Map();
  const dateToString = formatWithOptions({ locale }, 'dd.MM.yyyy HH:mm');
  items.sort((a, b) => b.id - a.id);
  for (const item of items) {
    const utcTime = item.deadlineAt;
    const zonedDate = utcToZonedTime(utcTime, timeZone);
    item.deadlineAtFormatted = dateToString(zonedDate);
    data.set(item.id, item);
  }
  return data;
}

export const useFilterState = (initialState = {}) => {
  const [filters, setFilters] = useState(initialState);
  const onFilterChange = ({ name, value }) => {
    if (!value || (value && value.length === 0)) {
      const newFilters = Object.assign({}, filters);
      delete newFilters[name];
      setFilters(newFilters);
    } else {
      setFilters(Object.assign({}, filters, { [name]: value }));
    }
  };
  return [filters, setFilters, onFilterChange];
};

export const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x); // eslint-disable-line

const includesActivity = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  return filterValues.includes(item.activity !== null ? item.activity.code : 'unset');
};

const includesReviewer = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  return filterValues.includes(item.assignee !== null ? item.assignee.id : 'unset');
};

const includesScore = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  return filterValues.includes(item.score !== null ? 'set' : 'unset');
};

const includesStudentGroup = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  return filterValues.includes(item.studentGroupId);
};

export function getFilteredPersonalAssignments(items, filters) {
  if (items === null) {
    return [];
  }
  return items.filter(item => {
    return (
      includesActivity(item, filters.activities) &&
      includesReviewer(item, filters.reviewers) &&
      includesScore(item, filters.score) &&
      includesStudentGroup(item, filters.studentGroups)
    );
  });
}
