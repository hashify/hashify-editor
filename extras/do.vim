if exists('b:current_syntax')
  finish
endif

let b:current_syntax = 'do'

syntax match String  '.\+$'
syntax match Number  '^\([ ]\?[^ ]\)\+'
syntax match PreProc '^\([ ]\?[^ ]\)\+$'
syntax match Comment '^\/\/.*$'
