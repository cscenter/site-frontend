import * as PropTypes from 'prop-types';
import React, { useEffect, useReducer, useState } from 'react';

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
      const data = await response.json();
      console.log(data);
      let msg = '<h5>Анкета не была сохранена</h5>';
      if (
        Object.keys(data).length === 1 &&
        Object.prototype.hasOwnProperty.call(data, 'non_field_errors')
      ) {
        msg += data['non_field_errors'];
        showErrorNotification(msg);
        console.log(`Non field errors: ${data}`);
      } else {
        msg += 'Одно или более полей пропущены или заполнены некорректно:';
        msg += `<br/>${JSON.stringify(data)}`;
        showNotification(msg, { type: 'error' });
      }
    } else if (response.status === 403) {
      let msg = '<h5>Анкета не была сохранена</h5>Приемная кампания окончена.';
      showErrorNotification(msg);
    } else {
      showErrorNotification(
        `Что-то пошло не так: код ошибки ${response.status}.<br/>
               Пожалуйста, обратитесь на почту, указанную внизу анкеты.`
      );
    }
  } else {
    setState({ isFormSubmitted: true });
  }
};

const msgRequired = 'Это поле обязательно для заполнения';
const rules = {
  lastName: { required: msgRequired },
  firstName: { required: msgRequired },
  patronymic: { required: msgRequired },
  email: { required: msgRequired },
  phone: { required: msgRequired },
  birthDate: { required: msgRequired },
  livingPlace: { required: msgRequired },
  universityCity: { required: msgRequired },
  university: { required: msgRequired },
  faculty: { required: msgRequired },
  shadPlusRash: {},
  newTrack: {},
  newTrackScientificArticles: null,
  newTrackProjects: null,
  newTrackTechArticles: null,
  newTrackProjectDetails: null,
  course: {},
  isStudying: { required: msgRequired },
  yearOfGraduation: { required: msgRequired },
  ml_experience: { required: msgRequired },
  campaign: { required: msgRequired },
  motivation: { required: msgRequired },
  whereDidYouLearnOther: {},
  honesty: { required: msgRequired },
  shadAgreement: { required: msgRequired }
};

