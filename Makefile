COFFEE = node_modules/.bin/coffee
XYZ = node_modules/.bin/xyz --message X.Y.Z --tag X.Y.Z

CSS = $(patsubst src/%,%,$(shell find src -name '*.css'))
IMAGES = $(shell find src/images -name '*.coffee')


.PHONY: all
all: $(CSS)

%.css: tmp/%.sh $(IMAGES)
	'$<' >'$@'

tmp/%.sh: src/%.css
	mkdir -p '$(@D)'
	>'$@'
	@while IFS='' read -r line ; do \
		grep --quiet '^!' <<<"$$line" ; \
		if [ "$$?" = 0 ] ; then \
			sed 's/^!//' <<<"$$line" >>'$@' ; \
		else \
			echo "echo '$$(sed s/\'/\'\\\\\'\'/g <<<"$$line")'" >>'$@' ; \
		fi \
	done <'$<'
	chmod +x '$@'


.PHONY: clean
clean:
	rm -f -- $(CSS)


.PHONY: release-major release-minor release-patch
release-major: LEVEL = major
release-minor: LEVEL = minor
release-patch: LEVEL = patch

release-major release-minor release-patch: tmp/bin/npm
	# Use a dummy npm executable so `npm publish` is a no-op.
	@PATH='tmp/bin:$(PATH)' $(XYZ) --increment $(LEVEL)

tmp/bin/npm:
	mkdir -p '$(@D)'
	>'$@'
	chmod +x '$@'


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
