import {restoreTabFromHash} from './utils';
import {createNotification} from 'utils';
import _groupBy from 'lodash-es/groupBy';
import $ from "jquery";

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

    let url_params = window
    .location
    .search
    .replace('?','')
    .split('&')
    .reduce(
        function(p,e){
            var a = e.split('=');
            p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
            return p;
        },
        {}
    );

    let url_link = window.location.href;

    $("#submit-id-create-invitation").click(function(event){
      event.preventDefault();
      let select_streams = $("select[name=interview_stream_invitation-streams]").val();
      let searchIDs = $("#checkStudent input:checkbox:checked").map(function(){
        return $(this).val();
      }).get();

      $.ajax({
        url:url_link,
        method: "POST",
        data: {
          campaign: url_params['campaign'],
          section: url_params['section'],
          ids:searchIDs,
          streams:select_streams
        },
        success:function(response){
          $(location).attr('href', url_link);
        },
        complete:function(){},
        error:function (xhr, textStatus, thrownError){
            // alert("");
        }
      });
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
