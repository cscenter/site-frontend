import "bootstrap-select/js/bootstrap-select";
import "bootstrap-select/js/i18n/defaults-ru_RU";
import moment from "moment";
import "moment/locale/ru";
import "eonasdan-bootstrap-datetimepicker";

$.fn.selectpicker.Constructor.BootstrapVersion = '3';

import(/* webpackChunkName: "bootstrap-datetimepicker" */ 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css');