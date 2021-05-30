import {restoreTabFromHash} from './utils';
import {createNotification} from 'utils';
import _groupBy from 'lodash-es/groupBy';

function streamSelectChanged(event) {
    const streamSelect = event.target;
    let streamValues = Array(...streamSelect.options).reduce((acc, option) => {
        if (option.selected === true) {
            acc.push(parseInt(option.value));
        }
        return acc;
    }, []);
}

export default function initInterviewStreamInvitationSection() {
    restoreTabFromHash();

    let checkAllStudents = $('#checkAllStudent');
    $('#checkAllStudent').click(function(){
      if(checkAllStudents.prop('checked') === true) {
        $('#checkStudent input').prop('checked', true);
      }
      else {
        $('#checkStudent input').prop('checked', false);
      }

    });

    import('components/forms')
        .then(_ => {
            let streamSelect = $("select[name=interview_stream_invitation-streams]");
            streamSelect.selectpicker({
                actionsBox: true,
                iconBase: 'fa',
                tickIcon: 'fa-check'
            });
            streamSelect.on('loaded.bs.select', function (e) {
                $(e.target).selectpicker('setStyle', 'btn-default');
            });
            streamSelect.on('changed.bs.select', streamSelectChanged);
        });
}
