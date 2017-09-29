// Copyright (c) 2008, 2009 Andrew Cantino
// Copyright (c) 2008, 2009 Kyle Maxwell

/**
 * Patched to exclude jquery usages.
 * Patched to change className to classList to support svg elements.
 * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/386
 * Patched with a small fix
 * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/786
 */

function DomPredictionHelper() {
};
DomPredictionHelper.prototype = new Object();

DomPredictionHelper.prototype.recursiveNodes = function (e) {
    var n;
    if (e.nodeName && e.parentNode && e != document.body) {
        n = this.recursiveNodes(e.parentNode);
    } else {
        n = new Array();
    }
    n.push(e);
    return n;
};

DomPredictionHelper.prototype.escapeCssNames = function (name) {
    if (name) {
        try {
            return name.replace(/\s*sg_\w+\s*/g, '').replace(/\\/g, '\\\\').
                replace(/\./g, '\\.').replace(/#/g, '\\#').replace(/\>/g, '\\>').replace(/\,/g, '\\,').replace(/\:/g, '\\:');
        } catch (e) {
            console.log('---');
            console.log("exception in escapeCssNames");
            console.log(name);
            console.log('---');
            return '';
        }
    } else {
        return '';
    }
};

DomPredictionHelper.prototype.childElemNumber = function (elem) {
    var count = 0;
    while (elem.previousSibling && (elem = elem.previousSibling)) {
        if (elem.nodeType == 1) count++;
    }
    return count;
};

DomPredictionHelper.prototype.pathOf = function (elem) {
    var nodes = this.recursiveNodes(elem);
    var self = this;
    var path = "";
    for (var i = 0; i < nodes.length; i++) {
        var e = nodes[i];
        if (e) {
            path += e.nodeName.toLowerCase();
            var escaped = e.id && CSS.escape(String(e.id));
            if (escaped && escaped.length > 0) path += '#' + escaped;

            if (e.classList) {
                for (var j = 0; j < e.classList.length; j++) {
                    escaped = CSS.escape(e.classList[j]);
                    if (e.classList[j] && escaped.length > 0) {
                        path += '.' + escaped;
                    }
                }
            }

            path += ':nth-child(' + (self.childElemNumber(e) + 1) + ')';
            path += ' ';
        }
    }
    if (path.charAt(path.length - 1) == ' ') path = path.substring(0, path.length - 1);
    return path;
};

DomPredictionHelper.prototype.commonCss = function (array) {
    try {
        var dmp = new diff_match_patch();
    } catch (e) {
        throw "Please include the diff_match_patch library.";
    }

    if (typeof array == 'undefined' || array.length == 0) return '';

    var existing_tokens = {};
    var encoded_css_array = this.encodeCssForDiff(array, existing_tokens);

    var collective_common = encoded_css_array.pop();

    encoded_css_array.forEach(function(el) {
        var diff = dmp.diff_main(collective_common, el);
        collective_common = '';

        diff.forEach(function(d) {
            if (d[0] == 0) {
                collective_common += d[1];
            }
        });
    });

    return this.decodeCss(collective_common, existing_tokens);
};

DomPredictionHelper.prototype.tokenizeCss = function (css_string) {
    var skip = false;
    var word = '';
    var tokens = [];

    var css_string = css_string.replace(/,/, ' , ').replace(/\s+/g, ' ');
    var length = css_string.length;
    var c = '';

    for (var i = 0; i < length; i++) {
        c = css_string[i];

        if (skip) {
            skip = false;
        } else if (c == '\\') {
            skip = true;
        } else if (c == '.' || c == ' ' || c == '#' || c == '>' || c == ':' || c == ',') {
            if (word.length > 0) tokens.push(word);
            word = '';
        }
        word += c;
        if (c == ' ' || c == ',') {
            tokens.push(word);
            word = '';
        }
    }
    if (word.length > 0) tokens.push(word);
    return tokens;
};

DomPredictionHelper.prototype.decodeCss = function (string, existing_tokens) {
    var inverted = this.invertObject(existing_tokens);
    var out = '';
    var split = string.split('');
    for (var i = 0; i < split.length; i++) {
        out += inverted[split[i]];
    }

    return this.cleanCss(out);
};

// Encode css paths for diff using unicode codepoints to allow for a large number of tokens.
DomPredictionHelper.prototype.encodeCssForDiff = function (strings, existing_tokens) {
    var codepoint = 50;
    var self = this;
    var strings_out = [];
    for (var i = 0; i < strings.length; i++) {
        var out = new String();

        var tokenizeCss = self.tokenizeCss(strings[i]);
        for (var j = 0; j < tokenizeCss.length; j++) {
            var s = tokenizeCss[j];

            if (!existing_tokens[s]) {
                existing_tokens[s] = String.fromCharCode(codepoint++);
            }

            out += existing_tokens[s];
        }

        strings_out.push(out);
    }

    return strings_out;
};

DomPredictionHelper.prototype.simplifyCss = function (css, selected_paths, rejected_paths) {
    var self = this;
    var parts = self.tokenizeCss(css);
    var best_so_far = "";
    if (self.selectorGets('all', selected_paths, css) && self.selectorGets('none', rejected_paths, css)) best_so_far = css;
    for (var pass = 0; pass < 4; pass++) {
        for (var part = 0; part < parts.length; part++) {
            var first = parts[part].substring(0, 1);
            if (self.wouldLeaveFreeFloatingNthChild(parts, part)) continue;
            if ((pass == 0 && first == ':') || // :nth-child
                (pass == 1 && first != ':' && first != '.' && first != '#' && first != ' ') || // elem, etc.
                (pass == 2 && first == '.') || // classes
                (pass == 3 && first == '#')) // ids
            {
                var tmp = parts[part];
                parts[part] = '';
                var selector = self.cleanCss(parts.join(''));
                if (selector == '') {
                    parts[part] = tmp;
                    continue;
                }
                if (self.selectorGets('all', selected_paths, selector) && self.selectorGets('none', rejected_paths, selector)) {
                    best_so_far = selector;
                } else {
                    parts[part] = tmp;
                }
            }
        }
    }
    return self.cleanCss(best_so_far);
};

DomPredictionHelper.prototype.wouldLeaveFreeFloatingNthChild = function (parts, part) {
    return (((part - 1 >= 0 && parts[part - 1].substring(0, 1) == ':') &&
    (part - 2 < 0 || parts[part - 2] == ' ') &&
    (part + 1 >= parts.length || parts[part + 1] == ' ')) ||
    ((part + 1 < parts.length && parts[part + 1].substring(0, 1) == ':') &&
    (part + 2 >= parts.length || parts[part + 2] == ' ') &&
    (part - 1 < 0 || parts[part - 1] == ' ')));
};

DomPredictionHelper.prototype.cleanCss = function (css) {
    return css.replace(/\>/, ' > ').replace(/,/, ' , ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/,$/, '');
};

DomPredictionHelper.prototype.getPathsFor = function (arr) {
    var self = this;
    var out = [];

    for (var i = 0; i < arr.length; i++) {
        var s = arr[i];

        if (s && s.nodeName) {
            out.push(self.pathOf(s));
        }
    }

    return out;
};

DomPredictionHelper.prototype.predictCss = function (s, r) {
    var self = this;

    if (s.length == 0) return '';
    var selected_paths = self.getPathsFor(s);
    var rejected_paths = self.getPathsFor(r);

    var css = self.commonCss(selected_paths);
    var simplest = self.simplifyCss(css, selected_paths, rejected_paths);

    // Do we get off easy?
    if (simplest.length > 0) return simplest;

    // Okay, then make a union and possibly try to reduce subsets.
    var union = '';
    for (var i = 0; i < s.length; i++) {
        union = self.pathOf(s[i]) + ", " + union;
    }

    union = self.cleanCss(union);

    return self.simplifyCss(union, selected_paths, rejected_paths);
};

DomPredictionHelper.prototype.fragmentSelector = function (selector) {
    var self = this;
    var out = [];
    var split = selector.split(/\,/);

    for (var i = 0; i < split.length; i++) {
        var out2 = [];
        var splitInner = self.cleanCss(split[i]).split(/\s+/);

        for (var j = 0; j < splitInner.length; j++) {
            out2.push(self.tokenizeCss(splitInner[j]));
        }

        out.push(out2);
    }

    return out;
};

// Everything in the first selector must be present in the second.
DomPredictionHelper.prototype.selectorBlockMatchesSelectorBlock = function (selector_block1, selector_block2) {
    for (var j = 0; j < selector_block1.length; j++) {
        if (selector_block2.indexOf(selector_block1[j]) == -1) {
            return false;
        }
    }
    return true;
};

// Assumes list is an array of complete CSS selectors represented as strings.
DomPredictionHelper.prototype.selectorGets = function (type, list, the_selector) {
    var self = this;
    var result = true;

    if (list.length == 0 && type == 'all') return false;
    if (list.length == 0 && type == 'none') return true;

    var selectors = self.fragmentSelector(the_selector);

    var cleaned_list = [];
    for (var i = 0; i < list.length; i++) {
        cleaned_list.push(self.fragmentSelector(list[i])[0]);
    }

    for (var j = 0; j < selectors.length; j++) {
        if (!result) return;
        var selector = selectors[j];

        for (var k = 0; k < cleaned_list.length; k++) {
            if (!result || cleaned_list[k] == '') return;

            if (self._selectorGets(cleaned_list[k], selector)) {
                if (type == 'none') result = false;
                cleaned_list[k] = '';
            }
        }
    }

    if (type == 'all' && cleaned_list.join('').length > 0) { // Some candidates didn't get matched.
        result = false;
    }

    return result;
};

DomPredictionHelper.prototype._selectorGets = function (candidate_as_blocks, selector_as_blocks) {
    var cannot_match = false;
    var position = candidate_as_blocks.length - 1;
    for (var i = selector_as_blocks.length - 1; i > -1; i--) {
        if (cannot_match) break;
        if (i == selector_as_blocks.length - 1) { // First element on right.
            // If we don't match the first element, we cannot match.
            if (!this.selectorBlockMatchesSelectorBlock(selector_as_blocks[i], candidate_as_blocks[position])) cannot_match = true;
            position--;
        } else {
            var found = false;
            while (position > -1 && !found) {
                found = this.selectorBlockMatchesSelectorBlock(selector_as_blocks[i], candidate_as_blocks[position]);
                position--;
            }
            if (!found) cannot_match = true;
        }
    }
    return !cannot_match;
};

DomPredictionHelper.prototype.invertObject = function (object) {
    var new_object = {};

    for(var key in object) {
        var value = object[key];
        new_object[value] = key;
    }

    return new_object;
};

DomPredictionHelper.prototype.cssToXPath = function (css_string) {
    var tokens = this.tokenizeCss(css_string);
    if (tokens[0] && tokens[0] == ' ') tokens.splice(0, 1);
    if (tokens[tokens.length - 1] && tokens[tokens.length - 1] == ' ') tokens.splice(tokens.length - 1, 1);

    var css_block = [];
    var out = "";

    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i] == ' ') {
            out += this.cssToXPathBlockHelper(css_block);
            css_block = [];
        } else {
            css_block.push(tokens[i]);
        }
    }

    return out + this.cssToXPathBlockHelper(css_block);
};

