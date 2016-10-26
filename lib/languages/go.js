var DocsParser = require("../docsparser");
var xregexp = require('../xregexp').XRegExp;

function GoParser(settings) {
    DocsParser.call(this, settings);
}

GoParser.prototype = Object.create(DocsParser.prototype);

GoParser.prototype.setup_settings = function() {
	var identifier = '[a-zA-Z_][a-zA-Z_0-9]*';
    this.settings = {
        'curlyTypes': false,
        'typeInfo': true,
        'typeTag': 'param',
        'varIdentifier': identifier,
        'fnIdentifier': identifier,
        'fnOpener': '\\s*func\\s*',
        'commentCloser': ' */',
        'bool': 'bool',
        'function': 'func'
    };
};

GoParser.prototype.parse_function = function(line) {
	var argsFier = '[a-zA-Z_0-9*\\[\\] ,.]*';
    var regex = xregexp('func\\s*' + // 方法关键字func
	'\\(*' + argsFier + '\\)*\\s*' + // receiver
	'(?P<name>' + this.settings.fnIdentifier + ')'+ // 函数名
	'\\(\\s*' +
	'(?P<args>' + argsFier + ')' + // 参数列表
	'\\s*\\)' +
	'\\s*\\(*\\s*' +
	'(?P<retval>' + argsFier + ')'+ // 结果数组
	'\\)*\\s*[{}]*');

    var matches = xregexp.exec(line, regex);
    if(matches === null || matches.name === undefined) {
        return null;
    }
	return [matches.name, matches.args, matches.retval]
};

GoParser.prototype.parse_args = function(args) {
    return DocsParser.prototype.parse_args.call(this, args);
};

GoParser.prototype.get_arg_type = function(arg) {
	var typeFier = '[a-zA-Z_0-9*\\[\\] ,.]*';
    var regex = new RegExp('.*[ ]'+'('+ typeFier +')');
    var matches = regex.exec(arg) || [];
    var result = (matches[1] || "[type]").replace(/\s+/g, "");
    return result;
};

GoParser.prototype.get_arg_name = function(arg) {
    var regex = new RegExp('(' + this.settings.varIdentifier + ')');
    var matches = regex.exec(arg) || [];
    return matches[1] || "[name]";
};

GoParser.prototype.parse_var = function(line) {
    var regex = xregexp('var\\s+(?P<name>' + this.settings.varIdentifier + ')');

    var matches = xregexp.exec(line, regex);
    if(matches === null || matches.name === undefined) {
        return null;
    }

    var name = matches.name;
    return [name, null, null];
};

GoParser.prototype.get_function_return_type = function(name, retval) {
    return [retval];
};

module.exports = GoParser;
