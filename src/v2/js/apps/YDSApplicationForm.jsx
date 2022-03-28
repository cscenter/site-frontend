import * as PropTypes from 'prop-types';
import React, { useEffect, useReducer } from 'react';

import ky from 'ky';
import { useAsync } from 'react-async';
import { useForm } from 'react-hook-form';

import {
  Checkbox,
  CreatableSelect,
  ErrorMessage,
  InputField,
  MemoizedTextField,
  RadioGroup,
  RadioOption,
  Select,
  Tooltip
} from 'components';
import { optionStrType } from 'types/props';
import { showErrorNotification, showNotification } from 'utils';

// TODO: потестить isPending. Есть какой-то devtools для react-async

const Hint = ({ ...options }) => (
  <Tooltip {...options}>
    <span className="tooltip__icon _rounded">?</span>
  </Tooltip>
);

let openAuthPopup = function (url, nextURL = null) {
  if (nextURL !== null) {
    url += `?next=${nextURL}`;
  }
  const name = '';
  const settings = `height=600,width=700,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=yes,directories=no,status=yes`;
  window.open(url, name, settings);
};

const submitForm = async (
  [endpoint, csrfToken, setState, payload],
  props,
  { signal }
) => {
  const response = await ky.post(endpoint, {
    headers: {
      'X-CSRFToken': csrfToken
    },
    throwHttpErrors: false,
    json: payload,
    signal: signal
  });
  if (!response.ok) {
    if (response.status === 400) {
      const data = response.json();
      let msg = '<h5>Анкета не была сохранена</h5>';
      if (
        Object.keys(data).length === 1 &&
        Object.prototype.hasOwnProperty.call(data, 'non_field_errors')
      ) {
        msg += data['non_field_errors'];
        showErrorNotification(msg);
      } else {
        msg += 'Одно или более полей пропущены или заполнены некорректно.';
        showNotification(msg, { type: 'error', timeout: 3000 });
      }
    } else if (response.status === 403) {
      let msg = '<h5>Анкета не была сохранена</h5>Приемная кампания окончена.';
      showErrorNotification(msg);
    } else {
      showErrorNotification('Что-то пошло не так. Попробуйте позже.');
    }
  } else {
    setState({ isFormSubmitted: true });
  }
};

const msgRequired = 'Это поле обязательно для заполнения';
const rules = {
  lastName: { required: msgRequired },
  firstName: { required: msgRequired },
  patronymic: null,
  email: { required: msgRequired },
  phone: { required: msgRequired },
  birthDate: { required: msgRequired },
  livingPlace: { required: msgRequired },
  university_city: {required: msgRequired},
  university: { required: msgRequired },
  faculty: { required: msgRequired },
  course: {},
  isStudying: { required: msgRequired },
  yearOfGraduation: {required: msgRequired},
  ml_experience: {required: msgRequired},
  campaign: { required: msgRequired },
  motivation: { required: msgRequired },
  whereDidYouLearnOther: {},
  honesty: { required: msgRequired },
  agreement: { required: msgRequired }
};