// Process a block (html entity, class(es), id, :nth-child()) of css
DomPredictionHelper.prototype.cssToXPathBlockHelper = function (css_block) {
    if (css_block.length == 0) return '//';
    var out = '//';
    var first = css_block[0].substring(0, 1);

    if (first == ',') return " | ";

    if (first == ':' || first == '#' || first == '.') {
        out += '*';
    }

    var expressions = [];
    var re = null;

    for (var i = 0; i < css_block.length; i++) {
        var current = css_block[i];
        first = current.substring(0, 1);
        var rest = current.substring(1);

        if (first == ':') {
            // We only support :nth-child(n) at the moment.
            if (re = rest.match(/^nth-child\((\d+)\)$/))
                expressions.push('(((count(preceding-sibling::*) + 1) = ' + re[1] + ') and parent::*)');
        } else if (first == '.') {
            expressions.push('contains(concat( " ", @class, " " ), concat( " ", "' + rest + '", " " ))');
        } else if (first == '#') {
            expressions.push('(@id = "' + rest + '")');
        } else if (first == ',') {
        } else {
            out += current;
        }
    }

    if (expressions.length > 0) out += '[';
    for (var i = 0; i < expressions.length; i++) {
        out += expressions[i];
        if (i < expressions.length - 1) out += ' and ';
    }
    if (expressions.length > 0) out += ']';
    return out;
};

