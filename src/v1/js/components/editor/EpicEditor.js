/**
 * EpicEditor - An Embeddable JavaScript Markdown Editor (https://github.com/OscarGodson/EpicEditor)
 * Copyright (c) 2011-2012, Oscar Godson. (MIT Licensed)
 */

/**
 * Applies attributes to a DOM object
 * @param  {object} context The DOM obj you want to apply the attributes to
 * @param  {object} attrs A key/value pair of attributes you want to apply
 * @returns {undefined}
 */
function _applyAttrs(context, attrs) {
  for (let attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      context[attr] = attrs[attr];
    }
  }
}

/**
 * Applies styles to a DOM object
 * @param  {object} context The DOM obj you want to apply the attributes to
 * @param  {object} attrs A key/value pair of attributes you want to apply
 * @returns {undefined}
 */
function _applyStyles(context, attrs) {
  for (let attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      context.style[attr] = attrs[attr];
    }
  }
}

/**
 * Returns a DOM objects computed style
 * @param  {object} el The element you want to get the style from
 * @param  {string} styleProp The property you want to get from the element
 * @returns {string} Returns a string of the value. If property is not set it will return a blank string
 */
function _getStyle(el, styleProp) {
  let x = el,
    y = null;
  if (window.getComputedStyle) {
    y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
  } else if (x.currentStyle) {
    y = x.currentStyle[styleProp];
  }
  return y;
}

/**
 * Saves the current style state for the styles requested, then applies styles
 * to overwrite the existing one. The old styles are returned as an object so
 * you can pass it back in when you want to revert back to the old style
 * @param   {object} el     The element to get the styles of
 * @param   {string} type   Can be "save" or "apply". apply will just apply styles you give it. Save will write styles
 * @param   {object} styles Key/value style/property pairs
 * @returns {object}
 */
function _saveStyleState(el, type, styles) {
  let returnState = {},
    style;
  if (type === 'save') {
    for (style in styles) {
      if (styles.hasOwnProperty(style)) {
        returnState[style] = _getStyle(el, style);
      }
    }
    // After it's all done saving all the previous states, change the styles
    _applyStyles(el, styles);
  } else if (type === 'apply') {
    _applyStyles(el, styles);
  }
  return returnState;
}

/**
 * Gets an elements total width including it's borders and padding
 * @param  {object} el The element to get the total width of
 * @returns {int}
 */
function _outerWidth(el) {
  let b =
      parseInt(_getStyle(el, 'border-left-width'), 10) +
      parseInt(_getStyle(el, 'border-right-width'), 10),
    p = parseInt(_getStyle(el, 'padding-left'), 10) + parseInt(_getStyle(el, 'padding-right'), 10),
    w = el.offsetWidth,
    t;
  // For IE in case no border is set and it defaults to "medium"
  if (isNaN(b)) {
    b = 0;
  }
  t = b + p + w;
  return t;
}

/**
 * Gets an elements total height including it's borders and padding
 * @param  {object} el The element to get the total width of
 * @returns {int}
 */
function _outerHeight(el) {
  let b =
      parseInt(_getStyle(el, 'border-top-width'), 10) +
      parseInt(_getStyle(el, 'border-bottom-width'), 10),
    p = parseInt(_getStyle(el, 'padding-top'), 10) + parseInt(_getStyle(el, 'padding-bottom'), 10),
    w = parseInt(_getStyle(el, 'height'), 10),
    t;
  // For IE in case no border is set and it defaults to "medium"
  if (isNaN(b)) {
    b = 0;
  }
  t = b + p + w;
  return t;
}

/**
 * Inserts a <link> tag specifically for CSS
 * @param  {string} path The path to the CSS file
 * @param  {object} context In what context you want to apply this to (document, iframe, etc)
 * @param  {string} id An id for you to reference later for changing properties of the <link>
 * @returns {undefined}
 */
function _insertCSSLink(path, context, id) {
  id = id || '';
  let headID = context.getElementsByTagName('head')[0],
    cssNode = context.createElement('link');

  _applyAttrs(cssNode, {
    type: 'text/css',
    id: id,
    rel: 'stylesheet',
    href: path,
    name: path,
    media: 'screen'
  });

  headID.appendChild(cssNode);
}

// Simply replaces a class (o), to a new class (n) on an element provided (e)
function _replaceClass(e, o, n) {
  e.className = e.className.replace(o, n);
}

// Feature detects an iframe to get the inner document for writing to
function _getIframeInnards(el) {
  return el.contentDocument || el.contentWindow.document;
}

// Grabs the text from an element and preserves whitespace
function _getText(el) {
  let theText;
  if (typeof document.body.innerText === 'string') {
    theText = el.innerText;
  } else {
    // First replace <br>s before replacing the rest of the HTML
    theText = el.innerHTML.replace(/<br>/gi, '\n');
    // Fix HTML entities
    theText = theText.replace(/&lt;/gi, '<');
    theText = theText.replace(/&gt;/gi, '>');
    theText = theText.replace(/&amp;/gi, '&');
    // Replace spaces
    theText = theText.replace(/&nbsp;/gi, ' ');
    // Replace "<div>" (from Chrome).
    theText = theText.replace(/<div>/gi, '\n');
    theText = theText.replace(/<\/div>/gi, '');
    // Replace "<p>" (from IE).
    theText = theText.replace(/<p>/gi, '\n');
    theText = theText.replace(/<\/p>/gi, '');
    // Now we can clean the rest of HTML
    theText = theText.replace(/<(?:.|\n)*?>/gm, '');
  }
  // No more than 2x newline, per "paragraph".
  theText = theText.replace(/\n\n+/g, '\n\n');
  // Whitespace before/after.
  theText = theText.trim();
  return theText;
}

function _setText(el, content) {
  // Don't convert lt/gt characters as HTML when viewing the editor window
  // TODO: Write a test to catch regressions for this
  content = content.replace(/</g, '&lt;');
  content = content.replace(/>/g, '&gt;');
  content = content.replace(/\n/g, '<br>');

  // Make sure to there aren't two spaces in a row (replace one with &nbsp;)
  // If you find and replace every space with a &nbsp; text will not wrap.
  // Hence the name (Non-Breaking-SPace).
  // TODO: Probably need to test this somehow...
  content = content.replace(/<br>\s/g, '<br>&nbsp;');
  content = content.replace(/\s\s\s/g, '&nbsp; &nbsp;');
  content = content.replace(/\s\s/g, '&nbsp; ');
  content = content.replace(/^ /, '&nbsp;');

  el.innerHTML = content;
  return true;
}

/**
 * Converts the 'raw' format of a file's contents into plaintext
 * @param   {string} content Contents of the file
 * @returns {string} the sanitized content
 */
function _sanitizeRawContent(content) {
  // Get this, 2 spaces in a content editable actually converts to:
  // 0020 00a0, meaning, "space no-break space". So, manually convert
  // no-break spaces to spaces again before handing to marked.
  // Also, WebKit converts no-break to unicode equivalent and FF HTML.
  return content.replace(/\u00a0/g, ' ').replace(/&nbsp;/g, ' ');
}

/**
 * Will return the version number if the browser is IE. If not will return -1
 * TRY NEVER TO USE THIS AND USE FEATURE DETECTION IF POSSIBLE
 * @returns {Number} -1 if false or the version number if true
 */
function _isIE() {
  let rv = -1, // Return value assumes failure.
    ua = navigator.userAgent,
    re;
  if (navigator.appName == 'Microsoft Internet Explorer') {
    re = /MSIE ([0-9]{1,}[\.0-9]{0,})/;
    if (re.exec(ua) != null) {
      rv = parseFloat(RegExp.$1, 10);
    }
  }
  return rv;
}

