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

    let checkAllStudents = $('#check-all-student');
    $('#check-all-student').click(function(){
      if(checkAllStudents.prop('checked') === true) {
        $('#check-student input').prop('checked', true);
      }
      else {
        $('#check-student input').prop('checked', false);
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
      let searchIDs = $("#check-student input:checkbox:checked").map(function(){
        return $(this).val();
      }).get();

      if (searchIDs != '' && select_streams!= '') {
          $(this).attr('disabled', true);
          $(this).attr('value', 'Идёт отправка, подождите...');

          $.ajax({
            url:url_link,
            method: "POST",
            data: {
              campaign: url_params['campaign'],
              section: url_params['section'],
              ids:searchIDs,
              streams:select_streams
            },
            success:function(response){},
            complete:function(){
              $(location).attr('href', url_link);
            },
            error:function (xhr, textStatus, thrownError){
              $(location).attr('href', url_link);
            }
          });
      }
      else if (searchIDs != ''){
        $('#check-all-student').parent().class('btn-danger');
      }
      else $('#check-all-student').parent().css('color', 'red');
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
