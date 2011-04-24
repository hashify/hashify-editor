/*
/*  ###   ###
/*  ###   ###  Hashify Editor
/*  #########  ==============
/*  #########
/*  ###   ###  Turn any textarea into a Markdown editor,
/*  ###   ###  with one-click previewing via hashify.me.
/*
/*  https://github.com/hashify/hashify-editor
*/

;(function (window, undef) {

  var

    Hashify,

    _ = function (text) {
      return text.replace(/✪/g, '☺');
    },

    ____ = '    ',

    dashes = '- - -',

    classNamePrefix = 'hashify-editor',

    nativeBind = Function.prototype.bind,

    slice = Array.prototype.slice,

    // Curry-free binding. Borrows heavily from the `_.bind` function
    // in [Underscore.js](http://documentcloud.github.com/underscore/).
    bind = function (func, obj) {
      if (nativeBind) {
        return nativeBind.apply(func, slice.call(arguments, 1));
      }
      return function () {
        return func.apply(obj, slice.call(arguments));
      };
    },

    createButton_ = function (text, identifier, handler) {
      var
        a = document.createElement('a'),
        li = document.createElement('li');

      a.href = '#' + text.toLowerCase().replace(/ /g, '-');
      a.className = classNamePrefix + '-' + identifier;
      a.innerHTML = text;
      a.onclick = handler;
      li.appendChild(a);
      this.appendChild(li);
      return a;
    },

    heading_ = function () {
      var
        increment, len, matches, offset = 0, start, text,
        selection = new Selection(this, '(#+)[ \\t]*', '# ');

      selection.text = selection.text.replace(/\s+/g, ' ');

      if (matches = selection.beforeRegex.exec(selection.before)) {
        selection.before =
          selection.before.replace(
            selection.beforeRegex, matches[1].length < 4? '$1# ': '');
      }
      else if (matches = selection.textRegex.exec(/^.*$/m.exec(selection.text)[0])) {
        len = matches[1].length;
        if (increment = len < 4) {
          offset = len + 2; // '# '.length === 2
        }
        selection.text =
          selection.text.replace(selection.textRegex, increment? '$1# ': '');
      }
      else {
        selection.blockify().prefix();
        offset = selection.prefix0.length;
      }
      start = selection.before.length;
      text = selection.text;
      this.set(
        selection.before + text + selection.after,
        start + offset,
        start + text.length
      );
      return false;
    },

    keypress_ = function (event) {
      event || (event = window.event);
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      var
        chr = String.fromCharCode(event.charCode),
        selection = new Selection(this),
        before = selection.before,
        after = selection.after,
        text = selection.text,
        position = before.length + 1;

      if (/[`_*]/.test(chr)) {
        if (text) {
          this.set(selection.wrap(chr));
          return false;
        }
        switch (chr) {
          case '`':
            if (
              text =
                /^`/.test(after)?
                  null:
                  /^\w/.test(after) ||
                  // If the preceding portion of the line contains an
                  // odd number of backticks, insert just one backtick.
                  /(?:^|\n|\r)(?:[^`]*`[^`]*`)*[^`]*`[^`]*$/.test(before)?
                    '`':
                    '``'
            ) this.set(before + text + after);
            break;
          case '_':
            if (
              text = (
                (/^__/.test(after) || /^_/.test(after) && /_$/.test(before))?
                  null:
                  /__$/.test(before)?
                    '_':
                    /(^|[^_])_[^_]+\b$/.test(before)?
                      /^_/.test(after)?'':'_':
                      /^\w/.test(after)?'_':'__'
              )
            ) this.set(before + text + after);
            break;
          case '*':
            return;
        }
        this.el.setSelectionRange(position, position);
        event.preventDefault();
      }
      else if (text && chr === '#') {
        bind(heading_, this)();
        event.preventDefault();
      }
    },

    resolve_ = function (reSelection, reBefore, reAfter, open, close) {
      var
        openLen = open.length,
        selection = new Selection(this),
        before = selection.before,
        after = selection.after,
        start = before.length,
        text = selection.text,
        len = text.length;

      close || (close = open);

      this.set(
        reSelection.test(text)?
          (len -= openLen + close.length, before + text.substr(openLen, len) + after):
          reAfter.test(after) && reBefore.test(before)?
            (start -= openLen, before.substr(0, start) + text + after.substr(close.length)):
            (start += openLen, before + open + text + close + after),
        start,
        start + len
      );
      return false;
    };

  function Selection(editor, re, prefix, prefix0) {
    var
      el    = editor.el,
      value = (this.value = el.value),
      start = (this.start = el.selectionStart),
      end   = (this.end   = el.selectionEnd);

    this.editor = editor;

    this.textRegex   = new RegExp('^' + re);
    this.beforeRegex = new RegExp('^' + re + '$', 'm');

    this.prefix_ = prefix;
    this.prefix0 = prefix0 || prefix;

    this.before = value.substr(0, start);
    this.after = value.substr(end);
    this.text = value.substring(start, end);
  }

  Selection.prototype.wrap = function (chr) {
    var
      text = this.text,
      len = text.length,
      position = this.before.length + 1,
      value = (
        function () {
          var re = new RegExp('^([' + chr + ']{0,2}).*\\1$');
          switch (re.exec(text)[1].length) {
            case 0:
              re = new RegExp('([' + chr + ']{0,2})✪\\1');
              switch (re.exec(_(this.before) + '✪' + _(this.after))[1].length) {
                case 0:
                case 1: return [this.before, text, this.after].join(chr);
                case 2: return this.before.substr(0, position -= 3) + text + this.after.substr(2);
              }
            case 1:
              len -= 2; position += 1;
              return [this.before, text, this.after].join(chr);
            case 2:
              len -= 4; position -= 1;
              return this.before + text.substr(2, len) + this.after;
          }
        }.call(this)
      );
    this.editor.set(value, position, position + len);
    return value;
  };

  Selection.prototype.blockify = function () {
    var
      b = this.before,
      a = this.after;

    /((\r?\n){2}|^\s*)$/.test(b) || (this.before = b.replace(/\s*$/, '\n\n'));
    /^((\r?\n){2}|\s*$)/.test(a) || (this.after  = a.replace(/^\s*/, '\n\n'));

    return this;
  };

  Selection.prototype.prefix = function () {
    var index = 0, that = this;
    this.text = (
      this.text.replace(
        /^.*$/gm,
        function (match) {
          return (index++? that.prefix_: that.prefix0) + match;
        }
      )
    );
  };

  Selection.prototype.unprefix = function () {
    var index = 0, that = this;
    this.text = (
      this.text.replace(
        /^.*$/gm,
        function (match) {
          return match.replace(index++? that.prefix_: that.prefix0, '');
        }
      )
    );
  };

  Selection.prototype.render = function () {
    var
      matches = this.beforeRegex.exec(this.before),
      offset = 0, start, text, value;

    if (matches) {
      this.before = this.before.replace(this.beforeRegex, '');
      this.unprefix();
    }
    else if (matches = this.textRegex.exec(/^.*$/m.exec(this.text)[0])) {
      this.unprefix();
    }
    else {
      this.blockify().prefix();
      offset = this.prefix0.length;
    }
    start = this.before.length;
    text = this.text;
    value = this.before + text + this.after;
    this.editor.set(value, start + offset, start + text.length);
    return value;
  };

  function Editor(id) {
    this.el =
      typeof id === 'string'?
        document.getElementById(id):
        id; // assume `id` to be a DOM node
  }

  Editor.prototype.set = function (text, start, end) {
    var
      el = this.el,
      position = text.length - 1,
      charCode = text.charCodeAt(position);

    if (0xD800 <= charCode && charCode < 0xDC00) {
      // In Chrome, if one attempts to delete a surrogate
      // pair character, only half of the pair is deleted.
      // We strip the orphan to avoid `encodeURIComponent`
      // throwing a `URIError`.
      text = text.substr(0, position);
    }
    // Firefox and its ilk reset `scrollTop` whenever we assign
    // to `editor.value`. To preserve scroll position we record
    // the offset before assignment and reinstate it afterwards.
    position = el.scrollTop;
    el.value = text;
    el.scrollTop = position;

    if (start !== undef) {
      el.setSelectionRange(start, end);
    }
    el.focus();
  };

  Hashify = window.Hashify = {

    encode: function (text) {
      return window.btoa(window.unescape(encodeURIComponent(text)));
    },

    decode: function (text) {
      return decodeURIComponent(window.escape(window.atob(text)));
    },

    editor: function (id) {
      var
        container,
        createButton,
        editor = new Editor(id),
        el = editor.el,
        preview,
        resolve,
        toolbar;

      el.onkeypress = bind(keypress_, editor);

      toolbar = document.createElement('ul');
      toolbar.className = classNamePrefix + '-toolbar';
      createButton = bind(createButton_, toolbar);

      resolve = bind(resolve_, editor);

      createButton(
        'Strong',
        'strong',
        function () {
          return resolve(
            /^(__|\*\*).*\1$/,
            /(__|\*\*)$/, /^(__|\*\*)/,
            '**'
          );
        }
      );
      createButton(
        'Emphasis',
        'em',
        function () {
          var
            selection = new Selection(editor),
            before = selection.before,
            after = selection.after,
            start = before.length,
            text = selection.text,
            len = text.length;

          editor.set(
            /^([_*]).*\1$/.test(text)?
              (len -= 2, before + text.substr(1, len) + after):
              /([_*])✪\1/.test(_(before) + '✪' + _(after))?
                (--start, before.substr(0, start) + text + after.substr(1)):
                (++start, [before, text, after].join('_')),
            start,
            start + len
          );
          return false;
        }
      );
      createButton(
        'Image',
        'img',
        function () {
          return resolve(
            /^!\[.*\]\(http:\/\/\)$/,
            /!\[$/, /^\]\(http:\/\/\)/,
            '![', '](http://)'
          );
        }
      );
      createButton(
        'Hyperlink',
        'a',
        function () {
          return resolve(
            /^\[.*\]\(http:\/\/\)$/,
            /\[$/, /^\]\(http:\/\/\)/,
            '[', '](http://)'
          );
        }
      );
      createButton(
        'Blockquote',
        'blockquote',
        function () {
          editor.set(new Selection(editor, ' {0,3}>[ \\t]*', '> ').render());
          return false;
        }
      );
      createButton(
        'Code Sample',
        'pre-code',
        function () {
          editor.set(new Selection(editor, '( {4}|\t)', ____).render());
          return false;
        }
      );
      createButton(
        'Numbered List',
        'ol',
        function () {
          editor.set(new Selection(editor, ' {0,3}\\d+[.][ \\t]*', ____, ' 1. ').render());
          return false;
        }
      );
      createButton(
        'Bulleted List',
        'ul',
        function () {
          editor.set(new Selection(editor, ' {0,3}[*+-][ \\t]*', ____, '  - ').render());
          return false;
        }
      );
      createButton(
        'Heading',
        'h1',
        bind(heading_, editor)
      );
      createButton(
        'Horizontal Rule',
        'hr',
        function () {
          var
            selection = new Selection(editor).blockify(),
            before = selection.before,
            start = before.length,
            text = selection.text === dashes? '': dashes;

          editor.set(
            before + text + selection.after,
            start,
            start + text.length
          );
          return false;
        }
      );
      preview = document.createElement('a');
      preview.href = '#preview';
      preview.className = classNamePrefix + '-preview';
      preview.innerHTML = 'Preview at hashify.me';
      preview.onclick = function () {
        window.open(
          'http://hashify.me/' + Hashify.encode(el.value),
          'hashify.me'
        );
        return false;
      };
      container = el.parentNode;
      container.insertBefore(preview, el.nextSibling);
      container.insertBefore(toolbar, el.nextSibling);
      container.className =
        (container.className? ' ': '') + classNamePrefix;
    }

  };

}(window));
