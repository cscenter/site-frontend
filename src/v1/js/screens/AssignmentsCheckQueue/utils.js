import { useEffect, useMemo, useRef, useState } from 'react';
import { formatWithOptions } from 'date-fns/fp';
import { utcToZonedTime } from 'date-fns-tz';
import { useLocation } from 'react-router-dom';

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
    const selectedStatuses = this['statuses'];
    if (selectedStatuses && selectedStatuses.length > 0) {
      search += `&statuses=${selectedStatuses.join(',')}`;
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
      } else if (['score', 'statuses'].includes(key)) {
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

export function parsePersonalAssignments({ items, studentGroups, timeZone, locale }) {
  items.forEach((item, i) => {
    if (item.firstSolutionAt !== null) {
      item.firstSolutionAt = utcToZonedTime(item.firstSolutionAt, timeZone);
    }
    items[i] = {
      id: item.id,
      assignmentId: item.assignmentId,
      assignee: item.assignee,
      student: item.student,
      score: item.score,
      firstSolutionAt: item.firstSolutionAt,
      status: item.status,
      activity: item.activity,
      studentGroupId: studentGroups.get(item.student.id)
    };
  });
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

const includesStatuses = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  return filterValues.includes(item.status);
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
      includesStatuses(item, filters.statuses) &&
      includesReviewer(item, filters.reviewers) &&
      includesScore(item, filters.score) &&
      includesStudentGroup(item, filters.studentGroups)
    );
  });
}

export function sortPersonalAssignments(items, order) {
  items.sort(sortPersonalAssignmentsByFirstSolutionAsc);
  return items;
}

function sortPersonalAssignmentsByFirstSolutionAsc(a, b) {
  if (a.firstSolutionAt === null && b.firstSolutionAt === null) {
    return 0;
  } else if (a.firstSolutionAt === null) {
    return 1;
  } else if (b.firstSolutionAt == null) {
    return -1;
  }
  return a.firstSolutionAt - b.firstSolutionAt;
}

function sortPersonalAssignmentsByFirstSolutionDesc(a, b) {
  if (a.firstSolutionAt === null && b.firstSolutionAt === null) {
    return 0;
  } else if (a.firstSolutionAt === null) {
    return 1;
  } else if (b.firstSolutionAt == null) {
    return -1;
  }
  return a.firstSolutionAt - b.firstSolutionAt;
}
