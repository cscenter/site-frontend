import { StudentTypes } from 'stats/utils';

let AssignmentsFilterMixin = superclass =>
  class extends superclass {
    constructor(id, options) {
      super(id, options);
      this.filters = {
        // Attributes in dot-notation which should be compared
        // with filters state. See `matchFilters` for details.
        props: {
          // Attribute name must repeat object structure from rawJSON.
          assignment: ['is_online'],
          student_assignment: [
            'student_profile.user.gender',
            'student_profile.year_of_curriculum',
            'student_profile.studentType'
          ]
        },
        choices: {
          curriculumYear: undefined,
          studentTypes: StudentTypes
        },
        // path in dot-notation from the top-level of JSON object.
        state: {
          // TODO: replace dot-notation with nested structure?
          'student_profile.user.gender': undefined,
          is_online: undefined,
          'student_profile.year_of_curriculum': undefined,
          'student_profile.studentType': undefined
        }
      };
    }

    /**
     * For each filter `f` from `this.filters.props[name]` get filter
     * state from `this.state.filters` and make sure `obj.f` match state value.
     * @param obj Object to compare values with filters state
     * @param name Filters collection name in dot-notation
     * @returns {bool}
     */
    matchFilters(obj, name) {
      return this.filters.props[name].reduce((a, b) => {
        let obj_value = b.split('.').reduce((a, b) => a[b], obj);
        return a && this.matchFilter(obj_value, b);
      }, true);
    }

    matchFilter = (value, stateAttrName) => {
      let stateValue = this.filters.state[stateAttrName];
      return (
        stateValue === void 0 ||
        stateValue === '' ||
        stateValue === value ||
        (Array.isArray(value) && value.includes(stateValue))
      );
    };

    /**
     * Collect filter choices. Don't want to calculate this data every
     * time on filter event
     * @param rawJSON JSON from REST API call
     * @returns {*}
     */
    calculateFilterProps = rawJSON => {
      const curriculumYearChoices = new Set();
      rawJSON.forEach(function (assignment) {
        assignment.students.forEach(function (sa) {
          if (typeof sa.student_profile === 'undefined') {
            return;
          }
          curriculumYearChoices.add(sa.student_profile.year_of_curriculum);
        });
      });
      this.filters.choices.curriculumYear = curriculumYearChoices;
      return rawJSON;
    };

    filterDataCurriculumYear = () => {
      if (this.filters.choices.curriculumYear.size === 0) {
        return;
      }
      let choices = [];
      let years = Array.from(this.filters.choices.curriculumYear).sort();
      years.forEach(year => {
        if (year === null) {
          choices.push({ value: 'unknown', label: 'Не известно' });
        } else {
          choices.push({ value: year, label: year });
        }
      });
      let self = this;
      return {
        options: {
          id: this.id + '-curriculum-year-filter',
          items: choices
        },
        template: this.templates.filters.curriculumYear,
        onRendered: function () {
          $(`#${this.options.id}`)
            .selectpicker('render')
            .on('changed.bs.select', function () {
              let newState = parseInt(this.value);
              if (isNaN(newState)) {
                newState = this.value === 'unknown' ? null : '';
              }
              self.filters.state['student_profile.year_of_curriculum'] = newState;
            });
        }
      };
    };

    filterByStudentGroup = () => {
      if (this.filters.choices.studentTypes.size === 0) {
        return;
      }
      const choices = [];
      Object.keys(this.filters.choices.studentTypes).forEach(k => {
        choices.push({
          value: k,
          name: this.filters.choices.studentTypes[k]
        });
      });
      let self = this;
      return {
        options: {
          filterName: 'Группа',
          selected: undefined,
          id: this.id + '-select-filter',
          items: choices
        },
        template: this.templates.filters.select,
        onRendered: function () {
          $(`#${this.options.id}`)
            .selectpicker('render')
            .on('changed.bs.select', function () {
              self.filters.state['student_profile.studentType'] = this.value;
            });
        }
      };
    };
  };

export default AssignmentsFilterMixin;
