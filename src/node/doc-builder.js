
var fs = require('fs'),
	path = require('path'),
	valueExp = /<([^\:]+)>([^<]+)<\/\1>/g;

function getExpression (tag) {
	return new RegExp('<' + tag + '\\:([^\\:]+)>([^\\#\\$\\@]+)<\\/' + tag + '\\:\\1>', 'g');
}

function replacer (prop, blob, obj) {

	return function (full, name) {

		var start = (prop + name).length + 3;
			first = blob.indexOf('<' + prop + ':' + name + '>'),
			last  = blob.indexOf('</' + prop + ':' + name + '>'),
			index = first + start,
			count = last - first - start;

		return values(prop, name, blob.substr(index, count), obj);
	}
}

function params (name, blob, entry) {

	entry.params = [];

	blob = blob.replace(
		getExpression('param'),
		replacer('param', blob, entry.params));

	return blob;
}

function values (prop, name, blob, o) {

	var entry = {name: name};

	if (prop === 'method') {

		entry.params = [];

		blob = blob.replace(
			getExpression('param'),
			replacer('param', blob, entry.params));
	}

	blob = blob.replace(valueExp, function (full, param, capture) {

		var start = param.length + 2;
			first = blob.indexOf('<' + param + '>'),
			last  = blob.indexOf('</' + param + '>'),
			value = blob.substr(first + start, last - first - start),
			formatting = /^([\r|\t|\n]+)\w/.exec(value);

		if (formatting && formatting.length > 1) {
			value = value.replace(new RegExp(formatting[1], 'g'), '\n');
		}
		entry[param] = value;

		return '';
	});

	o.push(entry);

	return blob;
}

function parse (data) {

	var o = {
		events: [],
		properties: [],
		methods: [],
		depedencies: [],
		files: []
	};

	data = data.replace(
		getExpression('depedency'),
		replacer('depedency', data, o.depedencies)
	);

	data = data.replace(
		getExpression('file'),
		replacer('file', data, o.files)
	);

	data = data.replace(
		getExpression('event'),
		replacer('event', data, o.events));

	data = data.replace(
		getExpression('property'),
		replacer('property', data, o.properties));

	data = data.replace(
		getExpression('method'),
		replacer('method', data, o.methods));

	return o;
}

module.exports = {

	parse: function (file, fn) {

		fs.readFile(
			path.join(__dirname, '../', file),
			{encoding: 'utf-8'},
			function (err, data) {

				if (err) {
					fn({error: err, message: 'unable to parse file'});
					return;
				}

				fn(parse(data));
		});
	}
};
