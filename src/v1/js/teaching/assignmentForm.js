const checkingSystemFieldSet = $('#checking-system-info');
const checkerSubmissionFormats = checkingSystemFieldSet.data('display');

export default function launch() {
  $('.has-popover')
    .popover({
      container: 'body',
      html: true,
      placement: 'auto',
      trigger: 'hover click',
      content: function () {
        let helpBlockId = $(this).data('target');
        return $(helpBlockId).html();
      }
    })
    .on('show.bs.popover', function () {
      $(this).data('bs.popover').tip().css('max-width', '800px');
    });
  const submissionTypeSelect = $('select[name="assignment-submission_type"]');
  const currentAssignmentFormat = submissionTypeSelect.val() || null;
  updateCheckingSystemForm(currentAssignmentFormat);

  submissionTypeSelect.change(function (e) {
    const assignmentFormat = this.value || null;
    updateCheckingSystemForm(assignmentFormat);
  });

  $('select[name="assignment-assignee_mode"]').change(function (e) {
    const mode = this.value || null;
    updateAssigneeModeAdditionSettings(mode);
  });
}

function updateCheckingSystemForm(assignmentFormat) {
  if (assignmentFormat !== null && checkerSubmissionFormats.includes(assignmentFormat)) {
    checkingSystemFieldSet.removeClass('hidden');
  } else {
    checkingSystemFieldSet.addClass('hidden');
  }
  // Disable all options except Yandex.Contest
  let disableOtherOptions = assignmentFormat === 'ya.contest';
  const YandexContestCheckingSystemId = 1;
  const checkingSystemSelect = $('select[name=assignment-checking_system]');
  checkingSystemSelect.val(YandexContestCheckingSystemId);
  checkingSystemSelect
    .find(`option[value!=${YandexContestCheckingSystemId}]`)
    .attr('disabled', disableOtherOptions);
}

function updateAssigneeModeAdditionSettings(mode) {
  $('div[data-assignee-mode]').addClass('hidden');
  if (mode !== null) {
    const modeFormWrapper = $(`div[data-assignee-mode="${mode}"]`);
    modeFormWrapper.removeClass('hidden');
    if (mode !== 'sg_custom') {
      modeFormWrapper.find('input[required=true]').removeAttr('required');
    }
  }
}
