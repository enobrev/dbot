#@IgnoreInspection BashAddShebang
build:
	php index.php > index.html
	jspm bundle components/App build.js --minify # --inject
	sed -i "s|url[(]jspm|url\(/jspm|g" build.js # make semantic-ui's icon urls absolute rather than relative

dev_bundle:
	jspm bundle 'components/**/*.js - [components/**/*.js] - [components/**/*.css!]' .bundles/dependencies.js
	jspm bundle babel .bundles/babel.js
	sed -i "s|url[(]jspm|url\(/jspm|g" .bundles/dependencies.js # make semantic-ui's icon urls absolute rather than relative

clean:
	rm build.js -Rf
	rm build.js.map -Rf
	rm index.html -Rf
	rm .bundles -Rf