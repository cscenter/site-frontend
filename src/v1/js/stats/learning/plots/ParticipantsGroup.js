import { select as d3Select } from 'd3-selection';
import c3 from 'c3';
import $ from 'jquery';
import { StudentRoles, URLS } from 'stats/utils';
import i18n from 'stats/i18n';

class ParticipantsGroup {
  static ENDPOINT_URI = 'stats-api:stats_learning_participants_group';

  constructor(id, options) {
    this.id = `#${id}`;
    this.state = {
      data: {
        type: 'pie',
        columns: [],
        order: null // https://github.com/c3js/c3/issues/1945
      }
    };

    this.plot = c3.generate({
      bindto: this.id,
      tooltip: {
        format: {
          value: (value, ratio, id) => {
            return value + i18n.people_suffix;
          }
        }
      },
      data: this.state.data
    });

    let promise =
      options.apiRequest || this.getStats(options.course_session_id);
    promise
      .then(this.convertData)
      .then(this.render)
      .done(this.appendParticipantsInfo);
  }

  getStats(course_session_id) {
    let dataURL = URLS[this.constructor.ENDPOINT_URI](course_session_id);
    return $.getJSON(dataURL);
  }

  convertData = rawJSON => {
    let columns = [];
    rawJSON.forEach(e => {
      const label = Object.prototype.hasOwnProperty.call(StudentRoles, e.type)
        ? StudentRoles[e.type]
        : 'Unknown Type';
      columns.push([label, e.count]);
    });
    this.state.data.columns = columns;
    return rawJSON;
  };

  render = columns => {
    this.plot.load(this.state.data);
    return columns;
  };

  appendParticipantsInfo = rawJSON => {
    let total = 0;
    rawJSON.forEach(e => {
      total += e.count;
    });
    d3Select(this.id)
      .insert('div', ':first-child')
      .attr('class', 'info')
      .selectAll('div')
      .data([total])
      .enter()
      .append('div')
      .text(d => i18n.total_participants + ': ' + d);
  };
}

export default ParticipantsGroup;