/**
 * Same as the isIE(), but simply returns a boolean
 * THIS IS TERRIBLE AND IS ONLY USED BECAUSE FULLSCREEN IN SAFARI IS BORKED
 * If some other engine uses WebKit and has support for fullscreen they
 * probably wont get native fullscreen until Safari's fullscreen is fixed
 * @returns {Boolean} true if Safari
 */
function _isSafari() {
  let n = window.navigator;
  return n.userAgent.indexOf('Safari') > -1 && n.userAgent.indexOf('Chrome') == -1;
}

/**
 * Same as the isIE(), but simply returns a boolean
 * THIS IS TERRIBLE ONLY USE IF ABSOLUTELY NEEDED
 * @returns {Boolean} true if Safari
 */
function _isFirefox() {
  let n = window.navigator;
  return n.userAgent.indexOf('Firefox') > -1 && n.userAgent.indexOf('Seamonkey') == -1;
}

/**
 * Determines if supplied value is a function
 * @param {object} object to determine type
 */
function _isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param {boolean} [deepMerge=false] If true, will deep merge meaning it will merge sub-objects like {obj:obj2{foo:'bar'}}
 * @param {object} first object
 * @param {object} second object
 * @returnss {object} a new object based on obj1 and obj2
 */
function _mergeObjs() {
  // copy reference to target object
  let target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false,
    options,
    name,
    src,
    copy;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !_isFunction(target)) {
    target = {};
  }
  // extend jQuery itself if only one argument is passed
  if (length === i) {
    target = this;
    --i;
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        // @NOTE: added hasOwnProperty check
        if (options.hasOwnProperty(name)) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }
          // Recurse if we're merging object values
          if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
            target[name] = _mergeObjs(
              deep,
              // Never move original objects, clone them
              src || (copy.length != null ? [] : {}),
              copy
            );
          } else if (copy !== undefined) {
            // Don't bring in undefined values
            target[name] = copy;
          }
        }
      }
    }
  }

  // Return the modified object
  return target;
}

