export default function launch() {
    $('input[name="is_conducted_by_invited"]').change(function (e) {
        const isChecked = this.checked;
        updateInvitedTeacherSettings(isChecked);    
    });
    $('input[name="is_repeated"]').change(function (e) {
        const isChecked = this.checked;
        updateRepeatedClassSettings(isChecked);    
    });
  }

function updateInvitedTeacherSettings(isChecked) {
    const detailsDiv = $('div[id=div_id_number_of_repeats]');
    if (isChecked) {
        detailsDiv.removeClass('hidden');
    } else {
        detailsDiv.addClass('hidden');
    }
  }

  function updateRepeatedClassSettings(isChecked) {
    const repeatsDiv = $('div[id=div_id_number_of_repeats]');
    const repeatsInput = repeatsDiv.find('input');

    if (isChecked) {
        repeatsDiv.removeClass('hidden');
        repeatsInput.prop('required', true);
    } else {
        repeatsDiv.addClass('hidden');
        repeatsInput.prop('required', false);
    }
}