(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{"+0yd":function(t,e,i){var n,o;!function(r,s){"use strict";void 0===(o="function"==typeof(n=s)?n.call(e,i,e,t):n)||(t.exports=o)}(window,(function(){"use strict";var t=function(){var t=window.Element.prototype;if(t.matches)return"matches";if(t.matchesSelector)return"matchesSelector";for(var e=["webkit","moz","ms","o"],i=0;i<e.length;i++){var n=e[i]+"MatchesSelector";if(t[n])return n}}();return function(e,i){return e[t](i)}}))},MgEx:function(t,e,i){var n,o;!function(r,s){n=[i("+0yd")],void 0===(o=function(t){return function(t,e){"use strict";var i={extend:function(t,e){for(var i in e)t[i]=e[i];return t},modulo:function(t,e){return(t%e+e)%e}},n=Array.prototype.slice;i.makeArray=function(t){return Array.isArray(t)?t:null==t?[]:"object"==typeof t&&"number"==typeof t.length?n.call(t):[t]},i.removeFrom=function(t,e){var i=t.indexOf(e);-1!=i&&t.splice(i,1)},i.getParent=function(t,i){for(;t.parentNode&&t!=document.body;)if(t=t.parentNode,e(t,i))return t},i.getQueryElement=function(t){return"string"==typeof t?document.querySelector(t):t},i.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},i.filterFindElements=function(t,n){t=i.makeArray(t);var o=[];return t.forEach((function(t){if(t instanceof HTMLElement)if(n){e(t,n)&&o.push(t);for(var i=t.querySelectorAll(n),r=0;r<i.length;r++)o.push(i[r])}else o.push(t)})),o},i.debounceMethod=function(t,e,i){i=i||100;var n=t.prototype[e],o=e+"Timeout";t.prototype[e]=function(){var t=this[o];clearTimeout(t);var e=arguments,r=this;this[o]=setTimeout((function(){n.apply(r,e),delete r[o]}),i)}},i.docReady=function(t){var e=document.readyState;"complete"==e||"interactive"==e?setTimeout(t):document.addEventListener("DOMContentLoaded",t)},i.toDashed=function(t){return t.replace(/(.)([A-Z])/g,(function(t,e,i){return e+"-"+i})).toLowerCase()};var o=t.console;return i.htmlInit=function(e,n){i.docReady((function(){var r=i.toDashed(n),s="data-"+r,a=document.querySelectorAll("["+s+"]"),h=document.querySelectorAll(".js-"+r),u=i.makeArray(a).concat(i.makeArray(h)),c=s+"-options",l=t.jQuery;u.forEach((function(t){var i,r=t.getAttribute(s)||t.getAttribute(c);try{i=r&&JSON.parse(r)}catch(e){return void(o&&o.error("Error parsing "+s+" on "+t.className+": "+e))}var a=new e(t,i);l&&l.data(t,n,a)}))}))},i}(r,t)}.apply(e,n))||(t.exports=o)}(window)},OiQE:function(t,e,i){"use strict";var n=i("tekp"),o=i.n(n),r=i("3NWV"),s=i("8MoB"),a=i("t9DP"),h=i("TNvb"),u=i("7/V+"),c=i("khZo"),l=i("HUEr"),d=i.n(l),f=i("ERkP"),p=i.n(f),m=i("2Bys");function g(t){var e=function(){if("undefined"==typeof Reflect||!o.a)return!1;if(o.a.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(o()(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,n=Object(u.a)(t);if(e){var r=Object(u.a)(this).constructor;i=o()(n,arguments,r)}else i=n.apply(this,arguments);return Object(h.a)(this,i)}}var v=function(t){Object(a.a)(i,t);var e=g(i);function i(){return Object(r.a)(this,i),e.apply(this,arguments)}return Object(s.a)(i,[{key:"shouldComponentUpdate",value:function(t,e,i){return this.props.currentPage!==t.currentPage}},{key:"createPageItem",value:function(t,e,i){var n=this;return p.a.createElement("li",{key:t,className:"page-item d-none d-md-block".concat(i===t+1?" active":"")},p.a.createElement("button",{className:"page-link",onClick:function(){return n.setPage(t+1)}},e))}},{key:"createEllipsis",value:function(t){return p.a.createElement("li",{key:t,className:"page-item disabled d-none d-md-block"},p.a.createElement("div",{className:"ellipsis"},"…"))}},{key:"setPage",value:function(t){t!==this.props.currentPage&&this.props.onChangePage(t)}},{key:"getPager",value:function(){var t=[],e=this.props,i=e.pageRangeDisplayed,n=e.marginPagesDisplayed,o=e.currentPage,r=e.gapSize,s=this.getTotalPages();if(s<=i+n+r)for(var a=0;a<s;a++)t.push(this.createPageItem(a,a+1,o));else{var h,u=Math.floor((i-1)/2),c=i-u-1;o<i?c=i-(u=o):o>s-c&&(u=i-(c=s-o)-1),o-u-n-1<=r?u+=r:s-(o+c+n)<=r&&(c+=r);for(var l=0;l<s;l++){var d=l+1;d<=n?t.push(this.createPageItem(l,d,o)):d>=o-u&&d<=o+c||d>s-n?t.push(this.createPageItem(l,d,o)):t[t.length-1]!==h&&(h=this.createEllipsis(l),t.push(h))}}return t}},{key:"getTotalPages",value:function(){return Math.ceil(this.props.totalItems/this.props.pageSize)}},{key:"render",value:function(){var t,e=this,i=this.getPager(),n=this.props.currentPage,o=this.getTotalPages();return!i||i.length<=1?null:p.a.createElement("ul",{className:"ui pagination"},p.a.createElement("li",{className:"page-item".concat(1===n?" disabled":"")},p.a.createElement("button",{className:"page-link",onClick:function(){return e.setPage(n-1)}},p.a.createElement(m.a,{id:"arrow-left"}))),i,p.a.createElement("li",{className:"page-status d-md-none"},d()(t="".concat(n," из ")).call(t,o)),p.a.createElement("li",{className:"page-item".concat(n===o?" disabled":"")},p.a.createElement("button",{className:"page-link",onClick:function(){return e.setPage(n+1)}},p.a.createElement(m.a,{id:"arrow-right"}))))}}]),i}(p.a.Component);Object(c.a)(v,"defaultProps",{currentPage:1,pageSize:10,pageRangeDisplayed:3,marginPagesDisplayed:1,showFirst:!0,showLast:!0,showPrevious:!0,showNext:!0,gapSize:1}),e.a=v},"S/jx":function(t,e,i){var n,o;"undefined"!=typeof window&&window,void 0===(o="function"==typeof(n=function(){"use strict";function t(){}var e=t.prototype;return e.on=function(t,e){if(t&&e){var i=this._events=this._events||{},n=i[t]=i[t]||[];return-1==n.indexOf(e)&&n.push(e),this}},e.once=function(t,e){if(t&&e){this.on(t,e);var i=this._onceEvents=this._onceEvents||{};return(i[t]=i[t]||{})[e]=!0,this}},e.off=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var n=i.indexOf(e);return-1!=n&&i.splice(n,1),this}},e.emitEvent=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){i=i.slice(0),e=e||[];for(var n=this._onceEvents&&this._onceEvents[t],o=0;o<i.length;o++){var r=i[o];n&&n[r]&&(this.off(t,r),delete n[r]),r.apply(this,e)}return this}},e.allOff=function(){delete this._events,delete this._onceEvents},t})?n.call(e,i,e,t):n)||(t.exports=o)},c7lp:function(t,e,i){var n,o;
/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */window,void 0===(o="function"==typeof(n=function(){"use strict";function t(t){var e=parseFloat(t);return-1==t.indexOf("%")&&!isNaN(e)&&e}var e="undefined"==typeof console?function(){}:function(t){console.error(t)},i=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"],n=i.length;function o(t){var i=getComputedStyle(t);return i||e("Style returned "+i+". Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1"),i}var r,s=!1;function a(e){if(function(){if(!s){s=!0;var e=document.createElement("div");e.style.width="200px",e.style.padding="1px 2px 3px 4px",e.style.borderStyle="solid",e.style.borderWidth="1px 2px 3px 4px",e.style.boxSizing="border-box";var i=document.body||document.documentElement;i.appendChild(e);var n=o(e);r=200==Math.round(t(n.width)),a.isBoxSizeOuter=r,i.removeChild(e)}}(),"string"==typeof e&&(e=document.querySelector(e)),e&&"object"==typeof e&&e.nodeType){var h=o(e);if("none"==h.display)return function(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0;e<n;e++)t[i[e]]=0;return t}();var u={};u.width=e.offsetWidth,u.height=e.offsetHeight;for(var c=u.isBorderBox="border-box"==h.boxSizing,l=0;l<n;l++){var d=i[l],f=h[d],p=parseFloat(f);u[d]=isNaN(p)?0:p}var m=u.paddingLeft+u.paddingRight,g=u.paddingTop+u.paddingBottom,v=u.marginLeft+u.marginRight,y=u.marginTop+u.marginBottom,b=u.borderLeftWidth+u.borderRightWidth,E=u.borderTopWidth+u.borderBottomWidth,_=c&&r,x=t(h.width);!1!==x&&(u.width=x+(_?0:m+b));var O=t(h.height);return!1!==O&&(u.height=O+(_?0:g+E)),u.innerWidth=u.width-(m+b),u.innerHeight=u.height-(g+E),u.outerWidth=u.width+v,u.outerHeight=u.height+y,u}}return a})?n.call(e,i,e,t):n)||(t.exports=o)},h7VA:function(t,e,i){"use strict";i.d(e,"a",(function(){return n})),i.d(e,"c",(function(){return o})),i.d(e,"b",(function(){return r}));var n=992,o=("(max-width: ".concat(575,"px)"),"(min-width: ".concat(576,"px) and (max-width: ").concat(575,"px)"),"(min-width: ".concat(768,"px)"),"(min-width: ".concat(768,"px) and (max-width: ").concat(n-1,"px)"),"(max-width: ".concat(n-1,"px)")),r="(min-width: ".concat(n,"px)")},"ir+/":function(t,e,i){"use strict";i.r(e);var n=i("tekp"),o=i.n(n),r=i("rVmq"),s=i.n(r),a=i("odIl"),h=i.n(a),u=i("Dl6t"),c=i.n(u),l=i("oQkc"),d=i.n(l),f=i("8g+w"),p=i.n(f),m=i("3NWV"),g=i("8MoB"),v=i("6Bik"),y=i("t9DP"),b=i("TNvb"),E=i("7/V+"),_=i("khZo"),x=i("bIJA"),O=i.n(x),z=i("11Hm"),T=i("jEGL"),P=i.n(T),I=i("GtyH"),S=i.n(I),C=i("ERkP"),W=i.n(C),w=i("1aPi"),L=i("9RHM"),j=i("OiQE");function R(t){var e=function(){if("undefined"==typeof Reflect||!o.a)return!1;if(o.a.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(o()(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,n=Object(E.a)(t);if(e){var r=Object(E.a)(this).constructor;i=o()(n,arguments,r)}else i=n.apply(this,arguments);return Object(b.a)(this,i)}}var k=function(t){Object(y.a)(i,t);var e=R(i);function i(){return Object(m.a)(this,i),e.apply(this,arguments)}return Object(g.a)(i,[{key:"render",value:function(){var t=this.props,e=t.student,i=t.photo,n=t.imgWidth,o=t.imgHeight,r=t.testimonial,s=t.year,a=t.areas;return W.a.createElement("div",{className:"ui author _testimonial"},W.a.createElement("img",{className:"author__img",alt:e,src:i,width:n,height:o}),W.a.createElement("div",{className:"author__details"},W.a.createElement("h4",null,e),W.a.createElement("span",null,"Выпуск ",s,", ",a)),W.a.createElement("div",{className:"author__testimonial",dangerouslySetInnerHTML:{__html:r}}))}}]),i}(W.a.Component);Object(_.a)(k,"defaultProps",{imgWidth:74,imgHeight:74,className:"user-card"});var N=k,B=i("4KB7"),M=i("h7VA");function D(t,e){var i=s()(t);if(h.a){var n=h()(t);e&&(n=c()(n).call(n,(function(e){return d()(t,e).enumerable}))),i.push.apply(i,n)}return i}function H(t){var e=function(){if("undefined"==typeof Reflect||!o.a)return!1;if(o.a.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(o()(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,n=Object(E.a)(t);if(e){var r=Object(E.a)(this).constructor;i=o()(n,arguments,r)}else i=n.apply(this,arguments);return Object(b.a)(this,i)}}var F=window.screen.availWidth>=M.a,A=Object(z.a)(),Y=function(t){Object(y.a)(i,t);var e=H(i);function i(t){var n;return Object(m.a)(this,i),n=e.call(this,t),Object(_.a)(Object(v.a)(n),"componentDidMount",(function(){F&&new P.a(n.masonryGrid.current,{itemSelector:".grid-item",columnWidth:".grid-sizer",percentPosition:!0,transitionDuration:0,initLayout:!1}).on("layoutComplete",(function(){Object(B.b)()}));A.listen((function(t,e){var i=n.props.initialState.page;t.state&&t.state.page!==n.state.page&&(i=t.state.page),n.setState({loading:!0,page:i})})),n.setState({loading:!0,page:n.state.page})})),Object(_.a)(Object(v.a)(n),"fetch",(function(t){n.serverRequest=S.a.ajax({type:"GET",url:n.props.endpoint,dataType:"json",data:t}).done((function(t){var e,i=t.areas;O()(e=t.results).call(e,(function(t){var e,n=O()(e=t.areas).call(e,(function(t){return i[t]}));t.areas=n.join(", ")})),n.setState({loading:!1,items:t.results})})).fail((function(){Object(B.j)("Ошибка загрузки данных. Попробуйте перезагрузить страницу.")}))})),n.masonryGrid=W.a.createRef(),n.state=function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?D(Object(i),!0).forEach((function(e){Object(_.a)(t,e,i[e])})):p.a?Object.defineProperties(t,p()(i)):D(Object(i)).forEach((function(e){Object.defineProperty(t,e,d()(i,e))}))}return t}({loading:!0,items:[]},Object(L.a)(t.initialState)),n.onChangePage=n.onChangePage.bind(Object(v.a)(n)),n.fetch=Object(w.a)(n.fetch,300),n}return Object(g.a)(i,[{key:"componentWillUnmount",value:function(){this.serverRequest.abort()}},{key:"onChangePage",value:function(t){A.push({pathname:A.location.pathname,search:"?page=".concat(t),state:{page:t}}),this.setState({loading:!0,page:t})}},{key:"componentDidUpdate",value:function(t,e,i){if(this.state.loading){var n=this.getRequestPayload(this.state);this.fetch(n)}else if(F){var o=P.a.data(this.masonryGrid.current);o.reloadItems(),o.layout()}else Object(B.b)()}},{key:"getRequestPayload",value:function(t){return{page:t.page,page_size:this.props.pageSize}}},{key:"render",value:function(){var t;return this.state.loading&&Object(B.h)(),W.a.createElement("div",null,W.a.createElement("h1",null,"Выпускники о CS центре"),W.a.createElement("div",{id:"masonry-grid",ref:this.masonryGrid},O()(t=this.state.items).call(t,(function(t){return W.a.createElement("div",{className:"grid-item",key:t.id},W.a.createElement("div",{className:"card mb-2"},W.a.createElement("div",{className:"card__content"},W.a.createElement(N,t))))})),W.a.createElement("div",{className:"grid-sizer"})),W.a.createElement(j.a,{totalItems:this.props.total,pageSize:this.props.pageSize,currentPage:this.state.page,onChangePage:this.onChangePage}))}}]),i}(W.a.Component);e.default=Y},jEGL:function(t,e,i){var n,o,r;
/*!
 * Masonry v4.2.2
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */window,o=[i("txRN"),i("c7lp")],void 0===(r="function"==typeof(n=function(t,e){"use strict";var i=t.create("masonry");i.compatOptions.fitWidth="isFitWidth";var n=i.prototype;return n._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns(),this.colYs=[];for(var t=0;t<this.cols;t++)this.colYs.push(0);this.maxY=0,this.horizontalColIndex=0},n.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var t=this.items[0],i=t&&t.element;this.columnWidth=i&&e(i).outerWidth||this.containerWidth}var n=this.columnWidth+=this.gutter,o=this.containerWidth+this.gutter,r=o/n,s=n-o%n;r=Math[s&&s<1?"round":"floor"](r),this.cols=Math.max(r,1)},n.getContainerWidth=function(){var t=this._getOption("fitWidth")?this.element.parentNode:this.element,i=e(t);this.containerWidth=i&&i.innerWidth},n._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth%this.columnWidth,i=Math[e&&e<1?"round":"ceil"](t.size.outerWidth/this.columnWidth);i=Math.min(i,this.cols);for(var n=this[this.options.horizontalOrder?"_getHorizontalColPosition":"_getTopColPosition"](i,t),o={x:this.columnWidth*n.col,y:n.y},r=n.y+t.size.outerHeight,s=i+n.col,a=n.col;a<s;a++)this.colYs[a]=r;return o},n._getTopColPosition=function(t){var e=this._getTopColGroup(t),i=Math.min.apply(Math,e);return{col:e.indexOf(i),y:i}},n._getTopColGroup=function(t){if(t<2)return this.colYs;for(var e=[],i=this.cols+1-t,n=0;n<i;n++)e[n]=this._getColGroupY(n,t);return e},n._getColGroupY=function(t,e){if(e<2)return this.colYs[t];var i=this.colYs.slice(t,t+e);return Math.max.apply(Math,i)},n._getHorizontalColPosition=function(t,e){var i=this.horizontalColIndex%this.cols;i=t>1&&i+t>this.cols?0:i;var n=e.size.outerWidth&&e.size.outerHeight;return this.horizontalColIndex=n?i+t:this.horizontalColIndex,{col:i,y:this._getColGroupY(i,t)}},n._manageStamp=function(t){var i=e(t),n=this._getElementOffset(t),o=this._getOption("originLeft")?n.left:n.right,r=o+i.outerWidth,s=Math.floor(o/this.columnWidth);s=Math.max(0,s);var a=Math.floor(r/this.columnWidth);a-=r%this.columnWidth?0:1,a=Math.min(this.cols-1,a);for(var h=(this._getOption("originTop")?n.top:n.bottom)+i.outerHeight,u=s;u<=a;u++)this.colYs[u]=Math.max(h,this.colYs[u])},n._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var t={height:this.maxY};return this._getOption("fitWidth")&&(t.width=this._getContainerFitWidth()),t},n._getContainerFitWidth=function(){for(var t=0,e=this.cols;--e&&0===this.colYs[e];)t++;return(this.cols-t)*this.columnWidth-this.gutter},n.needsResizeLayout=function(){var t=this.containerWidth;return this.getContainerWidth(),t!=this.containerWidth},i})?n.apply(e,o):n)||(t.exports=r)},oaFD:function(t,e,i){var n,o,r;window,o=[i("S/jx"),i("c7lp")],void 0===(r="function"==typeof(n=function(t,e){"use strict";var i=document.documentElement.style,n="string"==typeof i.transition?"transition":"WebkitTransition",o="string"==typeof i.transform?"transform":"WebkitTransform",r={WebkitTransition:"webkitTransitionEnd",transition:"transitionend"}[n],s={transform:o,transition:n,transitionDuration:n+"Duration",transitionProperty:n+"Property",transitionDelay:n+"Delay"};function a(t,e){t&&(this.element=t,this.layout=e,this.position={x:0,y:0},this._create())}var h=a.prototype=Object.create(t.prototype);h.constructor=a,h._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},h.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},h.getSize=function(){this.size=e(this.element)},h.css=function(t){var e=this.element.style;for(var i in t)e[s[i]||i]=t[i]},h.getPosition=function(){var t=getComputedStyle(this.element),e=this.layout._getOption("originLeft"),i=this.layout._getOption("originTop"),n=t[e?"left":"right"],o=t[i?"top":"bottom"],r=parseFloat(n),s=parseFloat(o),a=this.layout.size;-1!=n.indexOf("%")&&(r=r/100*a.width),-1!=o.indexOf("%")&&(s=s/100*a.height),r=isNaN(r)?0:r,s=isNaN(s)?0:s,r-=e?a.paddingLeft:a.paddingRight,s-=i?a.paddingTop:a.paddingBottom,this.position.x=r,this.position.y=s},h.layoutPosition=function(){var t=this.layout.size,e={},i=this.layout._getOption("originLeft"),n=this.layout._getOption("originTop"),o=i?"paddingLeft":"paddingRight",r=i?"left":"right",s=i?"right":"left",a=this.position.x+t[o];e[r]=this.getXValue(a),e[s]="";var h=n?"paddingTop":"paddingBottom",u=n?"top":"bottom",c=n?"bottom":"top",l=this.position.y+t[h];e[u]=this.getYValue(l),e[c]="",this.css(e),this.emitEvent("layout",[this])},h.getXValue=function(t){var e=this.layout._getOption("horizontal");return this.layout.options.percentPosition&&!e?t/this.layout.size.width*100+"%":t+"px"},h.getYValue=function(t){var e=this.layout._getOption("horizontal");return this.layout.options.percentPosition&&e?t/this.layout.size.height*100+"%":t+"px"},h._transitionTo=function(t,e){this.getPosition();var i=this.position.x,n=this.position.y,o=t==this.position.x&&e==this.position.y;if(this.setPosition(t,e),!o||this.isTransitioning){var r=t-i,s=e-n,a={};a.transform=this.getTranslate(r,s),this.transition({to:a,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})}else this.layoutPosition()},h.getTranslate=function(t,e){return"translate3d("+(t=this.layout._getOption("originLeft")?t:-t)+"px, "+(e=this.layout._getOption("originTop")?e:-e)+"px, 0)"},h.goTo=function(t,e){this.setPosition(t,e),this.layoutPosition()},h.moveTo=h._transitionTo,h.setPosition=function(t,e){this.position.x=parseFloat(t),this.position.y=parseFloat(e)},h._nonTransition=function(t){for(var e in this.css(t.to),t.isCleaning&&this._removeStyles(t.to),t.onTransitionEnd)t.onTransitionEnd[e].call(this)},h.transition=function(t){if(parseFloat(this.layout.options.transitionDuration)){var e=this._transn;for(var i in t.onTransitionEnd)e.onEnd[i]=t.onTransitionEnd[i];for(i in t.to)e.ingProperties[i]=!0,t.isCleaning&&(e.clean[i]=!0);t.from&&(this.css(t.from),this.element.offsetHeight),this.enableTransition(t.to),this.css(t.to),this.isTransitioning=!0}else this._nonTransition(t)};var u="opacity,"+o.replace(/([A-Z])/g,(function(t){return"-"+t.toLowerCase()}));h.enableTransition=function(){if(!this.isTransitioning){var t=this.layout.options.transitionDuration;t="number"==typeof t?t+"ms":t,this.css({transitionProperty:u,transitionDuration:t,transitionDelay:this.staggerDelay||0}),this.element.addEventListener(r,this,!1)}},h.onwebkitTransitionEnd=function(t){this.ontransitionend(t)},h.onotransitionend=function(t){this.ontransitionend(t)};var c={"-webkit-transform":"transform"};h.ontransitionend=function(t){if(t.target===this.element){var e=this._transn,i=c[t.propertyName]||t.propertyName;delete e.ingProperties[i],function(t){for(var e in t)return!1;return!0}(e.ingProperties)&&this.disableTransition(),i in e.clean&&(this.element.style[t.propertyName]="",delete e.clean[i]),i in e.onEnd&&(e.onEnd[i].call(this),delete e.onEnd[i]),this.emitEvent("transitionEnd",[this])}},h.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(r,this,!1),this.isTransitioning=!1},h._removeStyles=function(t){var e={};for(var i in t)e[i]="";this.css(e)};var l={transitionProperty:"",transitionDuration:"",transitionDelay:""};return h.removeTransitionStyles=function(){this.css(l)},h.stagger=function(t){t=isNaN(t)?0:t,this.staggerDelay=t+"ms"},h.removeElem=function(){this.element.parentNode.removeChild(this.element),this.css({display:""}),this.emitEvent("remove",[this])},h.remove=function(){n&&parseFloat(this.layout.options.transitionDuration)?(this.once("transitionEnd",(function(){this.removeElem()})),this.hide()):this.removeElem()},h.reveal=function(){delete this.isHidden,this.css({display:""});var t=this.layout.options,e={};e[this.getHideRevealTransitionEndProperty("visibleStyle")]=this.onRevealTransitionEnd,this.transition({from:t.hiddenStyle,to:t.visibleStyle,isCleaning:!0,onTransitionEnd:e})},h.onRevealTransitionEnd=function(){this.isHidden||this.emitEvent("reveal")},h.getHideRevealTransitionEndProperty=function(t){var e=this.layout.options[t];if(e.opacity)return"opacity";for(var i in e)return i},h.hide=function(){this.isHidden=!0,this.css({display:""});var t=this.layout.options,e={};e[this.getHideRevealTransitionEndProperty("hiddenStyle")]=this.onHideTransitionEnd,this.transition({from:t.visibleStyle,to:t.hiddenStyle,isCleaning:!0,onTransitionEnd:e})},h.onHideTransitionEnd=function(){this.isHidden&&(this.css({display:"none"}),this.emitEvent("hide"))},h.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},a})?n.apply(e,o):n)||(t.exports=r)},txRN:function(t,e,i){var n,o;
/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */!function(r,s){"use strict";n=[i("S/jx"),i("c7lp"),i("MgEx"),i("oaFD")],void 0===(o=function(t,e,i,n){return function(t,e,i,n,o){var r=t.console,s=t.jQuery,a=function(){},h=0,u={};function c(t,e){var i=n.getQueryElement(t);if(i){this.element=i,s&&(this.$element=s(this.element)),this.options=n.extend({},this.constructor.defaults),this.option(e);var o=++h;this.element.outlayerGUID=o,u[o]=this,this._create(),this._getOption("initLayout")&&this.layout()}else r&&r.error("Bad element for "+this.constructor.namespace+": "+(i||t))}c.namespace="outlayer",c.Item=o,c.defaults={containerStyle:{position:"relative"},initLayout:!0,originLeft:!0,originTop:!0,resize:!0,resizeContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}};var l=c.prototype;function d(t){function e(){t.apply(this,arguments)}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e}n.extend(l,e.prototype),l.option=function(t){n.extend(this.options,t)},l._getOption=function(t){var e=this.constructor.compatOptions[t];return e&&void 0!==this.options[e]?this.options[e]:this.options[t]},c.compatOptions={initLayout:"isInitLayout",horizontal:"isHorizontal",layoutInstant:"isLayoutInstant",originLeft:"isOriginLeft",originTop:"isOriginTop",resize:"isResizeBound",resizeContainer:"isResizingContainer"},l._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),n.extend(this.element.style,this.options.containerStyle),this._getOption("resize")&&this.bindResize()},l.reloadItems=function(){this.items=this._itemize(this.element.children)},l._itemize=function(t){for(var e=this._filterFindItemElements(t),i=this.constructor.Item,n=[],o=0;o<e.length;o++){var r=new i(e[o],this);n.push(r)}return n},l._filterFindItemElements=function(t){return n.filterFindElements(t,this.options.itemSelector)},l.getItemElements=function(){return this.items.map((function(t){return t.element}))},l.layout=function(){this._resetLayout(),this._manageStamps();var t=this._getOption("layoutInstant"),e=void 0!==t?t:!this._isLayoutInited;this.layoutItems(this.items,e),this._isLayoutInited=!0},l._init=l.layout,l._resetLayout=function(){this.getSize()},l.getSize=function(){this.size=i(this.element)},l._getMeasurement=function(t,e){var n,o=this.options[t];o?("string"==typeof o?n=this.element.querySelector(o):o instanceof HTMLElement&&(n=o),this[t]=n?i(n)[e]:o):this[t]=0},l.layoutItems=function(t,e){t=this._getItemsForLayout(t),this._layoutItems(t,e),this._postLayout()},l._getItemsForLayout=function(t){return t.filter((function(t){return!t.isIgnored}))},l._layoutItems=function(t,e){if(this._emitCompleteOnItems("layout",t),t&&t.length){var i=[];t.forEach((function(t){var n=this._getItemLayoutPosition(t);n.item=t,n.isInstant=e||t.isLayoutInstant,i.push(n)}),this),this._processLayoutQueue(i)}},l._getItemLayoutPosition=function(){return{x:0,y:0}},l._processLayoutQueue=function(t){this.updateStagger(),t.forEach((function(t,e){this._positionItem(t.item,t.x,t.y,t.isInstant,e)}),this)},l.updateStagger=function(){var t=this.options.stagger;if(null!=t)return this.stagger=function(t){if("number"==typeof t)return t;var e=t.match(/(^\d*\.?\d*)(\w*)/),i=e&&e[1],n=e&&e[2];if(!i.length)return 0;return(i=parseFloat(i))*(f[n]||1)}(t),this.stagger;this.stagger=0},l._positionItem=function(t,e,i,n,o){n?t.goTo(e,i):(t.stagger(o*this.stagger),t.moveTo(e,i))},l._postLayout=function(){this.resizeContainer()},l.resizeContainer=function(){if(this._getOption("resizeContainer")){var t=this._getContainerSize();t&&(this._setContainerMeasure(t.width,!0),this._setContainerMeasure(t.height,!1))}},l._getContainerSize=a,l._setContainerMeasure=function(t,e){if(void 0!==t){var i=this.size;i.isBorderBox&&(t+=e?i.paddingLeft+i.paddingRight+i.borderLeftWidth+i.borderRightWidth:i.paddingBottom+i.paddingTop+i.borderTopWidth+i.borderBottomWidth),t=Math.max(t,0),this.element.style[e?"width":"height"]=t+"px"}},l._emitCompleteOnItems=function(t,e){var i=this;function n(){i.dispatchEvent(t+"Complete",null,[e])}var o=e.length;if(e&&o){var r=0;e.forEach((function(e){e.once(t,s)}))}else n();function s(){++r==o&&n()}},l.dispatchEvent=function(t,e,i){var n=e?[e].concat(i):i;if(this.emitEvent(t,n),s)if(this.$element=this.$element||s(this.element),e){var o=s.Event(e);o.type=t,this.$element.trigger(o,i)}else this.$element.trigger(t,i)},l.ignore=function(t){var e=this.getItem(t);e&&(e.isIgnored=!0)},l.unignore=function(t){var e=this.getItem(t);e&&delete e.isIgnored},l.stamp=function(t){(t=this._find(t))&&(this.stamps=this.stamps.concat(t),t.forEach(this.ignore,this))},l.unstamp=function(t){(t=this._find(t))&&t.forEach((function(t){n.removeFrom(this.stamps,t),this.unignore(t)}),this)},l._find=function(t){if(t)return"string"==typeof t&&(t=this.element.querySelectorAll(t)),t=n.makeArray(t)},l._manageStamps=function(){this.stamps&&this.stamps.length&&(this._getBoundingRect(),this.stamps.forEach(this._manageStamp,this))},l._getBoundingRect=function(){var t=this.element.getBoundingClientRect(),e=this.size;this._boundingRect={left:t.left+e.paddingLeft+e.borderLeftWidth,top:t.top+e.paddingTop+e.borderTopWidth,right:t.right-(e.paddingRight+e.borderRightWidth),bottom:t.bottom-(e.paddingBottom+e.borderBottomWidth)}},l._manageStamp=a,l._getElementOffset=function(t){var e=t.getBoundingClientRect(),n=this._boundingRect,o=i(t);return{left:e.left-n.left-o.marginLeft,top:e.top-n.top-o.marginTop,right:n.right-e.right-o.marginRight,bottom:n.bottom-e.bottom-o.marginBottom}},l.handleEvent=n.handleEvent,l.bindResize=function(){t.addEventListener("resize",this),this.isResizeBound=!0},l.unbindResize=function(){t.removeEventListener("resize",this),this.isResizeBound=!1},l.onresize=function(){this.resize()},n.debounceMethod(c,"onresize",100),l.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},l.needsResizeLayout=function(){var t=i(this.element);return this.size&&t&&t.innerWidth!==this.size.innerWidth},l.addItems=function(t){var e=this._itemize(t);return e.length&&(this.items=this.items.concat(e)),e},l.appended=function(t){var e=this.addItems(t);e.length&&(this.layoutItems(e,!0),this.reveal(e))},l.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps(),this.layoutItems(e,!0),this.reveal(e),this.layoutItems(i)}},l.reveal=function(t){if(this._emitCompleteOnItems("reveal",t),t&&t.length){var e=this.updateStagger();t.forEach((function(t,i){t.stagger(i*e),t.reveal()}))}},l.hide=function(t){if(this._emitCompleteOnItems("hide",t),t&&t.length){var e=this.updateStagger();t.forEach((function(t,i){t.stagger(i*e),t.hide()}))}},l.revealItemElements=function(t){var e=this.getItems(t);this.reveal(e)},l.hideItemElements=function(t){var e=this.getItems(t);this.hide(e)},l.getItem=function(t){for(var e=0;e<this.items.length;e++){var i=this.items[e];if(i.element==t)return i}},l.getItems=function(t){t=n.makeArray(t);var e=[];return t.forEach((function(t){var i=this.getItem(t);i&&e.push(i)}),this),e},l.remove=function(t){var e=this.getItems(t);this._emitCompleteOnItems("remove",e),e&&e.length&&e.forEach((function(t){t.remove(),n.removeFrom(this.items,t)}),this)},l.destroy=function(){var t=this.element.style;t.height="",t.position="",t.width="",this.items.forEach((function(t){t.destroy()})),this.unbindResize();var e=this.element.outlayerGUID;delete u[e],delete this.element.outlayerGUID,s&&s.removeData(this.element,this.constructor.namespace)},c.data=function(t){var e=(t=n.getQueryElement(t))&&t.outlayerGUID;return e&&u[e]},c.create=function(t,e){var i=d(c);return i.defaults=n.extend({},c.defaults),n.extend(i.defaults,e),i.compatOptions=n.extend({},c.compatOptions),i.namespace=t,i.data=c.data,i.Item=d(o),n.htmlInit(i,t),s&&s.bridget&&s.bridget(t,i),i};var f={ms:1,s:1e3};return c.Item=o,c}(r,t,e,i,n)}.apply(e,n))||(t.exports=o)}(window)}}]);