COFFEE = node_modules/.bin/coffee


.PHONY: release
release:
ifndef VERSION
	$(error VERSION is undefined)
endif
ifneq ($(shell git diff-index --quiet HEAD; echo $$?), 0)
	$(error dirty index)
endif
	sed -i '' 's!\("version": "\)[^"]*\("\)!\1$(VERSION)\2!' bower.json package.json
	git commit --all --message $(VERSION)
	git tag $(VERSION)


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
