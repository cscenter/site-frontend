import { useState } from 'react';
import { formatWithOptions } from 'date-fns/fp';
import { ru } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';

export const activityOptions = [
  { value: 'ns', label: 'Отправлено решение' },
  { value: 'sc', label: 'Комментарий студента' },
  { value: 'tc', label: 'Комментарий преподавателя' },
  { value: 'unset', label: 'Нет активности' }
];

export const scoreOptions = [
  { value: 'unset', label: 'Без оценки' },
  { value: 'set', label: 'С оценкой' }
];

export function getScoreClass(state) {
  return state.replace('/_/g', '-');
}

// Doesn't support updating deep object values
export const stateReducer = (state, updateArg) => {
  if (typeof updateArg === 'function') {
    return { ...state, ...updateArg(state) };
  }
  return { ...state, ...updateArg };
};

export function parsePersonalAssignments({ items, timeZone, locale }) {
  const dateToString = formatWithOptions({ locale }, 'dd LLL HH:mm');
  items.forEach((item, i) => {
    if (item.activity) {
      const zonedDate = utcToZonedTime(item.activity.dt, timeZone);
      item.activity.dtFormatted = dateToString(zonedDate);
    }
    items[i] = {
      id: item.id,
      assignmentId: item.assignmentId,
      assignee: item.assignee,
      student: item.student,
      score: item.score,
      state: item.state,
      activity: item.activity
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
  return [filters, onFilterChange];
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
  return filterValues.includes(item.assignee !== null ? item.assignee.id.toString() : 'unset');
};

const includesScore = (item, filterValues) => {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  return filterValues.includes(item.score !== null ? 'set' : 'unset');
};

export function getFilteredPersonalAssignments(items, filters) {
  if (items === null) {
    return [];
  }
  return items.filter(item => {
    return (
      includesActivity(item, filters.activity) &&
      includesReviewer(item, filters.reviewers) &&
      includesScore(item, filters.score)
    );
  });
}
