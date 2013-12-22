Hashify.editor 'editor'

$console = $('#console')
$editor = $('#editor').focus()

# Cache value provided by "keypress" event for use by "keyup" handler.
charCode = null
$editor.keypress (event) -> charCode = event.which

b = (text) ->
  $div = $('<div>').append $('<b>').text text
  $div.html()

logResult = (actual, expected) ->
  $result = $('<span class=result>')
  if actual is expected
    $result.addClass 'pass'
    $result.html "value is #{ b expected } as expected"
  else
    $result.addClass 'fail'
    $result.html "expected #{ b expected } not #{ b actual }"
  $console.children().last().append($result)

$.get 'tests', (tests) ->
  tests = tests.split '\n'
  initialize = yes # next significant line represents initial state?
  next = ->
    line = tests.shift()
    return unless line?
    return do next unless line.indexOf '//'
    if /^\s*$/.test line
      initialize = yes
      do next
    else if initialize
      initialize = no
      start = line.indexOf '|'
      value = line.substr 0, start
      other = line.substr start + 1
      idx = other.lastIndexOf '|'
      if idx is -1
        value += other
      else
        value += other.substr 0, idx
        value += other.substr idx + 1
      $editor.val value
      $editor[0].setSelectionRange start, Math.max start, start + idx
      if $console.children().last().html()
        # Insert a blank line only if the previous line is *not* blank.
        # This allows consecutive blank lines to be used in the source
        # file without consecutive blank lines appearing in the output.
        $console.append '<li>'
        $console.scrollTop 9e9
      do next
    else
      [match, input, expected] = /^(.+?)[ ]{2,}(.+)$/.exec line
      $console.append "<li><span class=prompt>type #{ b input }</span></li>"
      $console.scrollTop 9e9
      idx = input.length - 1
      lastChar = input.charAt idx
      lastCharCode = input.charCodeAt idx
      count = 1 # the number of times the last character must be typed
      while idx-- then count += 1 if input.charAt(idx) is lastChar
      listener = (event) ->
        # `charCode` is set by the "keypress" handler, which isn't
        # triggered when the shift key (16) is pressed in isolation.
        # This action would effectively repeat the last registered
        # keystroke were it allowed to do so.
        return if event.which is 16 or charCode isnt lastCharCode or count -= 1
        $editor.off 'keyup', listener
        logResult $editor.val(), expected
        do next
      $editor.on 'keyup', listener
  do next