function YDSApplicationForm({
  endpoint,
  csrfToken,
  authCompleteUrl,
  authBeginUrl,
  campaigns,
  universities,
  educationLevelOptions,
  initialState
}) {
  const initial = {
    ...initialState
  };

  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initial);
  const { isPending, run: runSubmit } = useAsync({ deferFn: submitForm });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    watch
  } = useForm({
    mode: 'onBlur',
    defaultValues: { agreement: false }
  });

  // TODO: what is it?
  useEffect(() => {
    register('is_studying', rules.isStudying);
    register('university', rules.university);
    register('campaign', rules.campaign);
    register('course', rules.course);
    register('honesty', rules.honesty);
    register('agreement', rules.agreement);
  }, [register]);

  const [
    isStudying,
    magistracy_and_shad,
    honestyConfirmed,
    agreementConfirmed
  ] = watch([
    'is_studying',
    'magistracy_and_shad',
    'honesty',
    'agreement',
  ]);

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    setValue(name, value);
  }

  function handleSelectChange(option, name) {
    setValue(name, option);
    trigger(name);
  }

  useEffect(() => {
    // Yandex.Passport global handlers (postMessage could be broken in IE11-)
    window.accessYandexLoginSuccess = login => {
      setState({ isYandexPassportAccessAllowed: true });
      showNotification('Доступ успешно предоставлен', { type: 'success' });
    };
    window.accessYandexLoginError = function (msg) {
      showNotification(msg, { type: 'error' });
    };
  }, []);

  let handleAccessYandexLogin = event => {
    event.preventDefault();
    const { isYandexPassportAccessAllowed } = state;
    if (isYandexPassportAccessAllowed) {
      return false;
    }
    openAuthPopup(authBeginUrl, authCompleteUrl);
    return false;
  };

  function onSubmit(data) {
    let { is_studying, course, university, ticket_access, email_subscription, ...payload } = data;
    payload['is_studying'] = is_studying === 'yes';
    payload['magistracy_and_shad'] = magistracy_and_shad === 'yes';
    payload['level_of_education'] = course && course.value;
    payload['email_subscription'] = email_subscription === true;
    payload['ticket_access'] = ticket_access === true;
    if (university) {
      if (university.__isNew__) {
        payload['university_other'] = university.value;
      } else {
        payload['university'] = university.value;
      }
    }
    runSubmit(endpoint, csrfToken, setState, payload);
  }

  const { isYandexPassportAccessAllowed, isFormSubmitted } = state;

  if (isFormSubmitted) {
    return (
      <>
        <h3>Ваша заявка принята!</h3>
        Мы выслали вам на почту письмо — прочитайте его и переходите к тесту.<br/>
        Если письмо не пришло в течение часа и его не оказалось в папке «Спам» или «Промоакции»,
          пишите на <a href="mailto:shad@yandex-team.ru.">shad@yandex-team.ru.</a><br/>
          Не забудьте указать свои ФИО и email.
      </>
    );
  }

  return (
      <form className="ui form" onSubmit={handleSubmit(onSubmit)}>
          <div className="card__title">
              <h2 className="mb-3">Набор в ШАД 2022</h2>
          </div>
          <div className="card__content">
              <div className="row mb-4">
                  <div className="field col-lg-6 mb-2">
                    <label>
                      Доступ к данным на Яндексе <span className="asterisk">*</span>&nbsp;
                      <Hint
                        html={
                          'Вступительный тест организован в системе Яндекс.Контест. Чтобы выдать права участника и затем сопоставить результаты с анкетами, нам нужно знать ваш логин на Яндексе без ошибок, учитывая все особенности, например, вход через социальные сети. Чтобы всё сработало, поделитесь с нами доступом к некоторым данным из вашего Яндекс.Паспорта: логин и ФИО.'
                        }
                      />

                    </label>
                    <div className="grouped inline">
                      <Checkbox
                        required
                        label={
                          isYandexPassportAccessAllowed
                            ? 'Доступ разрешен'
                            : 'Разрешить доступ'
                        }
                        disabled={isYandexPassportAccessAllowed}
                        checked={isYandexPassportAccessAllowed}
                        onChange={() => {}}
                        onClick={handleAccessYandexLogin}
                      />
                    </div>
                  </div>
              </div>
              <div className="row">
                  <InputField
                    name="last_name"
                    control={control}
                    rules={rules.lastName}
                    label={<>Фамилия <span className="asterisk">*</span></>}
                    wrapperClass="col-lg-6"
                  />
                  <InputField
                    control={control}
                    rules={rules.firstName}
                    name="first_name"
                    label={<>Имя <span className="asterisk">*</span></>}
                    wrapperClass="col-lg-6"
                  />
                  <InputField
                    control={control}
                    rules={rules.patronymic}
                    name="patronymic"
                    label={'Отчество'}
                    wrapperClass="col-lg-6"
                  />
              </div>
              <div className="row">
                  <InputField
                    control={control}
                    rules={rules.email}
                    name="email"
                    type="email"
                    label={<>Электронная почта <span className="asterisk">*</span></>}
                    helpText="Обязательно проверьте правильность адреса"
                    wrapperClass="col-lg-6"
                  />
                  <InputField
                    control={control}
                    rules={rules.phone}
                    name="phone"
                    label={<>Контактный телефон <span className="asterisk">*</span></>}
                    wrapperClass="col-lg-6"
                    placeholder="+7 (999) 1234567"
                  />
                  <InputField
                    control={control}
                    rules={rules.birthDate}
                    name="birth_date"
                    type="date"
                    label={<>Дата рождения <span className="asterisk">*</span></>}
                    helpText="Обязательно проверьте правильность адреса"
                    wrapperClass="col-lg-6"
                  />
                  <InputField
                    control={control}
                    rules={rules.livingPlace}
                    name="living_place"
                    label={<>В каком городе вы живёте? <span className="asterisk">*</span></>}
                    wrapperClass="col-lg-6"
                    placeholder=""
                  />
              </div>
              <div className="row">
                  <div className="field col-12">
                      <div className="grouped">
                          <label className="title-label">В каком городе вы хотите учиться в ШАД? <span
                              className="asterisk"
                          >*</span></label>
                          <RadioGroup
                              required
                              name="campaign"
                              onChange={handleInputChange}
                          >{campaigns.map(branch => (
                              <RadioOption
                                  key={branch.id}
                                  id={`campaign-${branch.value}`}
                                  value={branch.id}
                              >{branch.label}</RadioOption>
                          ))}
                          </RadioGroup>
                      </div>
                  </div>
              </div>
              <div className="row">
                  <div className="col-12">
                      <label className="title-label">В каком университете вы учитесь/учились? <span className="asterisk"
                      >*</span></label>
                  </div>
                  <InputField
                    control={control}
                    rules={rules.livingPlace}
                    name="university_city"
                    wrapperClass="col-lg-6"
                    placeholder="Город"
                  />
                  <div className="field col-lg-6">
                    <div className="ui select">
                      <CreatableSelect
                        required
                        components={{
                          DropdownIndicator: null
                        }}
                        openMenuOnFocus={true}
                        isClearable={true}
                        onChange={handleSelectChange}
                        onBlur={e => trigger('university')}
                        name="university"
                        placeholder="Университет"
                        options={universities}
                        menuPortalTarget={document.body}
                        errors={errors}
                      />
                    </div>
                    <ErrorMessage errors={errors} name={'university'} />
                  </div>
                  <div className="field col-12">
                      <div className="grouped">
                          <label className="title-label">Учитесь ли вы сейчас в университете? <span className="asterisk"
                          >*</span></label>
                            <RadioGroup
                              required
                              name="is_studying"
                              className="inline pt-0"
                              onChange={handleInputChange}
                            >
                              <RadioOption id="yes">Да</RadioOption>
                              <RadioOption id="no">Нет</RadioOption>
                            </RadioGroup>
                      </div>
                  </div>
                  {isStudying && isStudying === 'yes' && (
                      <div className="field col-lg-6">
                        <div className="ui select">
                              <label>На каком курсе вы сейчас учитесь? <span className="asterisk"
                              >*</span></label>
                          <Select
                            onChange={handleSelectChange}
                            onBlur={e => trigger('course')}
                            name="course"
                            isClearable={false}
                            placeholder="Выберите из списка"
                            options={educationLevelOptions}
                            menuPortalTarget={document.body}
                            errors={errors}
                          />
                          <ErrorMessage errors={errors} name={'course'} />
                        </div>
                      </div>
                  )}
              </div>
              <div className="row">
                  <InputField
                    control={control}
                    rules={rules.faculty}
                    name="faculty"
                    label={<>На каком факультете вы учитесь/учились? На какой кафедре? <span className="asterisk">*</span></>}
                    wrapperClass="col-lg-6"
                  />
                  <InputField
                    control={control}
                    rules={rules.yearOfGraduation}
                    name="year_of_graduation"
                    type="number"
                    label={<>В каком году вы закончите/закончили университет? <span className="asterisk">*</span></>}
                    wrapperClass="col-lg-6"
                  />
                  <MemoizedTextField
                    name="where_did_you_learn_other"
                    control={control}
                    rules={rules.whereDidYouLearnOther}
                    wrapperClass="col-lg-12"
                    label="Откуда вы узнали про ШАД?"
                  />
                  <MemoizedTextField
                    name="motivation"
                    control={control}
                    rules={rules.motivation}
                    wrapperClass="col-lg-12"
                    label={<>Зачем вы поступаете в ШАД? Расскажите чему вы ожидаете научиться в ШАД, для чего вам
                      эти знания, какое направление привлекает больше всего.
                      Чем честнее ответ - тем лучше. <span className="asterisk">*</span></>}
                  />
                  <MemoizedTextField
                    name="ml_experience"
                    control={control}
                    rules={rules.ml_experience}
                    wrapperClass="col-lg-12"
                    label={<>Изучали ли вы раньше машинное обучение/анализ данных?
                    Каким образом? Какие навыки удалось приобрести, какие проекты сделать? <span className="asterisk">*
                    </span></>}
                  />
                  <div className="col-lg-12">
                      <div className="grouped mb-4">
                          <Checkbox
                              name={'ticket_access'}
                              label={'Мне был предоставлен билет на прошлом отборе в ШАД'}
                              onChange={handleInputChange}
                          />
                      </div>
                  </div>
                  <div className="field col-12">
                      <div className="grouped">
                          <label className="title-label">Планируете ли вы поступать в этом году на одну из совместных с
                              ШАД магистерских программ?  <span className="asterisk">*</span></label>
                          <RadioGroup
                              required
                              name="magistracy_and_shad"
                              onChange={handleInputChange}
                          >
                              <RadioOption id="yes">Да</RadioOption>
                              <RadioOption id="no">Нет</RadioOption>
                          </RadioGroup>
                      </div>
                  </div>
                  <div className="col-lg-12">
                      <div className="grouped mb-4">
                          <Checkbox
                              required
                              name={'honesty'}
                              label={<>Я обещаю самостоятельно выполнять все задания всех этапов поступления в ШАД,
                                  не списывать и не давать списывать, не публиковать задания теста и экзамена в открытом
                                  доступе, не использовать более одного логина для участия в отборе ШАД. <span
                                  className="asterisk">*</span></>}
                              onChange={handleInputChange}
                          />
                      </div>
                  </div>
                  <div className="col-lg-12">
                      <div className="grouped mb-4">
                          <Checkbox
                              required
                              name={'agreement'}
                              label={<>
                              Я согласен (-на) на обработку указанных данных на условиях <a
                                      href="https://yandex.ru/legal/sad_personal_data/?lang=ru" target="_blank"
                                      rel="nofollow noopener">Правил обработки персональных данных участника проекта
                                  «Школа Анализа Данных»</a> <span
                                      className="asterisk">*</span></>}
                              onChange={handleInputChange}
                          />
                      </div>
                  </div>
                  <div className="col-lg-12">
                      <div className="grouped mb-4">
                          <Checkbox
                              name={'email_subscription'}
                              label={'Я согласен (-на) на получение новостной и рекламной рассылки от АНО ДПО "ШАД" и ООО "ЯНДЕКС'}
                              onChange={handleInputChange}
                          />
                      </div>
                  </div>
              </div>
              <div className="row">
                  <button
                    type="submit"
                    disabled={!agreementConfirmed || !honestyConfirmed || isPending}
                    className="btn _primary _m-wide mb-6"
                  >
                    Подать заявку
                </button>
              </div>
          </div>
      </form>
  );
}

YDSApplicationForm.propTypes = {
  initialState: PropTypes.shape({
    isYandexPassportAccessAllowed: PropTypes.bool.isRequired
  }).isRequired,
  endpoint: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
  authBeginUrl: PropTypes.string.isRequired,
  authCompleteUrl: PropTypes.string.isRequired,
  campaigns: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    })
  ).isRequired,
  universities: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  educationLevelOptions: PropTypes.arrayOf(optionStrType).isRequired,
};

export default YDSApplicationForm;
