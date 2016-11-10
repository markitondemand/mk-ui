
var fs = require('fs'),
	path = require('path'),
	eventExp = /<event\:([^\:]+)>(.*)<\/event\:\1>/g,
	methodExp = /<method\:([^\:]+)>(.*)<\/method\:\1>/g,
	propertyExp = /<property\:([^\:]+)>(.*)<\/property\:\1>/g,
	paramExp = /<(\w+)>(.*)<\/\1>/g;

function replacer (prop, data, obj) {

	return function (full, name, blob) {

		var start = (prop + name).length + 3;
			first = data.indexOf('<' + prop + ':' + name + '>'),
			last  = data.indexOf('</' + prop + ':' + name + '>');

		params(name, data.substr(first + start, last - first - start), obj);

		return '';
	}
}

function params (name, blob, o) {

	var entry = {name: name},
		blobb = blob.replace(/[\t|\r|\n]/g, '');

	blobb = blobb.replace(paramExp, function (full, param) {

		var start = param.length + 2;
			first = blob.indexOf('<' + param + '>'),
			last  = blob.indexOf('</' + param + '>'),
			value = blob.substr(first + start, last - first - start);

		var formatting = /^([^\w]+)\w/.exec(value);

		if (formatting && formatting.length > 1) {
			value = value.replace(new RegExp(formatting[1], 'g'), '\n');
		}
		entry[param] = value;
	});

	o.push(entry);
}

function parse (data) {

	var c = data.replace(/[\t|\r|\n]/g, ''),
		o = {events: [], properties: [], methods: []};

	c = c.replace(eventExp, replacer('event', data, o.events));
	c = c.replace(methodExp, replacer('method', data, o.methods));
	c = c.replace(propertyExp, replacer('property', data, o.properties));

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
