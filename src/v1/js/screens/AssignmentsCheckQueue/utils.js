import { useEffect, useMemo, useRef, useState } from 'react';

import { utcToZonedTime } from 'date-fns-tz';
import { formatWithOptions } from 'date-fns/fp';
import { useLocation } from 'react-router-dom';

export const scoreOptions = [
  { value: 'unset', label: 'Без оценки' },
  { value: 'set', label: 'С оценкой' }
];

export const sortEnum = {
  SOLUTION_DESC: 'solution_desc',
  SOLUTION_ASC: 'solution_asc',
  NAME_ASC: 'name_asc'
};

export const sortOptions = [
  { value: sortEnum.SOLUTION_DESC, label: 'Новые решения' },
  { value: sortEnum.SOLUTION_ASC, label: 'Старые решения' },
  { value: sortEnum.NAME_ASC, label: 'Фамилия студента' }
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
    const params = new URLSearchParams();
    
    // Add course parameter
    if (this.course) {
      params.append('course', this.course);
    }
    
    // Add assignments parameter
    if (this.assignments && this.assignments.length > 0) {
      params.append('assignments', this.assignments.join(','));
    }
    
    // Add other filter parameters
    const filters = {
      reviewers: this.reviewers,
      statuses: this.statuses,
      score: this.score,
      studentGroups: this.studentGroups,
      programYear: this.programYear,
      sort: this.sort
    };

    Object.entries(filters).forEach(([name, value]) => {
      if (value && value.length > 0) {
        // Ensure all values are properly joined as strings and no duplicates
        if (Array.isArray(value)) {
          // Remove any potential duplicates
          const uniqueValues = [...new Set(value)];
          params.append(name, uniqueValues.join(','));
        } else {
          params.append(name, value);
        }
      }
    });

    return `?${params.toString()}`;
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
          .filter(Boolean);
      } 
      else if (key === 'programYear') {
          value = value
            .split(',')
            .map(x => parseInt(x, 10))
            .filter(Boolean);
      } 
      else if (['score', 'statuses'].includes(key)) {
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
    if (item.solutionAt !== null) {
      item.solutionAt = new Date(item.solutionAt); // in UTC
    }
   
    // Convert programYear to integer for consistent comparison
    let programYearValue = 0;
    try {
      if (item.student.yearOfCurriculum !== null && item.student.yearOfCurriculum !== undefined) {
        programYearValue = parseInt(String(item.student.yearOfCurriculum).trim(), 10);
        if (isNaN(programYearValue)) {
          programYearValue = 0;
        }
      }
    } catch (e) {
      console.error('Error parsing programYear:', e);
      programYearValue = 0;
    }
    
    items[i] = {
      id: item.id,
      assignmentId: item.assignmentId,
      assignee: item.assignee,
      student: item.student,
      score: item.score,
      solutionAt: item.solutionAt,
      status: item.status,
      studentGroupId: studentGroups.get(item.student.id),
      programYear: programYearValue
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

const includesProgramYear = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  
  const itemYear = item.programYear || 0;
  
  if (filterValues.includes(0) && itemYear === 0) {
    return true;
  }
  
  const result = filterValues.includes(itemYear);
  
  return result;
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
      includesStudentGroup(item, filters.studentGroups) &&
      includesProgramYear(item, filters.programYear)
    );
  });
}

export function sortPersonalAssignments(items, order) {
  if (order === sortEnum.SOLUTION_DESC) {
    // New solutions first
    items.sort(sortPersonalAssignmentsByFirstSolutionDesc);
  } else if (order === sortEnum.SOLUTION_ASC) {
    items.sort(sortPersonalAssignmentsByFirstSolutionAsc);
  } else {
    items.sort((a, b) => a.student.lastName.localeCompare(b.student.lastName));
  }
  return items;
}

// New solutions first, then null values
function sortPersonalAssignmentsByFirstSolutionAsc(a, b) {
  if (a.solutionAt === null && b.solutionAt === null) {
    return a.id - b.id;
  } else if (a.solutionAt === null) {
    return 1;
  } else if (b.solutionAt == null) {
    return -1;
  }
  return a.solutionAt - b.solutionAt;
}

// TODO: impress with ASC version but null's should go last
function sortPersonalAssignmentsByFirstSolutionDesc(a, b) {
  if (a.solutionAt === null && b.solutionAt === null) {
    return a.id - b.id;
  } else if (a.solutionAt === null) {
    return 1;
  } else if (b.solutionAt == null) {
    return -1;
  }
  return b.solutionAt - a.solutionAt;
}
