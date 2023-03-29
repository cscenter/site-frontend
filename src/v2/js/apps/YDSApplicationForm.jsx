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
        msg += `Что-то пошло не так: код ошибки ${response.status}.`;
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
  telegram_username: { required: msgRequired },
  email: { required: msgRequired },
  phone: { required: msgRequired },
  birthDate: { required: msgRequired },
  livingPlace: { required: msgRequired },
  residenceCity: { required: msgRequired },
  universityCity: { required: msgRequired },
  university: { required: msgRequired },
  faculty: { required: msgRequired },
  newTrack: { required: msgRequired },
  newTrackScientificArticles: null,
  newTrackProjects: null,
  newTrackTechArticles: null,
  newTrackProjectDetails: null,
  partner: {},
  course: {},
  isStudying: { required: msgRequired },
  yearOfGraduation: { required: msgRequired },
  ml_experience: { required: msgRequired },
  campaign: { required: msgRequired },
  motivation: { required: msgRequired },
  hasJob: { required: msgRequired },
  hasInternship: { required: msgRequired },
  position: null,
  workplace: null,
  internshipPosition: null,
  internshipWorkplace: null,
  whereDidYouLearn: { required: msgRequired },
  whereDidYouLearnOther: { required: msgRequired },
  honesty: { required: msgRequired },
  shadAgreement: { required: msgRequired }
};

