import React, { useState } from 'react';
import '@cscenter/react-dates/initialize';
import PropTypes from 'prop-types';
import useFetch from 'use-http';
import {
  SingleDatePicker,
  isInclusivelyAfterDay,
  isSameDay
} from '@cscenter/react-dates';
import _uniqWith from 'lodash-es/uniqWith';
import { ICON_AFTER_POSITION } from '@cscenter/react-dates/lib/constants';
import '@cscenter/react-dates/lib/css/_datepicker.css';
import moment from 'moment';
import cn from 'classnames';
import { showNotification, showErrorNotification } from '../utils';

moment.locale('ru');

const dateFormat = 'YYYY-MM-DD';

function Appointment({ endpoint, invitationDeadline, csrfToken, days }) {
  const [state, setState] = useState({
    date: null,
    slot: null,
    venue: null,
    isInvitationAccepted: false
  });
  const [focusedInput, setFocusedInput] = useState(false);
  const options = {
    onError: ({ error }) => {
      if (response.status >= 500 && response.status < 600) {
        showErrorNotification(`${response.statusText}. Try again later.`);
      } else {
        const messages = response.data.errors.map(error => error.message);
        showErrorNotification(messages.join('<br/>'));
      }
    },
    cacheLife: 0,
    cachePolicy: 'no-cache',
    headers: {
      'X-CSRFToken': csrfToken
    }
  };
  const { post, loading, error, response } = useFetch('', options);
  const { date, slot } = state;

  const handleDateChange = date => {
    setState(prevState => ({ ...prevState, date, slot: null }));
  };

  const takeSlot = async () => {
    const data = await post(endpoint.replace('{slotId}', slot.value));
    if (response.ok) {
      showNotification('Приглашение успешно принято.', { type: 'success' });
      setState(prevState => ({ ...prevState, isInvitationAccepted: true }));
    }
  };

  let highlightedDays = days.map(day => moment(day.date, dateFormat, true));
  highlightedDays = _uniqWith(highlightedDays, isSameDay);
  const firstDay = highlightedDays.reduce((acc, current) => {
    return acc.isBefore(current) ? acc : current;
  });
  const lastDay = highlightedDays.reduce((acc, current) => {
    return acc.isAfter(current) ? acc : current;
  });
  const nextAfterLastDay = moment(lastDay).add(1, 'days');

  const dateFormatted = date && date.format(dateFormat);
  const selectedDays = days.filter(({ date }) => date === dateFormatted);

  const canSubmit = date !== null && slot !== null;

  if (state.isInvitationAccepted) {
    return (
      <div id={'appointment__card'} className="card border-xs-0 grey-bg">
        <div className="card__header _big">
          <h2 className="mb-2">Ждём вас на собеседование</h2>
          <b>Дата и время</b>: {date.format('DD MMMM, dddd')} в {slot.label}
          <br />
          <b>Место проведения</b>: {state.venue.name}
        </div>
      </div>
    );
  }

  return (
    <>
      <div id={'appointment__card'} className="card border-xs-0 grey-bg">
        <div className="card__header _big pb-0">
          <h2 className="mb-2">Приглашаем вас на собеседование</h2>
          Выберите дату и время из доступных вариантов.
          <br />
          Приглашение будет актуально до {invitationDeadline} по московскому
          времени.
        </div>
        <div className="card__content _big">
          <SingleDatePicker
            id="date_input"
            date={date}
            minDate={firstDay}
            maxDate={lastDay}
            isOutsideRange={day =>
              // !isInclusivelyAfterDay(day, firstDay) ||
              // isInclusivelyAfterDay(day, nextAfterLastDay)
              !highlightedDays.some(day2 => {
                return isSameDay(day, day2);
              })
            }
            isDayHighlighted={day1 =>
              highlightedDays.some(day2 => {
                return isSameDay(day1, day2);
              })
            }
            onDateChange={handleDateChange}
            showDefaultInputIcon={true}
            placeholder={'Дата собеседования'}
            focused={focusedInput}
            onFocusChange={({ focused }) => setFocusedInput(focused)}
            numberOfMonths={1}
            inputIconPosition={ICON_AFTER_POSITION}
            hideKeyboardShortcutsPanel={true}
            displayFormat={() => moment.localeData().longDateFormat('LL')}
            transitionDuration={0}
          />
          {selectedDays.length > 0 && (
            <>
              {selectedDays.map(selectedDay => (
                <div className="mt-8" key={`day_${selectedDay.id}`}>
                  <h4>
                    <b>Место проведения</b>: {selectedDay.venue.name}
                  </h4>
                  {selectedDay.section.value !== 'all_in_1' && (
                    <h4>
                      <b>Секция</b>: {selectedDay.section.label}
                    </h4>
                  )}
                  <div className="appointment-slots flex-gap">
                    {selectedDay.slots.map(s => {
                      return (
                        <label
                          className={cn({
                            'btn _small _outline _gray slot': true,
                            slot__disabled: !s.available,
                            slot__selected: slot && slot.value === s.value
                          })}
                          key={`day_${s.value}`}
                          onClick={() =>
                            s.available &&
                            setState(prevState => ({
                              ...prevState,
                              slot: s,
                              venue: selectedDay.venue
                            }))
                          }
                        >
                          <input
                            type="radio"
                            name="time"
                            autoComplete="off"
                            value={s.value}
                          />
                          {s.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
          {canSubmit && (
            <>
              <hr className="my-8" />
              <h3>Проверьте данные</h3>
              <b>Дата и время</b>: {date.format('DD MMMM, dddd')} в {slot.label}
              <br />
              <b>Место проведения</b>: {state.venue.name}
            </>
          )}
        </div>
        <div className="card__content _big _meta">
          <button
            disabled={!canSubmit}
            className="btn _big _primary"
            onClick={() => {!loading && takeSlot()}}
          >
            Записаться
          </button>
        </div>
      </div>
    </>
  );
}

Appointment.propTypes = {
  endpoint: PropTypes.string.isRequired,
  invitationDeadline: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
  days: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      format: PropTypes.string.isRequired,
      section: PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
      }),
      venue: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
      }),
      slots: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.number.isRequired,
          label: PropTypes.string.isRequired,
          available: PropTypes.bool.isRequired
        })
      )
    })
  ).isRequired
};

export default Appointment;
