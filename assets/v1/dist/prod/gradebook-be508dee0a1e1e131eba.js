(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{"1aPi":function(e,t,n){"use strict";var r=n("gDU4"),a=n("fw2E"),o=function(){return a.a.Date.now()},i=/\s/;var c=function(e){for(var t=e.length;t--&&i.test(e.charAt(t)););return t},s=/^\s+/;var l=function(e){return e?e.slice(0,c(e)+1).replace(s,""):e},u=n("G12H"),f=/^[-+]0x[0-9a-f]+$/i,d=/^0b[01]+$/i,m=/^0o[0-7]+$/i,v=parseInt;var g=function(e){if("number"==typeof e)return e;if(Object(u.a)(e))return NaN;if(Object(r.a)(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=Object(r.a)(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=l(e);var n=d.test(e);return n||m.test(e)?v(e.slice(2),n?2:8):f.test(e)?NaN:+e},h=Math.max,p=Math.min;t.a=function(e,t,n){var a,i,c,s,l,u,f=0,d=!1,m=!1,v=!0;if("function"!=typeof e)throw new TypeError("Expected a function");function b(t){var n=a,r=i;return a=i=void 0,f=t,s=e.apply(r,n)}function y(e){return f=e,l=setTimeout(w,t),d?b(e):s}function E(e){var n=e-u;return void 0===u||n>=t||n<0||m&&e-f>=c}function w(){var e=o();if(E(e))return S(e);l=setTimeout(w,function(e){var n=t-(e-u);return m?p(n,c-(e-f)):n}(e))}function S(e){return l=void 0,v&&a?b(e):(a=i=void 0,s)}function k(){var e=o(),n=E(e);if(a=arguments,i=this,u=e,n){if(void 0===l)return y(u);if(m)return clearTimeout(l),l=setTimeout(w,t),b(u)}return void 0===l&&(l=setTimeout(w,t)),s}return t=g(t)||0,Object(r.a)(n)&&(d=!!n.leading,c=(m="maxWait"in n)?h(g(n.maxWait)||0,t):c,v="trailing"in n?!!n.trailing:v),k.cancel=function(){void 0!==l&&clearTimeout(l),f=0,a=u=i=l=void 0},k.flush=function(){return void 0===l?s:S(o())},k}},DYG5:function(e,t,n){"use strict";var r=n("1aPi"),a=n("gDU4");t.a=function(e,t,n){var o=!0,i=!0;if("function"!=typeof e)throw new TypeError("Expected a function");return Object(a.a)(n)&&(o="leading"in n?!!n.leading:o,i="trailing"in n?!!n.trailing:i),Object(r.a)(e,t,{leading:o,maxWait:t,trailing:i})}},Devx:function(e,t,n){"use strict";n.r(t);var r=n("w4m/"),a=n.n(r),o=n("fzZl"),i=n.n(o),c=n("M3tB"),s=n.n(c),l=n("rPqN"),u=n.n(l),f=n("bIJA"),d=n.n(f),m=n("vMuM"),v=n.n(m),g=n("aGAf"),h=n("DYG5"),p=$(".marks-sheet-csv-link"),b=$("#marks-sheet-save"),y=$("#gradebook-container"),E=$("#gradebook"),w=$(".gradebook__controls");function S(e){return e.value!==e.getAttribute("initial")}var k={launch:function(){k.restoreStates(),k.finalGradeSelects(),k.submitForm(),k.downloadCSVButton(),k.onChangeAssignmentGrade(),k.scrollButtons(),k.importYandexContestProblemForm()},restoreStates:function(){var e=document.querySelectorAll("#gradebook .__input");a()(Array.prototype).call(e,k.toggleState);var t=document.querySelectorAll("#gradebook select");a()(Array.prototype).call(t,k.toggleState)},downloadCSVButton:function(){p.click((function(){if(i()(E).call(E,".__unsaved").length>0)return v()({title:"",text:"Сперва сохраните форму,\nчтобы скачать актуальные данные.",type:"warning",confirmButtonText:"Хорошо"}),!1}))},submitForm:function(){b.click((function(){$("form[name=gradebook]").submit()})),$("form[name=gradebook]").submit((function(e){var t=this.querySelectorAll(".__input, .__final_grade select");a()(Array.prototype).call(t,(function(e){if(!S(e)){e.disabled=!0;var t="input[name=initial-".concat(e.name,"]");document.querySelector(t).disabled=!0}}))}))},finalGradeSelects:function(){E.on("change","select",(function(e){k.toggleState(e.target)}))},onChangeAssignmentGrade:function(){E.on("change","input.__assignment",(function(e){k.toggleState(e.target)}))},toggleState:function(e){var t;"input"===e.nodeName.toLowerCase()?t=e:"select"===e.nodeName.toLowerCase()&&(t=e.parentElement),S(e)?t.classList.add("__unsaved"):t.classList.remove("__unsaved")},scrollButtons:function(){y.width()<=E.outerWidth()&&(w.on("click",".scroll.left",(function(){k.scroll(-1)})),w.on("click",".scroll.right",(function(){k.scroll(1)})),w.css("visibility","visible"))},scroll:function(e){var t=100*s()(e);if(0!==t){var n=y.scrollLeft();y.scrollLeft(n+t)}},importYandexContestProblemForm:function(){var e=Object(h.a)((function(e,t){$.ajax({method:"POST",url:e,dataType:"json",data:{assignment:t}}).done((function(e){Object(g.a)("Баллы успешно импортированы, страница будет перезагружена","info"),u()((function(){return window.location.reload()}),500)})).fail((function(e){var t,n;e.responseJSON&&void 0!==e.responseJSON.errors?t=d()(n=e.responseJSON.errors).call(n,(function(e){return e.message})).join("<br/>"):t="".concat(e.statusText,". Try again later.");e.status>=500&&e.status<600?Object(g.a)(t,"error",{sticky:!0}):Object(g.a)(t,"error")}))}),1e3,{leading:!0,trailing:!1});var t=$("#import-scores-from-yandex-contest");t.on("submit","form",(function(n){n.preventDefault();var r=n.target,a=r.querySelector("select[name=assignment]").value||null;null!==a&&(e(r.getAttribute("action"),a),t.modal("hide"))}))}};t.default=k},iOeT:function(e,t,n){"use strict";n.r(t);var r=n("w4m/"),a=n.n(r),o=n("CIyl"),i=n.n(o),c=n("HUEr"),s=n.n(c),l=n("fzZl"),u=n.n(l),f=n("aGAf"),d={isEnhancedHTMLElement:!0,on:function(e,t,n){var r=this,a=function a(o){t.call(o.target,o),n&&n.once&&r.removeEventListener(e,a)};return this.addEventListener(e,a),function(){r.removeEventListener(e,a)}},onDelegate:function(e,t,n,r){var a=this,o=function o(i){i&&i.target&&i.target.matches(e)&&(n.call(i.target,i),r&&r.once&&a.removeEventListener(t,o))};return this.addEventListener(t,o),function(){a.removeEventListener(t,o)}},query:g,queryStrict:function(e){var t=this instanceof HTMLElement?this.query(e):g(e);if(!t)throw new Error("Unexisting HTML element: "+e);return t},queryAll:function(e){var t=this instanceof HTMLElement?this:document,n=Array.from(t.querySelectorAll(e));return h(n)}},m={isEnhancedHTMLElementList:!0,on:function(e,t,n){var r=[];return this.forEach((function(a){var o=a.on(e,t,n);r.push(o)})),function(){r.forEach((function(e){return e()}))}},onDelegate:function(e,t,n,r){var a=[];return this.forEach((function(o){var i=o.onDelegate(e,t,n,r);a.push(i)})),function(){a.forEach((function(e){return e()}))}}},v=function(e){return Object.assign(e,d)};function g(e){var t=(this instanceof HTMLElement?this:document).querySelector(e);return t?v(t):null}var h=function(e){var t=e.map((function(e){return v(e)}));return Object.assign(t,m)};var p=n("rTTg"),b=n("3NWV"),y=n("8MoB"),E=n("LBwL"),w=n.n(E),S=n("Dc5z"),k=n.n(S),j=n("bIJA"),O=n.n(j),T=function(){function e(t,n,r){var a;Object(b.a)(this,e),this.form=t,this.submitButton=t.querySelector('[type="submit"]'),this.isValidCallback=n,this.isInvalidCallback=r,this.onSubmitFormHandler=w()(a=this.onSubmitFormHandler).call(a,this),this.submitButton.addEventListener("click",this.onSubmitFormHandler)}return Object(y.a)(e,[{key:"onSubmitFormHandler",value:function(e){var t;e.preventDefault();var n=[];a()(t=k()(this.form.elements)).call(t,(function(e){if(e.name){var t,r=s()(t="".concat(encodeURIComponent(e.name),"=")).call(t,encodeURIComponent(e.value));n.push(r)}})),this.validateForm(n.join("&"))}},{key:"validateForm",value:function(e){var t=this;$.ajax({method:"PUT",url:this.form.getAttribute("action"),contentType:"application/x-www-form-urlencoded",dataType:"json",data:e}).done((function(e){t.clearErrorMessages(),t.isValidCallback(t.form,e)})).fail((function(e){var n=JSON.parse(e.responseText);t.clearErrorMessages(),t.applyErrorMessages(n),t.isInvalidCallback(t.form,n)}))}},{key:"clearErrorMessages",value:function(){var e,t=this.form.querySelectorAll(".error-message");t.length&&O()(e=Object(p.a)(t)).call(e,(function(e){var t=e.closest(".form-group");null!==t&&t.classList.remove("has-error"),e.remove()}))}},{key:"applyErrorMessages",value:function(e){for(var t in e)"non_field_errors"===t?this._handleNonFieldErrors(e[t]):this._handleFieldErrors(e[t],t)}},{key:"_handleNonFieldErrors",value:function(e){for(var t=this.form.querySelector(".non_field_errors"),n=0;n<e.length;n++){var r=e[n];t.appendChild(this._newError(" - ".concat(r)))}}},{key:"_handleFieldErrors",value:function(e,t){var n=this.form.querySelector('[name="'.concat(t,'"]'));if(n)for(var r=0;r<e.length;r++)n.closest(".form-group").append(this._newError(e[r])),n.closest(".form-group").classList.add("has-error")}},{key:"_newError",value:function(e){var t=document.createElement("div");return t.className="error-message",t.appendChild(document.createTextNode(e)),t}}]),e}(),_=n("XmW3"),L=n("6pHw"),x=n("kvRk");var A={launch:function(){var e;(e=$("#update-assignee-form")).modal({show:!1}),new T(u()(e).call(e,"form").get(0),(function(t,n){var r=n.assignee;null===r&&(r="");var a=v(t).query('select[name="assignee"] option[value="'.concat(r,'"]'));$("#assignee-value").text(a.text),Object(f.a)("Изменения успешно сохранены"),e.modal("hide")}),(function(){Object(f.a)("Форма не сохранена. Попробуйте позже.","error")})),e.on("submit","form",(function(e){e.preventDefault();var t=e.target,n=g("#assignee-select"),r=n.value,a=n.options[n.selectedIndex].text;$.ajax({method:"PUT",url:t.getAttribute("action"),dataType:"json",data:{assignee:r}}).done((function(e){$("#assignee-value").text(a)})).fail((function(e){Object(f.a)("Something went wrong","error"),console.log(e)}))})),Promise.all([n.e(0),n.e(2)]).then(n.bind(null,"0/dF")).then((function(e){e.initSelectPickers()})).catch((function(e){return Object(f.h)(e)})),$(".assignment-score-audit-log").click((function(e){var t=this;e.preventDefault();var n=$("#modal-container"),r=Object(f.f)("assignment-score-audit-log-table");$.get(this.href,(function(e){var t;$(".modal-dialog",n).addClass("modal-lg"),$(".modal-header",n).html("".concat("История изменений оценки за задание",' <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'));var o=Object(_.a)({locale:L.a},"d LLL yyyy HH:mm");a()(t=e.edges).call(t,(function(t){var n,r,a,c=t.changedBy,l=i()(n=s()(r=s()(a="".concat(c.lastName," ")).call(a,c.firstName," ")).call(r,c.patronymic)).call(n);t.author=l||c.username,t.source=e.sources[t.source];var u=new Date(t.createdAt),f=Object(x.a)(u,"UTC");t.createdAt=o(f)}));var c=r({edges:e.edges});$(".modal-body",n).html(c),n.modal("show")})).fail((function(e){403===e.status&&(Object(f.a)("Доступ запрещён.","error"),$(t).remove())}))}))}};t.default=A}}]);