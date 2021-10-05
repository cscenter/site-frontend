async function launch() {
  const { default: _ } = await import('components/forms');

  const filterForm = $('form#assignment-filters');
  const courseSelect = $('select[name=course]');
  const assignmentsSelect = $('select[name=assignments]');

  courseSelect.selectpicker({
    iconBase: 'fa',
    tickIcon: 'fa-check'
  });

  assignmentsSelect.selectpicker({
    iconBase: 'fa',
    tickIcon: 'fa-check'
  });

  const selectedCourse = courseSelect.get(0).value;
  const selectedAssignments = assignmentsSelect.serializeArray();
  const filters = getFilterFormData(filterForm);
  fetchPersonalAssignments(selectedCourse, filters);

  // TODO: при загрузке страницы нужно дёржать personal assignments, в остальных случаях по клику на "Фильтровать".
  courseSelect.on('change', async e => {
    const selectedCourse = e.target.value;
    const courseAssignmentsEndpoint = `/api/v1/teaching/courses/${selectedCourse}/assignments/`;

    const courseAssignmentsRequest = $.ajax({
      type: 'GET',
      url: courseAssignmentsEndpoint,
      dataType: 'json'
    }).done(function (data) {
      // Populate assignment list
      assignmentsSelect.empty().append(
        data.map(item =>
          $('<option>', {
            text: item.title,
            value: item.pk
          })
        )
      );
      assignmentsSelect.selectpicker('refresh');
      assignmentsSelect.get(0).dispatchEvent(new Event('change'));
    });

    await Promise.all([courseAssignmentsRequest]);
  });

  assignmentsSelect.on('change', e => {
    const selectedAssignments = assignmentsSelect.serializeArray();
    if (selectedAssignments.length > 0) {
      filterForm.find('button[type=submit]').removeAttr('disabled');
    } else {
      filterForm.find('button[type=submit]').attr('disabled', 'disabled');
    }
  });

  filterForm.on('submit', e => {
    e.preventDefault();
    const data = getFilterFormData(filterForm);
    // URLSearchParams not supported in IE 11
    window.location.href = window.location.pathname + '?' + new URLSearchParams(data).toString();
  });
}

function getFilterFormData(filterForm) {
  const formData = filterForm.serializeArray();
  const data = {};
  for (const item of formData) {
    if (Object.prototype.hasOwnProperty.call(data, item.name)) {
      data[item.name].push(item.value);
    } else {
      data[item.name] = [item.value];
    }
  }
  return data;
}

function fetchPersonalAssignments(course, filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/api/v1/teaching/courses/${course}/personal-assignments/?${queryParams}`;
  const promise = $.ajax({
    type: 'GET',
    url: endpoint,
    dataType: 'json'
  }).done(function (data) {
    console.log(data);
  });
  return promise;
}

export default launch;