function YDSApplicationForm({
  endpoint,
  endpointCities,
  endpointUniversities,
  csrfToken,
  authCompleteUrl,
  authBeginUrl,
  campaigns,
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
    unregister,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    watch
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      shad_agreement: false,
      rash_agreement: false,
      honesty: false
    }
  });
  const [cities, setCities] = useState([]);
  useEffect(() => {
    fetch(endpointCities)
      .then(response => response.json())
      .then(data => {
        console.debug('Fetching cities');
        setCities(data.map(({ id, name }) => ({ value: id, label: name })));
      })
      .catch(errors => {
        showErrorNotification(`Не удалось загрузить список городов, пожалуйста, обратитесь на почту,
                                                        указанную внизу анкеты.<br>${errors.toString()}`);
        console.error(errors);
      });
  }, [endpointCities]);

  useEffect(() => {
    register('is_studying', rules.isStudying);
    register('university', rules.university);
    register('university_city', rules.universityCity);
    register('campaign', rules.campaign);
    register('course', rules.course);
    register('honesty', rules.honesty);
    register('shad_agreement', rules.shadAgreement);
    register('shad_plus_rash', rules.shadPlusRash);
    register('new_track', rules.newTrack);
  }, [register]);
  let [
    campaign,
    university,
    universityCity,
    isStudying,
    honestyConfirmed,
    agreementConfirmed,
    shadPlusRash,
    rashConfirmed,
    newTrack
  ] = watch([
    'campaign',
    'university',
    'university_city',
    'is_studying',
    'honesty',
    'shad_agreement',
    'shad_plus_rash',
    'rash_agreement',
    'new_track'
  ]);

  const [universities, setUniversities] = useState([]);
  useEffect(() => {
    if (universityCity !== undefined && universityCity !== null) {
      let isNum = /^\d+$/.test(universityCity.value);
      if (!isNum) {
        return;
      }
      fetch(`${endpointUniversities}?city=${universityCity.value}`)
        .then(response => response.json())
        .then(data => {
          console.debug('Fetching universities from ', universityCity);
          setUniversities(
            data.map(({ id, name }) => ({ value: id, label: name }))
          );
        })
        .catch(errors => {
          showErrorNotification(`Не удалось загрузить список университетов, пожалуйста, обратитесь на почту,
                                                        указанную внизу анкеты.<br>${errors.toString()}`);
          console.error(errors);
        });
    }
  }, [endpointUniversities, universityCity]);
  let mskStrCampaignId = campaigns.find((e, i, a) => {
    return e.value === 'msk';
  });
  if (mskStrCampaignId !== undefined) {
    mskStrCampaignId = mskStrCampaignId.id.toString();
  } else {
    mskStrCampaignId = null;
  }

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    setValue(name, value);
    if (name === 'is_studying') {
      unregister('course');
      rules.course = value === 'yes' ? { required: msgRequired } : {};
      register('course', rules.course);
    }
    if (name === 'campaign') {
      const required = value === mskStrCampaignId ? msgRequired : false;
      rules.shadPlusRash.required = required;
      rules.newTrack.required = required;
    }
  }

  function handleSelectChange(option, name) {
    setValue(name, option);
    trigger(name);
    if (name === 'university_city') {
      setValue('university', null);
      trigger('university');
    }
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
    let {
      shad_plus_rash,
      rash_agreement,
      new_track,
      is_studying,
      course,
      university,
      university_city,
      ticket_access,
      magistracy_and_shad,
      email_subscription,
      shad_agreement,
      ...payload
    } = data;
    payload['shad_agreement'] = shad_agreement === true;
    if (shad_plus_rash !== undefined) {
      payload['shad_plus_rash'] = shad_plus_rash === 'yes';
    }
    payload['rash_agreement'] = rash_agreement === true;
    if (new_track !== undefined) {
      payload['new_track'] = new_track === 'yes';
    }
    payload['is_studying'] = is_studying === 'yes';
    payload['level_of_education'] = course && course.value;
    payload['ticket_access'] = ticket_access === true;
    payload['magistracy_and_shad'] = magistracy_and_shad === 'yes';
    payload['email_subscription'] = email_subscription === true;
    if (university) {
      if (university.__isNew__) {
        payload['university_other'] = university.value;
      } else {
        payload['university'] = parseInt(university.value);
      }
    }
    if (university_city) {
      if (university_city.__isNew__) {
        payload['university_city'] = {
          is_exists: false,
          city_name: university_city.value
        };
      } else {
        payload['university_city'] = {
          is_exists: true,
          pk: parseInt(university_city.value)
        };
      }
    }
    runSubmit(endpoint, csrfToken, setState, payload);
  }

  const { isYandexPassportAccessAllowed, isFormSubmitted } = state;
  if (isFormSubmitted) {
    return (
      <>
        <h3>Ваша заявка принята!</h3>
        Мы выслали вам на почту письмо — прочитайте его и переходите к тесту.
        <br />
        Если письмо не пришло в течение часа и его не оказалось в папке «Спам»
        или «Промоакции», пишите на{' '}
        <a href="mailto:shad@yandex-team.ru.">shad@yandex-team.ru.</a>
        <br />
        Не забудьте указать свои ФИО и email.
      </>
    );
  }
  const rashStatus =
    campaign === mskStrCampaignId &&
    shadPlusRash === 'yes' &&
    rashConfirmed !== true;
  return (
    <form className="ui form" onSubmit={handleSubmit(onSubmit)}>
      <div className="card__content">
        <div className="row mb-4">
          <div className="field col-lg-6 mb-2">
            <label>
              Доступ к данным на Яндексе <span className="asterisk">*</span>
              &nbsp;
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
            label={
              <>
                Фамилия <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
          />
          <InputField
            control={control}
            rules={rules.firstName}
            name="first_name"
            label={
              <>
                Имя <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
          />
          <InputField
            control={control}
            rules={rules.patronymic}
            name="patronymic"
            label={
              <>
                Отчество <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
          />
        </div>
        <div className="row">
          <InputField
            control={control}
            rules={rules.email}
            name="email"
            type="email"
            label={
              <>
                Электронная почта <span className="asterisk">*</span>
              </>
            }
            helpText="Обязательно проверьте правильность адреса"
            wrapperClass="col-lg-6"
          />
          <InputField
            control={control}
            rules={rules.phone}
            name="phone"
            label={
              <>
                Контактный телефон <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
            placeholder="+7 (999) 1234567"
          />
          <InputField
            control={control}
            rules={rules.birthDate}
            name="birth_date"
            type="date"
            label={
              <>
                Дата рождения <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
          />
          <InputField
            control={control}
            rules={rules.livingPlace}
            name="living_place"
            label={
              <>
                В каком городе вы живёте? <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
            placeholder=""
          />
        </div>
        <div className="row">
          <div className="field col-12">
            <div className="grouped">
              <label className="title-label">
                В каком городе вы хотите учиться в ШАД?{' '}
                <span className="asterisk">*</span>
              </label>
              <RadioGroup required name="campaign" onChange={handleInputChange}>
                {campaigns.map(branch => (
                  <RadioOption
                    key={branch.id}
                    id={`campaign-${branch.value}`}
                    value={branch.id}
                  >
                    {branch.label}
                  </RadioOption>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
        {campaign === mskStrCampaignId && (
          <div className="row">
            <div className="field col-12">
              <div className="grouped">
                <label className="title-label">
                  Планируете ли вы поступать на совместную программу ШАД и
                  РЭШ?&nbsp;
                  <span className="asterisk">*</span>&nbsp;
                  <Hint
                    interactive={true}
                    html={
                      <>
                        Цель этой программы – готовить людей, которые будут
                        обладать одновременно навыками экономического
                        моделирования и анализа данных. Они смогут не только
                        строить модели машинного обучения и делать выводы из
                        данных, но и учитывать экономические факторы, поведение
                        людей, строение сложных экосистем. Для участия в
                        программе необходимо пройти вступительные испытания в
                        ШАД и сдать тест по английскому языку в РЭШ.
                        <br />
                        Более подробно о программе -
                        <a
                          href="https://yandexdataschool.ru/university/nes"
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                        >
                          https://yandexdataschool.ru/university/nes
                        </a>
                      </>
                    }
                  />
                </label>
                <RadioGroup
                  required
                  name="shad_plus_rash"
                  className="inline pt-0"
                  shouldUnregister={true}
                  onChange={handleInputChange}
                >
                  <RadioOption
                    {...register('shad_plus_rash', { shouldUnregister: true })}
                    id="yes"
                  >
                    Да
                  </RadioOption>
                  <RadioOption
                    {...register('shad_plus_rash', { shouldUnregister: true })}
                    id="no"
                  >
                    Нет
                  </RadioOption>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}
        {campaign === mskStrCampaignId && shadPlusRash === 'yes' && (
          <div className="row">
            <div className="col-lg-12">
              <div className="grouped mb-4">
                <Checkbox
                  name={'rash_agreement'}
                  {...register('rash_agreement', { shouldUnregister: true })}
                  label={
                    <>
                      Выбирая участие в совместной программе, даю согласие на
                      передачу моей персональной информации в Негосударственное
                      образовательное учреждение высшего образования "Российская
                      экономическая школа" (институт) (РЭШ) для обработки в
                      целях обеспечения условий прохождения программы и обратной
                      связи по вопросам обучения на условиях{' '}
                      <a
                        href="https://admissions.nes.ru/other-doc"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                      >
                        Политики в отношении персональных данных
                      </a>{' '}
                      <span className="asterisk">*</span>
                    </>
                  }
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}
        {campaign === mskStrCampaignId && (
          <div className="row">
            <div className="field col-12">
              <div className="grouped">
                <label className="title-label">
                  Планируете ли вы воспользоваться альтернативным треком
                  поступления?&nbsp;
                  <span className="asterisk">*</span>&nbsp;
                  <Hint
                    interactive={true}
                    html={
                      <>
                        Альтернативный трек предназначен в первую очередь для
                        тех, у кого уже есть опыт промышленной разработки или
                        научных исследований в области Data Science. На втором
                        этапе отбора и на собеседовании вам не придётся решать
                        трудных задач по высшей математике, но зато нужно будет
                        показать хорошее умение программировать. Кроме того, при
                        отборе мы будем учитывать участие в проектах, наличие
                        статей и в целом индустриальный опыт. Всего по этому
                        треку планируется набрать не более 30 человек.
                        <br />
                        Решение о том, воспользуетесь ли вы альтернативным
                        треком, вам нужно принять сейчас. Поменять его потом
                        будет невозможно.
                        <br />
                        Если вы ответили "да", пожалуйста, уделите особое
                        внимание следующим вопросам.
                      </>
                    }
                  />
                </label>
                <RadioGroup
                  required
                  name="new_track"
                  className="inline pt-0"
                  onChange={handleInputChange}
                >
                  <RadioOption
                    {...register('new_track', { shouldUnregister: true })}
                    id="yes"
                  >
                    Да
                  </RadioOption>
                  <RadioOption
                    {...register('new_track', { shouldUnregister: true })}
                    id="no"
                  >
                    Нет
                  </RadioOption>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}
        {campaign === mskStrCampaignId && newTrack === 'yes' && (
          <div className="row">
            <MemoizedTextField
              name="new_track_scientific_articles"
              control={control}
              rules={rules.newTrackScientificArticles}
              wrapperClass="col-lg-12"
              label="Есть ли у вас научные статьи? Если да, то дайте их координаты."
            />
            <MemoizedTextField
              name="new_track_projects"
              control={control}
              rules={rules.newTrackProjects}
              wrapperClass="col-lg-12"
              label="Есть ли у вас открытые проекты вашего авторства,
                         или в которых вы участвовали в составе команды, на github или
                          на каком-либо из подобных сервисов? Если да, дайте ссылки на них."
            />
            <MemoizedTextField
              name="new_track_tech_articles"
              control={control}
              rules={rules.newTrackTechArticles}
              wrapperClass="col-lg-12"
              label="Есть ли у вас посты или статьи о технологиях? Если да, дайте ссылки на них."
            />
            <MemoizedTextField
              name="new_track_project_details"
              control={control}
              rules={rules.newTrackProjectDetails}
              wrapperClass="col-lg-12"
              label="Расскажите более подробно о каком-нибудь из своих проектов. Что хотелось сделать?
                        Какие нетривиальные технические решения вы использовали? В чём были трудности и как вы их преодолевали?
                        Пожалуйста, сохраните свой ответ в файле .pdf, выложите его на Яндекс.Диск и поместите сюда ссылку.
                        Если у вас уже есть статья на эту тему и вы давали на неё ссылку в предыдущем вопросе, то можете поставить здесь прочерк."
            />
          </div>
        )}
        <div className="row">
          <div className="col-12">
            <label className="title-label">
              В каком университете вы учитесь/учились?{' '}
              <span className="asterisk">*</span>
            </label>
          </div>
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
                onBlur={e => trigger('university_city')}
                name="university_city"
                placeholder="Город"
                options={cities}
                menuPortalTarget={document.body}
                errors={errors}
              />
            </div>
            <ErrorMessage errors={errors} name={'university_city'} />
          </div>
          <div className="field col-lg-6">
            <div className="ui select">
              <CreatableSelect
                required
                isDisabled={
                  universityCity === undefined || universityCity === null
                }
                components={{
                  DropdownIndicator: null
                }}
                openMenuOnFocus={true}
                isClearable={true}
                onChange={handleSelectChange}
                onBlur={e => trigger('university')}
                name="university"
                placeholder="Университет"
                value={university}
                options={universities}
                menuPortalTarget={document.body}
                errors={errors}
              />
            </div>
            <ErrorMessage errors={errors} name={'university'} />
          </div>
          <div className="field col-12">
            <div className="grouped">
              <label className="title-label">
                Учитесь ли вы сейчас в университете?{' '}
                <span className="asterisk">*</span>
              </label>
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

          {isStudying === 'yes' && (
            <div className="field col-lg-6">
              <div className="ui select">
                <label>
                  На каком курсе вы сейчас учитесь?{' '}
                  <span className="asterisk">*</span>
                </label>
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
            label={
              <>
                На каком факультете вы учитесь/учились? На какой кафедре?{' '}
                <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
          />
          <InputField
            control={control}
            rules={rules.yearOfGraduation}
            name="year_of_graduation"
            type="number"
            label={
              <>
                В каком году вы окончите/окончили университет?{' '}
                <span className="asterisk">*</span>
              </>
            }
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
            label={
              <>
                Зачем вы поступаете в ШАД? Расскажите чему вы ожидаете научиться
                в ШАД, для чего вам эти знания, какое направление привлекает
                больше всего. Чем честнее ответ - тем лучше.{' '}
                <span className="asterisk">*</span>
              </>
            }
          />
          <MemoizedTextField
            name="ml_experience"
            control={control}
            rules={rules.ml_experience}
            wrapperClass="col-lg-12"
            label={
              <>
                Изучали ли вы раньше машинное обучение/анализ данных? Каким
                образом? Какие навыки удалось приобрести, какие проекты сделать?{' '}
                <span className="asterisk">*</span>
              </>
            }
          />
          <div className="col-lg-12">
            <div className="grouped inline mb-4">
              <Checkbox
                name={'ticket_access'}
                label={
                  <>
                    Мне был предоставлен билет на прошлом отборе в ШАД&nbsp;
                    <Hint
                      delay={[0, 3000]}
                      html={
                        'Поставьте здесь галочку, если по итогам отбора в ШАД в прошлом году вам пришло письмо, в котором говорилось, что в следующем наборе вы сразу можете пройти на собеседование, минуя первые два этапа отбора.'
                      }
                    />
                  </>
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="field col-12">
            <div className="grouped">
              <label className="title-label">
                Планируете ли вы поступать в этом году на одну из совместных с
                ШАД магистерских программ? <span className="asterisk">*</span>
              </label>
              <RadioGroup
                required
                name="magistracy_and_shad"
                className="inline pt-0"
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
                label={
                  <>
                    Я обещаю самостоятельно выполнять все задания всех этапов
                    поступления в ШАД, не списывать и не давать списывать, не
                    публиковать задания теста и экзамена в открытом доступе, не
                    использовать более одного логина для участия в отборе ШАД.{' '}
                    <span className="asterisk">*</span>
                  </>
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="grouped mb-4">
              <Checkbox
                required
                name={'shad_agreement'}
                label={
                  <>
                    Я согласен (-на) на обработку указанных данных на условиях{' '}
                    <a
                      href="https://yandex.ru/legal/sad_personal_data/?lang=ru"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                      Правил обработки персональных данных участника проекта
                      «Школа Анализа Данных»
                    </a>{' '}
                    <span className="asterisk">*</span>
                  </>
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="grouped mb-4">
              <Checkbox
                name={'email_subscription'}
                label={
                  'Я согласен (-на) на получение новостной и рекламной рассылки от АНО ДПО "ШАД" и ООО "ЯНДЕКС"'
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <button
            type="submit"
            disabled={
              !agreementConfirmed ||
              !honestyConfirmed ||
              rashStatus ||
              isPending
            }
            className="btn _primary _m-wide mt-3 mb-6"
          >
            Подать заявку
          </button>
        </div>
        <div className="row">
          Если возникли технические проблемы с формой, напишите на почту&nbsp;
          <a href="mailto:shad@yandex-team.ru">shad@yandex-team.ru</a>
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
  endpointCities: PropTypes.string.isRequired,
  endpointUniversities: PropTypes.string.isRequired,
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
  educationLevelOptions: PropTypes.arrayOf(optionStrType).isRequired
};

export default YDSApplicationForm;
