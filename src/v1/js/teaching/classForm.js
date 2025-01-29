export default function launch() {
    $('input[name="is_conducted_by_invited"]').change(function (e) {
        const isChecked = this.checked;
        updateInvitedTeacherSettings(isChecked);    
    });
  }

function updateInvitedTeacherSettings(isChecked) {
    if (isChecked) {
        $('div[id=invited-teacher-details]').removeClass('hidden');
    } else {
        $('div[id=invited-teacher-details]').addClass('hidden');
    }
  }