function YDSApplicationForm({
  alwaysAllowCampaigns,
  partners,
  sourceOptions,
  educationLevelOptions,
  utm,
  endpoint,
  endpointResidenceCities,
  endpointResidenceCampaigns,
  endpointUniversitiesCities,
  endpointUniversities,
  csrfToken,
  authCompleteUrl,
  authBeginUrl,
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
      honesty: false
    }
  });
  const [campaigns, setCampaigns] = useState([]);
  const [residenceCities, setResidenceCities] = useState([]);
  const [universityCities, setUniversityCities] = useState([]);
  const [partner, setPartner] = useState([]);
  const [campaign, setCampaign] = useState([]);
  const [universities, setUniversities] = useState([]);
  useEffect(() => {
    setCampaigns(alwaysAllowCampaigns);
  }, [alwaysAllowCampaigns]);
  useEffect(() => {
    fetch(`${endpointResidenceCities}?ordering=order`)
      .then(response => response.json())
      .then(data => {
        console.debug('Fetching residence cities');
        setResidenceCities(
          data.map(({ id, name }) => ({ value: id, label: name }))
        );
      })
      .catch(errors => {
        showErrorNotification(`Не удалось загрузить список городов присутствия ШАД, пожалуйста, обратитесь на почту,
                                    указанную внизу анкеты.<br>${errors.toString()}`);
        console.error(errors);
      });
  }, [endpointResidenceCities]);
  useEffect(() => {
    fetch(endpointUniversitiesCities)
      .then(response => response.json())
      .then(data => {
        console.debug('Fetching university cities');
        setUniversityCities(
          data.map(({ id, name }) => ({ value: id, label: name }))
        );
      })
      .catch(errors => {
        showErrorNotification(`Не удалось загрузить список городов расположения университетов, пожалуйста, обратитесь на почту,
                                    указанную внизу анкеты.<br>${errors.toString()}`);
        console.error(errors);
      });
  }, [endpointUniversitiesCities]);
  useEffect(() => {
    register('has_internship', rules.hasInternship);
    register('has_job', rules.hasJob);
    register('is_studying', rules.isStudying);
    register('residence_city', rules.residenceCity);
    register('university', rules.university);
    register('university_city', rules.universityCity);
    register('campaign', rules.campaign);
    register('course', rules.course);
    register('honesty', rules.honesty);
    register('shad_agreement', rules.shadAgreement);
    register('new_track', rules.newTrack);
  }, [register]);
  let [
    campaign_watch,
    residenceCity,
    university,
    universityCity,
    isStudying,
    hasJob,
    hasInternship,
    honestyConfirmed,
    whereDidYouLearn,
    agreementConfirmed,
    newTrack
  ] = watch([
    'campaign',
    'residence_city',
    'university',
    'university_city',
    'is_studying',
    'has_job',
    'has_internship',
    'honesty',
    'where_did_you_learn',
    'shad_agreement',
    'new_track'
  ]);
  useEffect(() => {
    setPartner(null);
    setValue('partner', null);
  }, [campaign_watch, residenceCity]);
  useEffect(() => {
    if (newTrack === 'yes') {
      setPartner(null);
      setValue('partner', null);
    }
  }, [newTrack]);
  useEffect(() => {
    setCampaign(null);
  }, [residenceCity]);
  useEffect(() => {
    if (universityCity !== undefined && universityCity !== null) {
      let isNum = /^\d+$/.test(universityCity.value);
      if (!isNum) {
        return;
      }
      fetch(`${endpointUniversities}?city=${universityCity.value}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetching universities from ', universityCity);
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
  useEffect(() => {
    if (residenceCity !== undefined && residenceCity !== null) {
      let isNum = /^\d+$/.test(residenceCity.value);
      console.debug(residenceCity);
      if (!isNum) {
        return;
      }
      fetch(
        `${endpointResidenceCampaigns}?city_id=${residenceCity.value}&ordering=campaign`
      )
        .then(response => response.json())
        .then(data => {
          console.log('Fetching residence campaigns from ', residenceCity);
          let new_campaigns = Array.from(
            data.map(({ id, campaign }) => ({
              campaign_id: campaign.id,
              value: campaign.branch.code,
              label: campaign.branch.name
            }))
          );
          if (new_campaigns.length === 0) {
            new_campaigns = alwaysAllowCampaigns;
          }
          setCampaigns(new_campaigns);
        })
        .catch(errors => {
          showErrorNotification(`Что-то пошло не так, пожалуйста, обратитесь на почту,
                                                        указанную внизу анкеты.<br>${errors.toString()}`);
          console.error(errors);
        });
    }
  }, [endpointResidenceCampaigns, residenceCity, alwaysAllowCampaigns]);
  let mskStrCampaignId = campaigns.find((e, i, a) => {
    return e.value === 'msk';
  });
  if (mskStrCampaignId !== undefined) {
    mskStrCampaignId = mskStrCampaignId.campaign_id.toString();
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
    if (
      name === 'campaign' &&
      mskStrCampaignId &&
      campaign === mskStrCampaignId
    ) {
      unregister('partner');
      rules.partner = { required: msgRequired };
      register('partner');
    }
  }

  function handleSelectChange(option, name) {
    setValue(name, option);
    trigger(name);
    if (name === 'university_city') {
      setValue('university', null);
      trigger('university');
    }
    if (name === 'residence_city') {
      setValue('campaign', null);
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
      new_track,
      has_job,
      has_internship,
      is_studying,
      course,
      residence_city,
      university,
      university_city,
      ticket_access,
      email_subscription,
      shad_agreement,
      ...payload
    } = data;
    payload['utm'] = utm;
    payload['has_job'] = has_job === 'yes';
    payload['has_internship'] = has_internship === 'yes';
    payload['shad_agreement'] = shad_agreement === true;
    if (new_track !== undefined) {
      payload['new_track'] = new_track === 'yes';
    }
    payload['is_studying'] = is_studying === 'yes';
    payload['level_of_education'] = course && course.value;
    payload['ticket_access'] = ticket_access === true;
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
    if (residence_city) {
      if (residence_city.__isNew__) {
        payload['residence_city'] = null;
        payload['living_place'] = residence_city.value;
      } else {
        payload['residence_city'] = parseInt(residence_city.value);
      }
    }
    runSubmit(endpoint, csrfToken, setState, payload);
  }

  const { isYandexPassportAccessAllowed, isFormSubmitted } = state;
  if (isFormSubmitted) {
    return (
      <>
        <h3>Ваша заявка принята!</h3>
        Доступ к онлайн-тесту будет открыт с 1 мая 00:00 до 7 мая 19:00 по
        московскому времени.
        <br />
        Мы выслали вам на почту письмо — обязательно прочитайте его.
        <br />
        Если письмо не пришло в течение часа и его не оказалось в папке «Спам»
        или «Промоакции», пишите на{' '}
        <a href="mailto:shad@yandex-team.ru">shad@yandex-team.ru.</a>
        <br />
        Не забудьте в письме указать свои ФИО и email, который указывали при
        регистрации.
      </>
    );
  }
  const selectedCampaignID =
    campaign_watch !== null ? `campaign-${campaign_watch}` : '';
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
            rules={rules.telegram_username}
            name="telegram_username"
            helpText="Для быстрой связи с вами"
            label={
              <>
                Telegram <span className="asterisk">*</span>
              </>
            }
            wrapperClass="col-lg-6"
          />
          <div className="field col-6">
            <div className="ui select">
              <label htmlFor="residence_city">
                Город проживания <span className="asterisk">*</span>
              </label>
              <CreatableSelect
                required
                components={{
                  DropdownIndicator: null
                }}
                openMenuOnFocus={true}
                isClearable={true}
                onChange={handleSelectChange}
                onBlur={e => trigger('residence_city')}
                name="residence_city"
                placeholder="Начните вводить название"
                options={residenceCities}
                menuPortalTarget={document.body}
                errors={errors}
              />
              <div className="help-text">
                Город, из которого планируешь обучаться в ШАД
              </div>
              <ErrorMessage errors={errors} name={'residence_city'} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="field col-12">
            <p className="mb-0">
              Заочное отделение доступно только студентам из городов и областей,
              где нет очного филиала. <br />
              Если вы поступаете в очный филиал, то у вас есть возможность
              посещать занятия как очно, так и подключаться к ним онлайн.
            </p>
          </div>
        </div>
        {residenceCity && (
          <div className="row">
            <div className="field col-12">
              <div className="grouped">
                <label className="title-label">
                  В каком городе вы хотите учиться в ШАД?{' '}
                  <span className="asterisk">*</span>
                </label>
                <RadioGroup
                  required
                  name="campaign"
                  value={selectedCampaignID}
                  onChange={handleInputChange}
                >
                  {campaigns.map(camp => (
                    <RadioOption
                      key={camp.campaign_id}
                      id={`campaign-${camp.campaign_id}`}
                      value={camp.campaign_id}
                    >
                      {camp.label}
                    </RadioOption>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )}
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
                      Альтернативный трек предназначен в первую очередь для тех,
                      у кого уже есть опыт промышленной разработки или научных
                      исследований в области Data Science. На втором этапе
                      отбора и на собеседовании вам не придётся решать трудных
                      задач по высшей математике, но зато нужно будет показать
                      хорошее умение программировать. Кроме того, при отборе мы
                      будем учитывать участие в проектах, наличие статей и в
                      целом индустриальный опыт. Всего по этому треку
                      планируется набрать не более 30 человек.
                      <br />
                      Решение о том, воспользуетесь ли вы альтернативным треком,
                      вам нужно принять сейчас. Поменять его потом будет
                      невозможно.
                      <br />
                      Если вы ответили &quot;да&quot;, пожалуйста, уделите
                      особое внимание следующим вопросам.
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
        {mskStrCampaignId && campaign_watch === mskStrCampaignId && (
          <div className="row">
            <div className="field col-12">
              <p className="mb-0">
                Внимание, альтернативный трек и поступление на совместные с ШАД
                магистерские программы – взаимоисключающие условия.
              </p>
            </div>
          </div>
        )}
        {newTrack === 'yes' && (
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
        {mskStrCampaignId && campaign_watch === mskStrCampaignId && newTrack === "no" && (
          <div className="row">
            <div className="field col-12">
              <div className="grouped">
                <label className="title-label">
                  Планируете ли вы поступать в этом году на одну из совместных с
                  ШАД магистерских программ?&nbsp;
                  <span className="asterisk">*</span>&nbsp;
                  <Hint
                    interactive={true}
                    html={<>Выберите первый приоритет</>}
                  />
                </label>
                <RadioGroup
                  required={rules.partner}
                  name="partner"
                  onChange={handleInputChange}
                >
                  {partners.map(partner => (
                    <RadioOption
                      id={`partner-${partner.value}`}
                      value={partner.id}
                    >
                      {partner.label}
                    </RadioOption>
                  ))}
                  <RadioOption>Нет</RadioOption>
                </RadioGroup>
              </div>
            </div>
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
                options={universityCities}
                menuPortalTarget={document.body}
                errors={errors}
              />
            </div>
            <div className="help-text">
              Если вашего города/университета не оказалось в списке, вы можете
              добавить его название.
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
        </div>
        <div className="row">
          <div className="field col-lg-12">
            <label>
              Вы проходили стажировки в компаниях?{' '}
              <span className="asterisk">*</span>
            </label>
            <RadioGroup
              required
              name="has_internship"
              className="inline pt-0"
              onChange={handleInputChange}
            >
              <RadioOption id="yes">Да</RadioOption>
              <RadioOption id="no">Нет</RadioOption>
            </RadioGroup>
          </div>
        </div>
        {hasInternship && hasInternship === 'yes' && (
          <div className="row">
            <InputField
              control={control}
              rules={rules.internshipWorkplace}
              name="internship_workplace"
              label={'Место стажировки'}
              wrapperClass="col-lg-6"
            />
            <InputField
              control={control}
              rules={rules.internshipPosition}
              name="internship_position"
              label={'Должность'}
              wrapperClass="col-lg-6"
            />
          </div>
        )}
        <div className="row">
          <div className="field col-lg-12">
            <label>
              Вы сейчас работаете? <span className="asterisk">*</span>
            </label>
            <RadioGroup
              required
              name="has_job"
              className="inline pt-0"
              onChange={handleInputChange}
            >
              <RadioOption id="yes">Да</RadioOption>
              <RadioOption id="no">Нет</RadioOption>
            </RadioGroup>
          </div>
        </div>
        {hasJob && hasJob === 'yes' && (
          <div className="row">
            <InputField
              control={control}
              rules={rules.workplace}
              name="workplace"
              label={'Место работы'}
              wrapperClass="col-lg-6"
            />
            <InputField
              control={control}
              rules={rules.position}
              name="position"
              label={'Обязанности'}
              wrapperClass="col-lg-6"
            />
          </div>
        )}
        <div className="row">
          <div className="field col-lg-12">
            <label className="mb-4">
              Откуда вы узнали о наборе в ШАД?{' '}
              <span className="asterisk">*</span>
            </label>
            <div className="grouped">
              {sourceOptions.map(option => (
                <Checkbox
                  key={option.value}
                  name="where_did_you_learn"
                  {...register('where_did_you_learn', rules.whereDidYouLearn)}
                  value={option.value}
                  className={
                    errors && errors.where_did_you_learn ? 'error' : ''
                  }
                  label={option.label}
                />
              ))}
            </div>
            <ErrorMessage
              errors={errors}
              name={'where_did_you_learn'}
              className="mt-2"
            />
          </div>
          {whereDidYouLearn && whereDidYouLearn.includes('other') && (
            <InputField
              name="where_did_you_learn_other"
              control={control}
              rules={rules.whereDidYouLearnOther}
              wrapperClass="animation col-lg-5"
              placeholder="Ваш вариант"
              helpText="Максимум 255 символов"
            />
          )}
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
          <MemoizedTextField
            name="additional_info"
            control={control}
            rules={rules.additionalInfo}
            wrapperClass="col-lg-8"
            label="Напишите любую дополнительную информацию о себе"
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
                  'Я согласен (-на) на получение новостной и рекламной рассылки от АНО ДПО "ОТЯ"'
                }
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <button
            type="submit"
            disabled={!agreementConfirmed || !honestyConfirmed || isPending}
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
  utm: PropTypes.shape({
    utm_source: PropTypes.string,
    utm_medium: PropTypes.string,
    utm_campaign: PropTypes.string,
    utm_term: PropTypes.string,
    utm_content: PropTypes.string
  }),
  initialState: PropTypes.shape({
    isYandexPassportAccessAllowed: PropTypes.bool.isRequired
  }).isRequired,
  endpoint: PropTypes.string.isRequired,
  endpointResidenceCities: PropTypes.string.isRequired,
  endpointResidenceCampaigns: PropTypes.string.isRequired,
  endpointUniversitiesCities: PropTypes.string.isRequired,
  endpointUniversities: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
  authBeginUrl: PropTypes.string.isRequired,
  authCompleteUrl: PropTypes.string.isRequired,
  alwaysAllowCampaigns: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      campaign_id: PropTypes.number.isRequired
    })
  ).isRequired,
  educationLevelOptions: PropTypes.arrayOf(optionStrType).isRequired,
  sourceOptions: PropTypes.arrayOf(optionStrType).isRequired,
  partners: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    })
  ).isRequired,
  additionalInfo: null
};

export default YDSApplicationForm;
