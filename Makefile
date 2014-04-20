COFFEE = node_modules/.bin/coffee
XYZ = node_modules/.bin/xyz --message X.Y.Z --tag X.Y.Z


.PHONY: release-major release-minor release-patch
release-major: LEVEL = major
release-minor: LEVEL = minor
release-patch: LEVEL = patch

release-major release-minor release-patch:
	@$(XYZ) --increment $(LEVEL)


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
