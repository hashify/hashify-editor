COFFEE = node_modules/.bin/coffee


.PHONY: setup
setup:
	npm install


.PHONY: test
test: test/hashify-editor.css test/hashify-editor.js test/test.js
	test/server


test/test.js: test/test.coffee
	cat $< | $(COFFEE) --compile --stdio > $@


test/%: %
	cp $< $@
