/**
 * Created by Edward on 10/29/2016.
 */


/**
 * extend a prototype method 'filterBy' for Array
 * @param field String, field expression, can be nested fields with format like: 'x' or 'x.y.z' or 'x.y[].z'. '[]' stands for array field, field should not end with array field.
 * @param value Object, expected value for specific field. if skipNull=true, then null/empty value will skip filter and return full array.
 * @param skipNull Boolean, if true, then skip filter array when value is null/empty then return full array.
 * @returns {*} []
 */
Array.prototype.filterBy = function (field, value, skipNull) {
    if (!field)
        throw "'field' cannot be not or empty";
    if (typeof(field) !== 'string')
        throw "'field' can only be String type";

    // parse out valid nested fields
    var fields = field.split('.').filter(function (s) {
        return s;
    });

    if (fields.length == 0 || fields[fields.length - 1].endsWith('[]'))
        throw "'field' is invalid, should be like 'x' or 'x.y.z' or 'x.y[].z' format, and should not end with [].";

    // if null value, and skipNull=true, return original array without filtered.
    if (skipNull === true && !value)
        return this;
    // clone it to protect original array from been modified while .map.
    var clone = JSON.parse(JSON.stringify(this));
    // because nested array filter with change array item itself, so here use '.map' but not '.filter'.
    return clone.map(function (item) {
        var isMatch = false;
        var obj = item;
        for (var i = 0; i < fields.length; i++) {
            if (obj) {
                var f = fields[i];
                if (f.endsWith('[]')) {
                    f = f.substr(0, f.length - 2);
                    obj = obj[f];
                    // is array as expected
                    if (Array.isArray(obj)) {
                        // pass spare-fields string to nested array
                        var sparedFields = fields.filter(function (v, x) {
                            return x > i;
                        }).join('.');
                        // record used fileds
                        var usedFields = fields.filter(function (val, idx) {
                            return idx < i;
                        });

                        var nestedArr = obj.filterBy(sparedFields, value, skipNull);
                        //if nested array matches more than one item, then it matches.
                        isMatch = nestedArr.length > 0;
                        if (isMatch) {
                            // and current array field
                            usedFields.push(f);

                            var exp = 'item';
                            usedFields.forEach(function (uf) {
                                exp += '[\'' + uf + '\']';
                            });
                            // eval 'item[x][y][z] = array' expression, yes, should update item itself.
                            eval(exp + '=nestedArr');
                        }
                        break;
                    }
                    // is null, break! (because [] should only at non-ending field, so it cannot be null for further field access.)
                    // or is other type value, break! not match.
                    break;
                } else {
                    obj = obj[f];
                }
            } else {
                // item is null, break any further match test.
                if (i === 0) {
                    break;
                }
                // lastValue is null, match if skipNull or value is null as expected.
                else if (i === fields.length - 1) {
                    isMatch = skipNull || value === obj;
                }
                // not all nested fields queried, not match
                else {
                    isMatch = false;
                }
            }

            if (i === fields.length - 1) {
                isMatch = value === obj;
            }
        }

        if (isMatch) {
            return item;
        }
    }).filter(function (i) {
        // filter out these valid items
        return i;
    });
};

/**  detect if a String ends with specific 'str' */
String.prototype.endsWith = function (str) {
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex !== -1) && (lastIndex + str.length === this.length);
};

/** test cases */

function Region(id, countries, president) {
    this.regionId = id;
    this.countries = countries || [];
    this.regionalPresident = president;
}

function Country(id, states, president) {
    this.countryId = id;
    this.states = states || [];
    this.countryPresident = president;
}

function State(id, president) {
    this.stateId = id;
    this.statePresident = president;
}

function President(name, term) {
    this.name = name;
    this.term = term || 4;
}

var presidentA = new President('Adam', 2);
var presidentB = new President('Bob', 4);
var presidentC = new President('Clinton', 6);
var presidentD = new President('Daniel', 8);

var stateA = new State('SA', presidentA);
var stateB = new State('SB', presidentA);
var stateC = new State('SC', presidentB);
var stateD = new State('SD', presidentB);

var countryA = new Country('CA', [stateA, stateB], presidentC);
var countryB = new Country('CB', [stateC, stateD], presidentC);

var region = new Region('RA', [countryA, countryB], presidentD);

var case1 = "[countryA, countryB].filterBy('countryId', 'CA')";
var case2 = "[countryA, countryB].filterBy('countryId', '')";
var case3 = "[countryA, countryB].filterBy('countryId', undefined || null, true)";
var case4 = "[region].filterBy('countries[].countryId', 'CB')";
var case5 = "[region].filterBy('countries[].countryId', 'CB').filterBy('regionalPresident.name', 'Daniel')";
var case6 = "[region].filterBy('countries[].countryId', 'CB').filterBy('countries[].states[].stateId', 'SD')";
var case7 = "[region].filterBy('countries[].countryId', 'CB').filterBy('countries[].states[].statePresident.term', 4)";
var case8 = "[region].filterBy('nothing[].at.all', 'CB').filterBy('are[].you[].kidding.me', 4)";
var case9 = "[region].filterBy('countries[].states[]', 'SD')";
var case10 = "[region].filterBy( null || undefined || '' || {} || [] || 1, 'SD')";

logEval(case1);
logEval(case2);
logEval(case3);
logEval(case4);
logEval(case5);
logEval(case6);
logEval(case7);
logEval(case8);
logEval(case9);
logEval(case10);

function logEval(expression) {
    console.info(expression);
    // console.log(eval(expression));
    console.log(JSON.stringify(eval(expression)));
}

/** end of test cases*/

