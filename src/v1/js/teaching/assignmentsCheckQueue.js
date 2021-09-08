async function launch() {
  const { default: _ } = await import('components/forms');

  const courseSelect = $('select[name=course]');

  courseSelect.selectpicker({
    iconBase: 'fa',
    tickIcon: 'fa-check'
  });

  const assignmentsSelect = $('select[name=assignments]');

  assignmentsSelect.selectpicker({
    iconBase: 'fa',
    tickIcon: 'fa-check'
  });

  const assignments = [
    { value: 42, label: 'Assignment1' },
    { value: 43, label: 'Assignment2' }
  ];

  // TODO: обновлять select и вызывать refresh
  courseSelect.on('change', e => {
    const selectedCourse = e.target.value;
    console.log(selectedCourse);
    if (selectedCourse) {
      // Populate assignment list
      assignmentsSelect.empty().append(
        assignments.map(item =>
          $('<option>', {
            text: item.label,
            value: item.value
          })
        )
      );
      assignmentsSelect.selectpicker('refresh');
    }
  });
}

export default launch;
