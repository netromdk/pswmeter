all:
	grunt compile

install:
	sudo npm install
	sudo npm install -g grunt-cli

clean:
	find . -iname '*~' | xargs rm -fv
