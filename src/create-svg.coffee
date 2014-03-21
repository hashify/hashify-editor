path = require 'path'

orthogonal = require 'orthogonal'
orthogonal.extend global

{width, height, paths} = require path.resolve process.argv[2]


toXmlAttrs = (attrs) ->
  (" #{k}=\"#{v}\"" for k, v of attrs).join('')


toPathElement = (list) ->
  switch list.length
    when 1
      toPathElement ['#000000', list[0]]
    when 2
      toPathElement [list[0], '1.0', list[1]]
    when 3
      attrs =
        'fill': list[0]
        'fill-opacity': list[1]
        'fill-rule': 'evenodd'
        'd': orthogonal.formatters.svg list[2]

      delete attrs['fill'] if attrs['fill'] is '#000000'
      delete attrs['fill-opacity'] if attrs['fill-opacity'] is '1.0'

      "<path#{toXmlAttrs attrs} />"


svgAttrs =
  xmlns: 'http://www.w3.org/2000/svg'
  version: '1.1'
  width: "#{width}px"
  height: "#{height}px"

process.stdout.write "<svg#{toXmlAttrs svgAttrs}>"
process.stdout.write paths.map(toPathElement).join('')
process.stdout.write '</svg>'