function isQuotaExceeded(e) {
  let quotaExceeded = false;
  if (e) {
    if (e.code) {
      switch (e.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            quotaExceeded = true;
          }
          break;
      }
    } else if (e.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
}

/**
 * Initiates the EpicEditor object and sets up offline storage as well
 * @class Represents an EpicEditor instance
 * @param {object} options An optional customization object
 * @returns {object} EpicEditor will be returned
 */
function EpicEditor(options) {
  // Default settings will be overwritten/extended by options arg
  let self = this;
  let opts = options || {};
  let _defaultFileSchema;
  let _defaultFile;
  let defaults = {
    container: 'epiceditor',
    basePath: 'epiceditor',
    textarea: undefined,
    clientSideStorage: true,
    localStorageName: 'epiceditor',
    useNativeFullscreen: true,
    file: {
      name: null,
      defaultContent: '',
      autoSave: 100 // Set to false for no auto saving
    },
    theme: {
      base: '/themes/base/epiceditor.css',
      preview: '/themes/preview/github.css',
      editor: '/themes/editor/epic-dark.css'
    },
    focusOnLoad: false,
    shortcut: {
      modifier: 18, // alt keycode
      fullscreen: 70, // f keycode
      preview: 80 // p keycode
    },
    string: {
      togglePreview: 'Toggle Preview Mode',
      toggleEdit: 'Toggle Edit Mode',
      toggleFullscreen: 'Enter Fullscreen'
    },
    parser: typeof marked == 'function' ? marked : null,
    autogrow: false,
    button: {
      fullscreen: true,
      preview: true,
      helpFormatting: false,
      bar: 'auto'
    }
  };
  let defaultStorage;
  let autogrowDefaults = {
    minHeight: 80,
    maxHeight: false,
    scroll: true
  };

  self.settings = _mergeObjs(true, defaults, opts);

  const buttons = self.settings.button;
  self._fullscreenEnabled =
    typeof buttons === 'object'
      ? typeof buttons.fullscreen === 'undefined' || buttons.fullscreen
      : buttons === true;
  self._editEnabled =
    typeof buttons === 'object'
      ? typeof buttons.edit === 'undefined' || buttons.edit
      : buttons === true;
  self._previewEnabled =
    typeof buttons === 'object'
      ? typeof buttons.preview === 'undefined' || buttons.preview
      : buttons === true;
  self._showHelpFormatting =
    typeof buttons === 'object'
      ? typeof buttons.helpFormatting === 'undefined' || buttons.helpFormatting
      : buttons === true;

  if (
    !(typeof self.settings.parser == 'function' && typeof self.settings.parser('TEST') == 'string')
  ) {
    self.settings.parser = function (str) {
      return str;
    };
  }

  if (self.settings.autogrow) {
    if (self.settings.autogrow === true) {
      self.settings.autogrow = autogrowDefaults;
    } else {
      self.settings.autogrow = _mergeObjs(true, autogrowDefaults, self.settings.autogrow);
    }
    self._oldHeight = -1;
  }

  // If you put an absolute link as the path of any of the themes ignore the basePath
  // preview theme
  if (!self.settings.theme.preview.match(/^https?:\/\//)) {
    self.settings.theme.preview = self.settings.basePath + self.settings.theme.preview;
  }
  // editor theme
  if (!self.settings.theme.editor.match(/^https?:\/\//)) {
    self.settings.theme.editor = self.settings.basePath + self.settings.theme.editor;
  }
  // base theme
  if (!self.settings.theme.base.match(/^https?:\/\//)) {
    self.settings.theme.base = self.settings.basePath + self.settings.theme.base;
  }

  // Grab the container element and save it to self.element
  // if it's a string assume it's an ID and if it's an object
  // assume it's a DOM element
  if (typeof self.settings.container == 'string') {
    self.element = document.getElementById(self.settings.container);
  } else if (typeof self.settings.container == 'object') {
    self.element = self.settings.container;
  }

  // Figure out the file name. If no file name is given we'll use the ID.
  // If there's no ID either we'll use a namespaced file name that's incremented
  // based on the calling order. As long as it doesn't change, drafts will be saved.
  if (!self.settings.file.name) {
    if (typeof self.settings.container == 'string') {
      self.settings.file.name = self.settings.container;
    } else if (typeof self.settings.container == 'object') {
      if (self.element.id) {
        self.settings.file.name = self.element.id;
      } else {
        if (!EpicEditor._data.unnamedEditors) {
          EpicEditor._data.unnamedEditors = [];
        }
        EpicEditor._data.unnamedEditors.push(self);
        self.settings.file.name = '__epiceditor-untitled-' + EpicEditor._data.unnamedEditors.length;
      }
    }
  }

  if (self.settings.button.bar === 'show') {
    self.settings.button.bar = true;
  }

  if (self.settings.button.bar === 'hide') {
    self.settings.button.bar = false;
  }

  // Protect the id and overwrite if passed in as an option
  // TODO: Put underscrore to denote that this is private
  self._instanceId = 'epiceditor-' + Math.round(Math.random() * 100000);
  self._storage = {};
  self._canSave = true;

  // Setup local storage of files
  self._defaultFileSchema = function () {
    return {
      content: self.settings.file.defaultContent,
      created: new Date(),
      modified: new Date()
    };
  };

  if (localStorage && self.settings.clientSideStorage) {
    this._storage = localStorage;
    if (
      this._storage[self.settings.localStorageName] &&
      self.getFiles(self.settings.file.name) === undefined
    ) {
      _defaultFile = self._defaultFileSchema();
      _defaultFile.content = self.settings.file.defaultContent;
    }
  }

  if (!this._storage[self.settings.localStorageName]) {
    defaultStorage = {};
    defaultStorage[self.settings.file.name] = self._defaultFileSchema();
    defaultStorage = JSON.stringify(defaultStorage);
    this._storage[self.settings.localStorageName] = defaultStorage;
  }

  // A string to prepend files with to save draft versions of files
  // and reset all preview drafts on each load!
  self._previewDraftLocation = '__draft-';
  self._storage[self._previewDraftLocation + self.settings.localStorageName] =
    self._storage[self.settings.localStorageName];

  // This needs to replace the use of classes to check the state of EE
  self._eeState = {
    fullscreen: false,
    preview: false,
    edit: false,
    loaded: false,
    unloaded: false
  };

  // Now that it exists, allow binding of events if it doesn't exist yet
  if (!self.events) {
    self.events = {};
  }

  return this;
}

/**
 * Inserts the EpicEditor into the DOM via an iframe and gets it ready for editing and previewing
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.load = function (callback) {
  // Get out early if it's already loaded
  if (this.is('loaded')) {
    return this;
  }

  // TODO: Gotta get the privates with underscores!
  // TODO: Gotta document what these are for...
  let self = this,
    _HtmlTemplates,
    iframeElement,
    baseTag,
    utilBtns,
    utilBar,
    utilBarTimer,
    keypressTimer,
    mousePos = { y: -1, x: -1 },
    _elementStates,
    _isInEdit,
    nativeFs = false,
    nativeFsWebkit = false,
    nativeFsMoz = false,
    nativeFsW3C = false,
    fsElement,
    isMod = false,
    isCtrl = false,
    eventableIframes,
    i, // i is reused for loops
    boundAutogrow;

  // Startup is a way to check if this EpicEditor is starting up. Useful for
  // checking and doing certain things before EpicEditor emits a load event.
  self._eeState.startup = true;

  if (self.settings.useNativeFullscreen) {
    nativeFsWebkit = document.body.webkitRequestFullScreen ? true : false;
    nativeFsMoz = document.body.mozRequestFullScreen ? true : false;
    nativeFsW3C = document.body.requestFullscreen ? true : false;
    nativeFs = nativeFsWebkit || nativeFsMoz || nativeFsW3C;
  }

  if (self.settings.textarea) {
    if (typeof self.settings.textarea == 'string') {
      self._textareaElement = document.getElementById(self.settings.textarea);
    } else if (typeof self.settings.textarea == 'object') {
      self._textareaElement = self.settings.textarea;
    }
  }

  // Fucking Safari's native fullscreen works terribly
  // REMOVE THIS IF SAFARI 7 WORKS BETTER
  if (_isSafari()) {
    nativeFs = false;
    nativeFsWebkit = false;
  }

  // It opens edit mode by default (for now);
  if (!self.is('edit') && !self.is('preview')) {
    self._eeState.edit = true;
  }

  callback = callback || function () {};

  // The editor HTML
  // TODO: edit-mode class should be dynamically added
  _HtmlTemplates = {
    // This is wrapping iframe element. It contains the other two iframes and the utilbar
    chrome:
      '<div id="epiceditor-wrapper" class="epiceditor-edit-mode">' +
      '<div id="epiceditor-utilbar" style="opacity: 0">' +
      (self._editEnabled
        ? '<button title="' +
          this.settings.string.toggleEdit +
          '" role="tab" class="epiceditor-toggle-btn epiceditor-toggle-edit-btn">Текст</button> '
        : '') +
      (self._previewEnabled
        ? '<button title="' +
          this.settings.string.togglePreview +
          '" role="tab" class="epiceditor-toggle-btn epiceditor-toggle-preview-btn">Предпросмотр</button> '
        : '') +
      (self._fullscreenEnabled
        ? '<button title="' +
          this.settings.string.toggleFullscreen +
          '" class="epiceditor-fullscreen-btn"></button>'
        : '') +
      (self._showHelpFormatting
        ? '<a style="float: right; color: #337ab7; font-size: 12px; line-height: 30px; text-decoration: none;" target="_blank" href="/commenting-the-right-way/">Как оформлять текст?</a>'
        : '') +
      '</div>' +
      '<iframe frameborder="0" id="epiceditor-editor-frame"></iframe>' +
      '<iframe frameborder="0" id="epiceditor-previewer-frame"></iframe>' +
      '</div>',

    // The previewer is just an empty box for the generated HTML to go into
    previewer: '<div id="epiceditor-preview"></div>',
    editor: '<!doctype HTML>'
  };

  // Write an iframe and then select it for the editor
  self.element.innerHTML =
    '<iframe scrolling="no" frameborder="0" id= "' + self._instanceId + '"></iframe>';

  // Because browsers add things like invisible padding and margins and stuff
  // to iframes, we need to set manually set the height so that the height
  // doesn't keep increasing (by 2px?) every time reflow() is called.
  // FIXME: Figure out how to fix this without setting this
  //self.element.style.height = self.element.offsetHeight + 'px';

  iframeElement = document.getElementById(self._instanceId);

  // Store a reference to the iframeElement itself
  self.iframeElement = iframeElement;

  // Grab the innards of the iframe (returns the document.body)
  // TODO: Change self.iframe to self.iframeDocument
  self.iframe = _getIframeInnards(iframeElement);
  self.iframe.open();
  self.iframe.write(_HtmlTemplates.chrome);

  self.utilPanel = self.iframe.getElementById('epiceditor-utilbar');

  // Now that we got the innards of the iframe, we can grab the other iframes
  self.editorIframe = self.iframe.getElementById('epiceditor-editor-frame');
  self.previewerIframe = self.iframe.getElementById('epiceditor-previewer-frame');

  // Setup the editor iframe
  self.editorIframeDocument = _getIframeInnards(self.editorIframe);
  try {
    self.editorIframeDocument.execCommand('DefaultParagraphSeparator', false, 'div');
  } catch (e) {}
  self.editorIframeDocument.open();
  // Need something for... you guessed it, Firefox
  self.editorIframeDocument.write(_HtmlTemplates.editor);
  self.editorIframeDocument.close();

  // Setup the previewer iframe
  self.previewerIframeDocument = _getIframeInnards(self.previewerIframe);
  self.previewerIframeDocument.open();
  self.previewerIframeDocument.write(_HtmlTemplates.previewer);

  // Base tag is added so that links will open a new tab and not inside of the iframes
  baseTag = self.previewerIframeDocument.createElement('base');
  baseTag.target = '_blank';
  self.previewerIframeDocument.getElementsByTagName('head')[0].appendChild(baseTag);

  self.previewerIframeDocument.close();

  self.reflow();

  // Insert Base Stylesheet
  _insertCSSLink(self.settings.theme.base, self.iframe, 'theme');

  // Insert Editor Stylesheet
  _insertCSSLink(self.settings.theme.editor, self.editorIframeDocument, 'theme');

  // Insert Previewer Stylesheet
  _insertCSSLink(self.settings.theme.preview, self.previewerIframeDocument, 'theme');

  // Add a relative style to the overall wrapper to keep CSS relative to the editor
  //self.iframe.getElementById('epiceditor-wrapper').style.position = 'relative';

  // Set the position to relative so we hide them with left: -999999px
  self.editorIframe.style.position = 'absolute';
  self.previewerIframe.style.position = 'absolute';

  // Now grab the editor and previewer for later use
  self.editor = self.editorIframeDocument.body;
  self.previewer = self.previewerIframeDocument.getElementById('epiceditor-preview');

  self.editor.contentEditable = true;

  // Firefox's <body> gets all fucked up so, to be sure, we need to hardcode it
  //self.iframe.body.style.height = this.element.offsetHeight + 'px';

  // Should actually check what mode it's in!
  self.previewerIframe.style.left = '-999999px';

  // Keep long lines from being longer than the editor
  this.editorIframeDocument.body.style.wordWrap = 'break-word';

  // FIXME figure out why it needs +2 px
  if (_isIE() > -1) {
    this.previewer.style.height = parseInt(_getStyle(this.previewer, 'height'), 10) + 2;
  }

  // If there is a file to be opened with that filename and it has content...
  this.open(self.settings.file.name);

  if (self.settings.focusOnLoad) {
    // We need to wait until all three iframes are done loading by waiting until the parent
    // iframe's ready state == complete, then we can focus on the contenteditable
    self.iframe.addEventListener('readystatechange', function () {
      if (self.iframe.readyState === 'complete') {
        self.focus();
      }
    });
  }

  // Because IE scrolls the whole window to hash links, we need our own
  // method of scrolling the iframe to an ID from clicking a hash
  self.previewerIframeDocument.addEventListener('click', function (e) {
    let el = e.target,
      body = self.previewerIframeDocument.body;
    if (el.nodeName == 'A') {
      // Make sure the link is a hash and the link is local to the iframe
      if (el.hash && el.hostname == window.location.hostname) {
        // Prevent the whole window from scrolling
        e.preventDefault();
        // Prevent opening a new window
        el.target = '_self';
        // Scroll to the matching element, if an element exists
        if (body.querySelector(el.hash)) {
          body.scrollTop = body.querySelector(el.hash).offsetTop;
        }
      }
    }
  });

  utilBtns = self.iframe.getElementById('epiceditor-utilbar');

  // TODO: Move into fullscreen setup function (_setupFullscreen)
  _elementStates = {};
  self._goFullscreen = function (el) {
    this._fixScrollbars('auto');

    if (self.is('fullscreen')) {
      self._exitFullscreen(el);
      return;
    }

    this.utilPanel.style.display = 'none';

    if (nativeFs) {
      if (nativeFsWebkit) {
        el.webkitRequestFullScreen();
      } else if (nativeFsMoz) {
        el.mozRequestFullScreen();
      } else if (nativeFsW3C) {
        el.requestFullscreen();
      }
    }

    _isInEdit = self.is('edit');

    // Set the state of EE in fullscreen
    // We set edit and preview to true also because they're visible
    // we might want to allow fullscreen edit mode without preview (like a "zen" mode)
    self._eeState.fullscreen = true;
    self._eeState.edit = true;
    self._eeState.preview = true;

    // Cache calculations
    let windowInnerWidth = window.innerWidth,
      windowInnerHeight = window.innerHeight,
      windowOuterWidth = window.outerWidth,
      windowOuterHeight = window.outerHeight;

    // Without this the scrollbars will get hidden when scrolled to the bottom in faux fullscreen (see #66)
    if (!nativeFs) {
      windowOuterHeight = window.innerHeight;
    }

    // This MUST come first because the editor is 100% width so if we change the width of the iframe or wrapper
    // the editor's width wont be the same as before
    _elementStates.editorIframe = _saveStyleState(self.editorIframe, 'save', {
      width: windowOuterWidth / 2 + 'px',
      height: windowOuterHeight + 'px',
      float: 'left', // Most browsers
      cssFloat: 'left', // FF
      styleFloat: 'left', // Older IEs
      display: 'block',
      position: 'static',
      left: ''
    });

    // the previewer
    _elementStates.previewerIframe = _saveStyleState(self.previewerIframe, 'save', {
      width: windowOuterWidth / 2 + 'px',
      height: windowOuterHeight + 'px',
      float: 'right', // Most browsers
      cssFloat: 'right', // FF
      styleFloat: 'right', // Older IEs
      display: 'block',
      position: 'static',
      left: ''
    });

    // Setup the containing element CSS for fullscreen
    _elementStates.element = _saveStyleState(self.element, 'save', {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      'z-index': '9999', // Most browsers
      zIndex: '9999', // Firefox
      border: 'none',
      margin: '0',
      // Should use the base styles background!
      background: _getStyle(self.editor, 'background-color'), // Try to hide the site below
      height: windowInnerHeight + 'px'
    });

    // The iframe element
    _elementStates.iframeElement = _saveStyleState(self.iframeElement, 'save', {
      width: windowOuterWidth + 'px',
      height: windowInnerHeight + 'px'
    });

    if (!nativeFs) {
      document.body.style.overflow = 'hidden';
    }

    self.preview();

    self.focus();

    self.emit('fullscreenenter');
  };

  self._exitFullscreen = function (el) {
    this._fixScrollbars();
    this.utilPanel.style.display = 'block';

    _saveStyleState(self.element, 'apply', _elementStates.element);
    _saveStyleState(self.iframeElement, 'apply', _elementStates.iframeElement);
    _saveStyleState(self.editorIframe, 'apply', _elementStates.editorIframe);
    _saveStyleState(self.previewerIframe, 'apply', _elementStates.previewerIframe);

    // We want to always revert back to the original styles in the CSS so,
    // if it's a fluid width container it will expand on resize and not get
    // stuck at a specific width after closing fullscreen.
    self.element.style.width = self._eeState.reflowWidth ? self._eeState.reflowWidth : '';
    self.element.style.height = self._eeState.reflowHeight ? self._eeState.reflowHeight : '';

    // Put the editor back in the right state
    // TODO: This is ugly... how do we make this nicer?
    // setting fullscreen to false here prevents the
    // native fs callback from calling this function again
    self._eeState.fullscreen = false;

    if (!nativeFs) {
      document.body.style.overflow = 'auto';
    } else {
      if (nativeFsWebkit) {
        document.webkitCancelFullScreen();
      } else if (nativeFsMoz) {
        document.mozCancelFullScreen();
      } else if (nativeFsW3C) {
        document.exitFullscreen();
      }
    }

    if (_isInEdit) {
      self.edit();
    } else {
      self.preview();
    }

    self.reflow();

    self.emit('fullscreenexit');
  };

  // This setups up live previews by triggering preview() IF in fullscreen on keyup
  self.editor.addEventListener('keyup', function () {
    if (keypressTimer) {
      window.clearTimeout(keypressTimer);
    }
    keypressTimer = window.setTimeout(function () {
      if (self.is('fullscreen')) {
        self.preview();
      }
    }, 250);
  });

  fsElement = self.iframeElement;

  // Sets up the onclick event on utility buttons
  utilBtns.addEventListener('click', function (e) {
    let targetClass = e.target.className;
    if (targetClass.indexOf('epiceditor-toggle-preview-btn') > -1) {
      if (self.is('preview')) {
        return;
      }
      self.preview();
    } else if (targetClass.indexOf('epiceditor-toggle-edit-btn') > -1) {
      self.edit();
    } else if (targetClass.indexOf('epiceditor-fullscreen-btn') > -1) {
      self._goFullscreen(fsElement);
    }
  });

  // Sets up the NATIVE fullscreen editor/previewer for WebKit
  if (nativeFsWebkit) {
    document.addEventListener(
      'webkitfullscreenchange',
      function () {
        if (!document.webkitIsFullScreen && self._eeState.fullscreen) {
          self._exitFullscreen(fsElement);
        }
      },
      false
    );
  } else if (nativeFsMoz) {
    document.addEventListener(
      'mozfullscreenchange',
      function () {
        if (!document.mozFullScreen && self._eeState.fullscreen) {
          self._exitFullscreen(fsElement);
        }
      },
      false
    );
  } else if (nativeFsW3C) {
    document.addEventListener(
      'fullscreenchange',
      function () {
        if (document.fullscreenElement == null && self._eeState.fullscreen) {
          self._exitFullscreen(fsElement);
        }
      },
      false
    );
  }

  // TODO: Move utilBar stuff into a utilBar setup function (_setupUtilBar)
  utilBar = self.iframe.getElementById('epiceditor-utilbar');

  // Hide it at first until they move their mouse
  if (self.settings.button.bar !== true) {
    utilBar.style.display = 'none';
  }

  utilBar.addEventListener('mouseover', function () {
    if (utilBarTimer) {
      clearTimeout(utilBarTimer);
    }
  });

  function utilBarHandler(e) {
    if (self.settings.button.bar !== 'auto') {
      return;
    }
    // Here we check if the mouse has moves more than 5px in any direction before triggering the mousemove code
    // we do this for 2 reasons:
    // 1. On Mac OS X lion when you scroll and it does the iOS like "jump" when it hits the top/bottom of the page itll fire off
    //    a mousemove of a few pixels depending on how hard you scroll
    // 2. We give a slight buffer to the user in case he barely touches his touchpad or mouse and not trigger the UI
    if (Math.abs(mousePos.y - e.pageY) >= 5 || Math.abs(mousePos.x - e.pageX) >= 5) {
      utilBar.style.display = 'block';
      // if we have a timer already running, kill it out
      if (utilBarTimer) {
        clearTimeout(utilBarTimer);
      }

      // begin a new timer that hides our object after 1000 ms
      utilBarTimer = window.setTimeout(function () {
        utilBar.style.display = 'none';
      }, 1000);
    }
    mousePos = { y: e.pageY, x: e.pageX };
  }

  // Add keyboard shortcuts for convenience.
  function shortcutHandler(e) {
    if (e.keyCode == self.settings.shortcut.modifier) {
      isMod = true;
    } // check for modifier press(default is alt key), save to var
    if (e.keyCode == 17) {
      isCtrl = true;
    } // check for ctrl/cmnd press, in order to catch ctrl/cmnd + s

    // Check for alt+p and make sure were not in fullscreen - default shortcut to switch to preview
    if (isMod === true && e.keyCode == self.settings.shortcut.preview && !self.is('fullscreen')) {
      e.preventDefault();
      if (self.is('edit') && self._previewEnabled) {
        self.preview();
      } else if (self._editEnabled) {
        self.edit();
      }
    }
    // Check for alt+f - default shortcut to make editor fullscreen
    if (
      isMod === true &&
      e.keyCode == self.settings.shortcut.fullscreen &&
      self._fullscreenEnabled
    ) {
      e.preventDefault();
      self._goFullscreen(fsElement);
    }

    // Set the modifier key to false once *any* key combo is completed
    // or else, on Windows, hitting the alt key will lock the isMod state to true (ticket #133)
    if (isMod === true && e.keyCode !== self.settings.shortcut.modifier) {
      isMod = false;
    }

    // When a user presses "esc", revert everything!
    if (e.keyCode == 27 && self.is('fullscreen')) {
      self._exitFullscreen(fsElement);
    }

    // Check for ctrl + s (since a lot of people do it out of habit) and make it do nothing
    if (isCtrl === true && e.keyCode == 83) {
      self.save();
      e.preventDefault();
      isCtrl = false;
    }

    // Do the same for Mac now (metaKey == cmd).
    if (e.metaKey && e.keyCode == 83) {
      self.save();
      e.preventDefault();
    }
  }

  function shortcutUpHandler(e) {
    if (e.keyCode == self.settings.shortcut.modifier) {
      isMod = false;
    }
    if (e.keyCode == 17) {
      isCtrl = false;
    }
  }

  function pasteHandler(e) {
    let content;
    if (e.clipboardData) {
      //FF 22, Webkit, "standards"
      content = e.clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
      //IE, "nasty"
      content = window.clipboardData.getData('Text');
      content = content.replace(/</g, '&lt;');
      content = content.replace(/>/g, '&gt;');
      content = content.replace(/\n/g, '<br>');
      content = content.replace(/\r/g, ''); //fuck you, ie!
      content = content.replace(/<br>\s/g, '<br>&nbsp;');
      content = content.replace(/\s\s\s/g, '&nbsp; &nbsp;');
      content = content.replace(/\s\s/g, '&nbsp; ');
    }
    if (e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData)) {
      content = (e.originalEvent || e).clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
    }

    // Handle different line endings - convert CRLF (Windows) and single CR (Mac) to LF
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (content) {
      e.preventDefault();
      if (self.editorIframeDocument.queryCommandSupported('insertText')) {
        self.editorIframeDocument.execCommand('insertText', false, content);
      } else {
        if (self.editorIframeDocument.getSelection) {
          const textNode = self.editorIframeDocument.createTextNode(content);
          let range = self.editorIframeDocument.getSelection().getRangeAt(0);
          range.deleteContents();
          range.insertNode(textNode);
          range.selectNodeContents(textNode);
          range.collapse(false);
          let selection = self.editorIframeDocument.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          self.editorIframeDocument.selection.createRange().pasteHTML(content);
        }
      }
    }
  }

  // Hide and show the util bar based on mouse movements
  eventableIframes = [self.previewerIframeDocument, self.editorIframeDocument];

  for (i = 0; i < eventableIframes.length; i++) {
    eventableIframes[i].addEventListener('keyup', function (e) {
      shortcutUpHandler(e);
    });
    eventableIframes[i].addEventListener('keydown', function (e) {
      shortcutHandler(e);
    });
    eventableIframes[i].addEventListener('paste', function (e) {
      pasteHandler(e);
    });
  }

  self.localStorageCorrupted = false;
  // Save the document every 100ms by default
  // TODO: Move into autosave setup function (_setupAutoSave)
  if (self.settings.file.autoSave) {
    self._autoSaveTimer = window.setTimeout(function handler() {
      if (!self._canSave) {
        return;
      }
      //console.log('call autoSave timer', self._autoSaveTimer);
      // Exception from localStorage should kill this timer
      self.save(false, true);
      if (!self.localStorageCorrupted) {
        self._autoSaveTimer = window.setTimeout(handler, self.settings.file.autoSave);
      }
    }, self.settings.file.autoSave);
  }

  // Update a textarea automatically if a textarea is given so you don't need
  // AJAX to submit a form and instead fall back to normal form behavior
  if (self.settings.textarea) {
    self._setupTextareaSync();
  }

  window.addEventListener('resize', function () {
    // If NOT webkit, and in fullscreen, we need to account for browser resizing
    // we don't care about webkit because you can't resize in webkit's fullscreen
    if (self.is('fullscreen')) {
      _applyStyles(self.iframeElement, {
        width: window.outerWidth + 'px',
        height: window.innerHeight + 'px'
      });

      _applyStyles(self.element, {
        height: window.innerHeight + 'px'
      });

      _applyStyles(self.previewerIframe, {
        width: window.outerWidth / 2 + 'px',
        height: window.innerHeight + 'px'
      });

      _applyStyles(self.editorIframe, {
        width: window.outerWidth / 2 + 'px',
        height: window.innerHeight + 'px'
      });
    }
    // Makes the editor support fluid width when not in fullscreen mode
    else if (!self.is('fullscreen')) {
      self.reflow();
    }
  });

  // Set states before flipping edit and preview modes
  self._eeState.loaded = true;
  self._eeState.unloaded = false;

  if (self.is('preview')) {
    self.preview();
  } else {
    self.edit();
  }

  self.iframe.close();
  self._eeState.startup = false;

  if (self.settings.autogrow) {
    self._fixScrollbars();

    boundAutogrow = function () {
      setTimeout(function () {
        self._autogrow();
      }, 1);
    };

    //for if autosave is disabled or very slow
    ['keydown', 'keyup', 'paste', 'cut'].forEach(function (ev) {
      self.getElement('editor').addEventListener(ev, boundAutogrow);
    });

    self.on('__update', boundAutogrow);
    self.on('edit', function () {
      setTimeout(boundAutogrow, 50);
    });
    self.on('preview', function () {
      setTimeout(boundAutogrow, 50);
    });

    //for browsers that have rendering delays
    setTimeout(boundAutogrow, 50);
    boundAutogrow();
  }

  // The callback and call are the same thing, but different ways to access them
  this.utilPanel.style.opacity = '1';
  callback.call(this);
  this.emit('load');
  return this;
};

EpicEditor.prototype._setupTextareaSync = function () {
  let self = this,
    textareaFileName = self.settings.file.name,
    _syncTextarea;

  // Even if autoSave is false, we want to make sure to keep the textarea synced
  // with the editor's content. One bad thing about this tho is that we're
  // creating two timers now in some configurations. We keep the textarea synced
  // by saving and opening the textarea content from the draft file storage.
  self._textareaSaveTimer = window.setInterval(function () {
    if (!self._canSave) {
      return;
    }
    self.save(true);
  }, 100);

  _syncTextarea = function () {
    // TODO: Figure out root cause for having to do this ||.
    // This only happens for draft files. Probably has something to do with
    // the fact draft files haven't been saved by the time this is called.
    // TODO: Add test for this case.
    if (!self.localStorageCorrupted) {
      self._textareaElement.value =
        self.exportFile(textareaFileName, 'text', true) || self.settings.file.defaultContent;
    } else {
      // `paste` event should work without localStorage
      self._textareaElement.value = _getText(self.editor);
    }
  };

  // On page load, if there's content in the textarea that means one of two
  // different things:
  //
  // 1. The editor didn't load and the user was writing in the textarea and
  // now he refreshed the page or the JS loaded and the textarea now has
  // content. If this is the case the user probably expects his content is
  // moved into the editor and not lose what he typed.
  //
  // 2. The developer put content in the textarea from some server side
  // code. In this case, the textarea will take precedence.
  //
  // If the developer wants drafts to be recoverable they should check if
  // the local file in localStorage's modified date is newer than the server.
  if (self._textareaElement.value !== '') {
    self.importFile(textareaFileName, self._textareaElement.value);

    // manually save draft after import so there is no delay between the
    // import and exporting in _syncTextarea. Without this, _syncTextarea
    // will pull the saved data from localStorage which will be <=100ms old.
    self.save(true);
  }

  // Update the textarea on load and pull from drafts
  _syncTextarea();

  // Make sure to keep it updated
  self.on('__update', _syncTextarea);
};

/**
 * Will NOT focus the editor if the editor is still starting up AND
 * focusOnLoad is set to false. This allows you to place this in code that
 * gets fired during .load() without worrying about it overriding the user's
 * option. For example use cases see preview() and edit().
 * @returns {undefined}
 */

// Prevent focus when the user sets focusOnLoad to false by checking if the
// editor is starting up AND if focusOnLoad is true
EpicEditor.prototype._focusExceptOnLoad = function () {
  let self = this;
  if ((self._eeState.startup && self.settings.focusOnLoad) || !self._eeState.startup) {
    self.focus();
  }
};

/**
 * Will remove the editor, but not offline files
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.unload = function (callback) {
  // Make sure the editor isn't already unloaded.
  if (this.is('unloaded')) {
    throw new Error("Editor isn't loaded");
  }

  let self = this,
    editor = window.parent.document.getElementById(self._instanceId);

  editor.parentNode.removeChild(editor);
  self._eeState.loaded = false;
  self._eeState.unloaded = true;
  callback = callback || function () {};

  if (self.settings.textarea) {
    self._textareaElement.value = '';
    self.removeListener('__update');
  }

  if (self._autoSaveTimer) {
    window.clearTimeout(self._autoSaveTimer);
  }
  if (self._textareaSaveTimer) {
    window.clearInterval(self._textareaSaveTimer);
  }

  callback.call(this);
  self.emit('unload');
  return self;
};

/**
 * reflow allows you to dynamically re-fit the editor in the parent without
 * having to unload and then reload the editor again.
 *
 * reflow will also emit a `reflow` event and will return the new dimensions.
 * If it's called without params it'll return the new width and height and if
 * it's called with just width or just height it'll just return the width or
 * height. It's returned as an object like: { width: '100px', height: '1px' }
 *
 * @param {string|null} kind Can either be 'width' or 'height' or null
 * if null, both the height and width will be resized
 * @param {function} callback A function to fire after the reflow is finished.
 * Will return the width / height in an obj as the first param of the callback.
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.reflow = function (kind, callback) {
  console.debug('EpicEditor reflow called');
  let self = this,
    widthDiff = _outerWidth(self.element) - self.element.offsetWidth,
    heightDiff = _outerHeight(self.element) - self.element.offsetHeight,
    elements = [self.iframeElement, self.editorIframe, self.previewerIframe],
    eventData = {},
    newWidth,
    newHeight;

  if (typeof kind === 'function') {
    callback = kind;
    kind = null;
  }

  if (!callback) {
    callback = function () {};
  }

  for (let x = 0; x < elements.length; x++) {
    if (!kind || kind === 'width') {
      newWidth = self.element.offsetWidth - widthDiff + 'px';
      elements[x].style.width = newWidth;
      self._eeState.reflowWidth = newWidth;
      eventData.width = newWidth;
    }
    if (!kind || kind === 'height') {
      newHeight = self.element.offsetHeight - heightDiff;
      if (elements[x] !== self.iframeElement) {
        let utilPanelHeight = Math.max(this.utilPanel.offsetHeight, 30);
        newHeight -= utilPanelHeight;
        console.debug(newHeight, utilPanelHeight);
      }
      newHeight = newHeight + 'px';
      elements[x].style.height = newHeight;
      self._eeState.reflowHeight = newHeight;
      eventData.height = newHeight;
    }
  }

  self.emit('reflow', eventData);
  callback.call(this, eventData);
  return self;
};

/**
 * Will take the markdown and generate a preview view based on the theme
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.preview = function () {
  let self = this,
    x,
    theme = self.settings.theme.preview,
    anchors;

  if (self._fullscreenEnabled) {
    const fullScreenBtn = self.utilPanel.querySelector('.epiceditor-fullscreen-btn');
    fullScreenBtn.style.display = 'none';
  }

  _replaceClass(self.getElement('wrapper'), 'epiceditor-edit-mode', 'epiceditor-preview-mode');

  // Check if no CSS theme link exists
  if (!self.previewerIframeDocument.getElementById('theme')) {
    _insertCSSLink(theme, self.previewerIframeDocument, 'theme');
  } else if (self.previewerIframeDocument.getElementById('theme').name !== theme) {
    self.previewerIframeDocument.getElementById('theme').href = theme;
  }

  // Save a preview draft since it might not be saved to the real file yet
  self.save(true);

  // Add the generated draft HTML into the previewer
  self.previewer.innerHTML = self.exportFile(null, 'html', true);

  // Hide the editor and display the previewer
  if (!self.is('fullscreen')) {
    self.editorIframe.style.left = '-999999px';
    self.previewerIframe.style.left = '';
    self._eeState.preview = true;
    self._eeState.edit = false;
    self._focusExceptOnLoad();
  }

  self.emit('preview');
  return self;
};

/**
 * Helper to focus on the editor iframe. Will figure out which iframe to
 * focus on based on which one is active and will handle the cross browser
 * issues with focusing on the iframe vs the document body.
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.focus = function (pageload) {
  let self = this,
    isPreview = self.is('preview'),
    focusElement = isPreview ? self.previewerIframeDocument.body : self.editorIframeDocument.body;

  if (_isFirefox() && isPreview) {
    focusElement = self.previewerIframe;
  }

  focusElement.focus();
  return this;
};

/**
 * Puts the editor into fullscreen mode
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.enterFullscreen = function () {
  if (this.is('fullscreen')) {
    return this;
  }
  this._goFullscreen(this.iframeElement);
  return this;
};

/**
 * Closes fullscreen mode if opened
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.exitFullscreen = function () {
  if (!this.is('fullscreen')) {
    return this;
  }
  this._exitFullscreen(this.iframeElement);
  return this;
};

/**
 * Hides the preview and shows the editor again
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.edit = function () {
  let self = this;
  _replaceClass(self.getElement('wrapper'), 'epiceditor-preview-mode', 'epiceditor-edit-mode');
  self._eeState.preview = false;
  self._eeState.edit = true;
  self.editorIframe.style.left = '';
  self.previewerIframe.style.left = '-999999px';
  self._focusExceptOnLoad();
  self.emit('edit');
  if (self._fullscreenEnabled) {
    const fullScreenBtn = self.utilPanel.querySelector('.epiceditor-fullscreen-btn');
    fullScreenBtn.style.display = 'block';
  }
  return this;
};

/**
 * Grabs a specificed HTML node. Use it as a shortcut to getting the iframe contents
 * @param   {String} name The name of the node (can be document, body, editor, previewer, or wrapper)
 * @returns {Object|Null}
 */
EpicEditor.prototype.getElement = function (name) {
  let available = {
    container: this.element,
    wrapper: this.iframe.getElementById('epiceditor-wrapper'),
    wrapperIframe: this.iframeElement,
    editor: this.editorIframeDocument,
    editorIframe: this.editorIframe,
    previewer: this.previewerIframeDocument,
    previewerIframe: this.previewerIframe
  };

  // Check that the given string is a possible option and verify the editor isn't unloaded
  // without this, you'd be given a reference to an object that no longer exists in the DOM
  if (!available[name] || this.is('unloaded')) {
    return null;
  } else {
    return available[name];
  }
};

/**
 * Returns a boolean of each "state" of the editor. For example "editor.is('loaded')" // returns true/false
 * @param {String} what the state you want to check for
 * @returns {Boolean}
 */
EpicEditor.prototype.is = function (what) {
  let self = this;
  switch (what) {
    case 'loaded':
      return self._eeState.loaded;
    case 'unloaded':
      return self._eeState.unloaded;
    case 'preview':
      return self._eeState.preview;
    case 'edit':
      return self._eeState.edit;
    case 'fullscreen':
      return self._eeState.fullscreen;
    // TODO: This "works", but the tests are saying otherwise. Come back to this
    // and figure out how to fix it.
    // case 'focused':
    //   return document.activeElement == self.iframeElement;
    default:
      return false;
  }
};

/**
 * Opens a file
 * @param   {string} name The name of the file you want to open
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.open = function (name) {
  let self = this,
    defaultContent = self.settings.file.defaultContent,
    fileObj;
  name = name || self.settings.file.name;
  self.settings.file.name = name;
  if (this._storage[self.settings.localStorageName]) {
    fileObj = self.exportFile(name);
    if (fileObj !== undefined) {
      _setText(self.editor, fileObj);
      self.emit('read');
    } else {
      _setText(self.editor, defaultContent);
      self.save(); // ensure a save
      self.emit('create');
    }
    self.previewer.innerHTML = self.exportFile(null, 'html');
    self.emit('open');
  }
  return this;
};

/**
 * Saves content for offline use
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.save = function (_isPreviewDraft, _isAuto) {
  let self = this,
    storage,
    isUpdate = false,
    file = self.settings.file.name,
    previewDraftName = '',
    data = this._storage[previewDraftName + self.settings.localStorageName],
    content = _getText(this.editor);

  if (_isPreviewDraft) {
    previewDraftName = self._previewDraftLocation;
  }

  // This could have been false but since we're manually saving
  // we know it's save to start autoSaving again
  this._canSave = true;

  // Guard against storage being wiped out without EpicEditor knowing
  // TODO: Emit saving error - storage seems to have been wiped
  if (data) {
    storage = JSON.parse(this._storage[previewDraftName + self.settings.localStorageName]);

    // If the file doesn't exist we need to create it
    if (storage[file] === undefined) {
      storage[file] = self._defaultFileSchema();
    }

    // If it does, we need to check if the content is different and
    // if it is, send the update event and update the timestamp
    else if (content !== storage[file].content) {
      storage[file].modified = new Date();
      isUpdate = true;
    }
    //don't bother autosaving if the content hasn't actually changed
    else if (_isAuto) {
      return;
    }

    storage[file].content = content;

    try {
      this._storage[previewDraftName + self.settings.localStorageName] = JSON.stringify(storage);
    } catch (e) {
      if (isQuotaExceeded(e)) {
        self.localStorageCorrupted = true;
        // At least sync textarea
        self.emit('update');
        // Do not emit `__update` since it's recursively call `.save`
        // but exit condition is never satisfied since localStorage is broken
        self._textareaElement.value = content;
        if (_isAuto) {
          let msg =
            "Local storage is full or corrupted - editor's auto save feature has been disabled.";
          $.jGrowl(msg, { theme: 'warning', position: 'bottom-right', sticky: true });
        }
        return this;
      }
    }

    // After the content is actually changed, emit update so it emits the updated content
    if (isUpdate) {
      self.emit('update');
      // Emit a private update event so it can't get accidentally removed
      self.emit('__update');
    }

    if (_isAuto) {
      this.emit('autosave');
    } else if (!_isPreviewDraft) {
      this.emit('save');
    }
  }

  return this;
};

/**
 * Removes a page
 * @param   {string} name The name of the file you want to remove from localStorage
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.remove = function (name) {
  let self = this,
    s;
  name = name || self.settings.file.name;

  // If you're trying to delete a page you have open, block saving
  if (name == self.settings.file.name) {
    self._canSave = false;
  }

  s = JSON.parse(this._storage[self.settings.localStorageName]);
  delete s[name];
  this._storage[self.settings.localStorageName] = JSON.stringify(s);
  this.emit('remove');
  return this;
};

/**
 * Renames a file
 * @param   {string} oldName The old file name
 * @param   {string} newName The new file name
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.rename = function (oldName, newName) {
  let self = this,
    s = JSON.parse(this._storage[self.settings.localStorageName]);
  s[newName] = s[oldName];
  delete s[oldName];
  this._storage[self.settings.localStorageName] = JSON.stringify(s);
  self.open(newName);
  return this;
};

/**
 * Imports a file and it's contents and opens it
 * @param   {string} name The name of the file you want to import (will overwrite existing files!)
 * @param   {string} content Content of the file you want to import
 * @param   {string} kind The kind of file you want to import (TBI)
 * @param   {object} meta Meta data you want to save with your file.
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.importFile = function (name, content, kind, meta) {
  let self = this,
    isNew = false;

  name = name || self.settings.file.name;
  content = content || '';
  kind = kind || 'md';
  meta = meta || {};

  if (JSON.parse(this._storage[self.settings.localStorageName])[name] === undefined) {
    isNew = true;
  }

  // Set our current file to the new file and update the content
  self.settings.file.name = name;
  _setText(self.editor, content);

  if (isNew) {
    self.emit('create');
  }

  self.save();

  if (self.is('fullscreen')) {
    self.preview();
  }

  //firefox has trouble with importing and working out the size right away
  if (self.settings.autogrow) {
    setTimeout(function () {
      self._autogrow();
    }, 50);
  }

  return this;
};

/**
 * Gets the local filestore
 * @param   {string} name Name of the file in the store
 * @returns {object|undefined} the local filestore, or a specific file in the store, if a name is given
 */
EpicEditor.prototype._getFileStore = function (name, _isPreviewDraft) {
  let previewDraftName = '',
    store;
  if (_isPreviewDraft) {
    previewDraftName = this._previewDraftLocation;
  }
  store = JSON.parse(this._storage[previewDraftName + this.settings.localStorageName]);
  if (name) {
    return store[name];
  } else {
    return store;
  }
};

/**
 * Exports a file as a string in a supported format
 * @param   {string} name Name of the file you want to export (case sensitive)
 * @param   {string} kind Kind of file you want the content in (currently supports html and text, default is the format the browser "wants")
 * @returns {string|undefined}  The content of the file in the content given or undefined if it doesn't exist
 */
EpicEditor.prototype.exportFile = function (name, kind, _isPreviewDraft) {
  let self = this,
    file,
    content;

  name = name || self.settings.file.name;
  kind = kind || 'text';

  file = self._getFileStore(name, _isPreviewDraft);

  // If the file doesn't exist just return early with undefined
  if (file === undefined) {
    return;
  }

  content = file.content;

  switch (kind) {
    case 'html':
      content = _sanitizeRawContent(content);
      return self.settings.parser(content);
    case 'text':
      return _sanitizeRawContent(content);
    case 'json':
      file.content = _sanitizeRawContent(file.content);
      return JSON.stringify(file);
    case 'raw':
      return content;
    default:
      return content;
  }
};

/**
 * Gets the contents and metadata for files
 * @param   {string} name Name of the file whose data you want (case sensitive)
 * @param   {boolean} excludeContent whether the contents of files should be excluded
 * @returns {object} An object with the names and data of every file, or just the data of one file if a name was given
 */
EpicEditor.prototype.getFiles = function (name, excludeContent) {
  let file,
    data = this._getFileStore(name);

  if (name) {
    if (data !== undefined) {
      if (excludeContent) {
        delete data.content;
      } else {
        data.content = _sanitizeRawContent(data.content);
      }
    }
    return data;
  } else {
    for (file in data) {
      if (data.hasOwnProperty(file)) {
        if (excludeContent) {
          delete data[file].content;
        } else {
          data[file].content = _sanitizeRawContent(data[file].content);
        }
      }
    }
    return data;
  }
};

// EVENTS
// TODO: Support for namespacing events like "preview.foo"
/**
 * Sets up an event handler for a specified event
 * @param  {string} ev The event name
 * @param  {function} handler The callback to run when the event fires
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.on = function (ev, handler) {
  let self = this;
  if (!this.events[ev]) {
    this.events[ev] = [];
  }
  this.events[ev].push(handler);
  return self;
};

/**
 * This will emit or "trigger" an event specified
 * @param  {string} ev The event name
 * @param  {any} data Any data you want to pass into the callback
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.emit = function (ev, data) {
  let self = this,
    x;

  data = data || self.getFiles(self.settings.file.name);

  if (!this.events[ev]) {
    return;
  }

  function invokeHandler(handler) {
    handler.call(self, data);
  }

  for (x = 0; x < self.events[ev].length; x++) {
    invokeHandler(self.events[ev][x]);
  }

  return self;
};

/**
 * Will remove any listeners added from EpicEditor.on()
 * @param  {string} ev The event name
 * @param  {function} handler Handler to remove
 * @returns {object} EpicEditor will be returned
 */
EpicEditor.prototype.removeListener = function (ev, handler) {
  let self = this;
  if (!handler) {
    this.events[ev] = [];
    return self;
  }
  if (!this.events[ev]) {
    return self;
  }
  // Otherwise a handler and event exist, so take care of it
  this.events[ev].splice(this.events[ev].indexOf(handler), 1);
  return self;
};

/**
 * Handles autogrowing the editor
 */
EpicEditor.prototype._autogrow = function () {
  let editorHeight;
  let newHeight;
  let minHeight;
  let maxHeight;
  let el;
  let maxedOut = false;

  // autogrow in fullscreen is nonsensical
  if (!this.is('fullscreen')) {
    if (this.is('edit')) {
      el = this.getElement('editor').documentElement;
    } else {
      el = this.previewer;
    }

    console.debug('start autogrow');

    editorHeight = _outerHeight(el);
    if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
      if (this.is('edit')) {
        el = this.getElement('editor');
      } else {
        el = this.getElement('previewer');
      }
      editorHeight = el.body.offsetHeight + 20;
    }
    // Panel could have wrong dimensions if value was
    // retrieved before all css applied to dom. 30px - height in Chrome
    let utilPanelHeight = Math.max(_outerHeight(this.utilPanel), 30);
    newHeight = editorHeight + utilPanelHeight;
    console.debug(`editor height ${editorHeight}. newHeight = ${newHeight}`);

    // handle minimum
    minHeight = this.settings.autogrow.minHeight;
    if (typeof minHeight === 'function') {
      minHeight = minHeight(this);
    }
    if (minHeight) {
      minHeight += utilPanelHeight;
    }
    console.debug(`min height ${minHeight}`);

    if (minHeight && newHeight < minHeight) {
      newHeight = minHeight;
    }

    // handle maximum
    maxHeight = this.settings.autogrow.maxHeight;
    if (typeof maxHeight === 'function') {
      maxHeight = maxHeight(this);
    }
    if (maxHeight) {
      maxHeight += utilPanelHeight;
    }

    if (maxHeight && newHeight > maxHeight) {
      newHeight = maxHeight;
      maxedOut = true;
    }
    console.debug(`new height ${newHeight}`);

    if (maxedOut) {
      this._fixScrollbars('auto');
    } else {
      this._fixScrollbars('hidden');
    }

    // actual resize
    if (newHeight !== this.oldHeight) {
      this.getElement('container').style.height = newHeight + 'px';
      this.reflow();
      if (this.settings.autogrow.scroll) {
        window.scrollBy(0, newHeight - this.oldHeight);
      }
      this.oldHeight = newHeight;
    }
  }
};

/**
 * Shows or hides scrollbars based on the autogrow setting
 * @param {string} forceSetting a value to force the overflow to
 */
EpicEditor.prototype._fixScrollbars = function (forceSetting) {
  let setting;
  if (this.settings.autogrow) {
    setting = 'hidden';
  } else {
    setting = 'auto';
  }
  setting = forceSetting || setting;
  this.getElement('editor').documentElement.style.overflow = setting;
  this.getElement('previewer').documentElement.style.overflow = setting;
};

EpicEditor.version = '0.2.2';

// Used to store information to be shared across editors
EpicEditor._data = {};

if (!self.EpicEditor) {
  self.EpicEditor = EpicEditor;
}
