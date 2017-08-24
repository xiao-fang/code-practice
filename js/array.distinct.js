Array.prototype.distinct = function (fields, ignoreCase) {
    var uniqueKey = "__unique__key";
    var clone = JSON.parse(JSON.stringify(this));

    function extendUniqueKey(obj, fields) {
        if (obj) {
            var o = {}, keys = (Array.isArray(fields) && fields.length > 0) ? fields : Object.getOwnPropertyNames(obj).sort();
            keys.forEach(function (k) {
                if (obj.hasOwnProperty(k)) {
                    o[k] = obj[k];
                }
            });
            obj[uniqueKey] = JSON.stringify(o).toLowerCase();
        }
    }

    function removeUniqueKey(obj) {
        if (obj && obj[uniqueKey]) {
            delete obj[uniqueKey];
        }
    }

    function distinctNonObjArray(arr) {
        return arr.filter(function (itm, idx, self) {
            return self.indexOf(itm) == idx;
        });
    }

    if (Array.isArray(array)) {
        var obj = {}, results = [];
        array.forEach(function (itm) {
            extendUniqueKey(itm, fields);
        });

        array.forEach(function (itm) {
            obj[itm[uniqueKey]] = itm;
        });

        for (var k in obj) {
            var itm = obj[k];
            if (itm && itm.hasOwnProperty(uniqueKey)) {
                removeUniqueKey(itm);
                results.push(itm);
            }
        }
        return results;
    }
    return array;
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

