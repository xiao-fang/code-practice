## Array.prototype.filterBy

> extend a prototype method 'filterBy' for Array
> by Edward


``` javascript
/**
    * extend a prototype method 'filterBy' for Array
    * @param field String, field expression, can be nested fields with format like: 'x' or 'x.y.z' or 'x.y[].z'. '[]' stands for array field, field should not end with array field.
    * @param value Object, expected value for specific field. if skipNull=true, then null/empty value will skip filter and return full array.
    * @param skipNull Boolean, if true, then skip filter array when value is null/empty then return full array.
    * @returns {*} []
    */
   Array.prototype.filterBy = function (field, value, skipNull)
```


- test cases

``` javascript
    /** mock up data for test cases */
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
```

```javascript
var case1 = [countryA, countryB].filterBy('countryId', 'CA');
/** expected result: */
[{"countryId":"CA","states":[{"stateId":"SA","statePresident":{"name":"Adam","term":2}},{"stateId":"SB","statePresident":{"name":"Adam","term":2}}],"countryPresident":{"name":"Clinton","term":6}}]
```

```javascript
var case2 = [countryA, countryB].filterBy('countryId', '');
/** expected result: */
[]
```

```javascript
var case3 = [countryA, countryB].filterBy('countryId', undefined || null, true);
/** expected result: */
[{"countryId":"CA","states":[{"stateId":"SA","statePresident":{"name":"Adam","term":2}},{"stateId":"SB","statePresident":{"name":"Adam","term":2}}],"countryPresident":{"name":"Clinton","term":6}},{"countryId":"CB","states":[{"stateId":"SC","statePresident":{"name":"Bob","term":4}},{"stateId":"SD","statePresident":{"name":"Bob","term":4}}],"countryPresident":{"name":"Clinton","term":6}}]
```

```javascript
 var case4 = [region].filterBy('countries[].countryId', 'CB');
/** expected result: */
[{"regionId":"RA","countries":[{"countryId":"CB","states":[{"stateId":"SC","statePresident":{"name":"Bob","term":4}},{"stateId":"SD","statePresident":{"name":"Bob","term":4}}],"countryPresident":{"name":"Clinton","term":6}}],"regionalPresident":{"name":"Daniel","term":8}}]
```

```javascript
var case5 = [region].filterBy('countries[].countryId', 'CB').filterBy('regionalPresident.name', 'Daniel');
/** expected result: */
[{"regionId":"RA","countries":[{"countryId":"CB","states":[{"stateId":"SC","statePresident":{"name":"Bob","term":4}},{"stateId":"SD","statePresident":{"name":"Bob","term":4}}],"countryPresident":{"name":"Clinton","term":6}}],"regionalPresident":{"name":"Daniel","term":8}}]
```

```javascript
var case6 = [region].filterBy('countries[].countryId', 'CB').filterBy('countries[].states[].stateId', 'SD');
/** expected result: */
[{"regionId":"RA","countries":[{"countryId":"CB","states":[{"stateId":"SD","statePresident":{"name":"Bob","term":4}}],"countryPresident":{"name":"Clinton","term":6}}],"regionalPresident":{"name":"Daniel","term":8}}]
```

```javascript
var case7 = [region].filterBy('countries[].countryId', 'CB').filterBy('countries[].states[].statePresident.term', 4);
/** expected result: */
[{"regionId":"RA","countries":[{"countryId":"CB","states":[{"stateId":"SC","statePresident":{"name":"Bob","term":4}},{"stateId":"SD","statePresident":{"name":"Bob","term":4}}],"countryPresident":{"name":"Clinton","term":6}}],"regionalPresident":{"name":"Daniel","term":8}}]
```

```javascript
var case8 = [region].filterBy('nothing[].at.all', 'CB').filterBy('are[].you[].kidding.me', 4);
/** expected result: */
[]
```

```javascript
var case9 = [region].filterBy('countries[].states[]', 'SD');
/** expected result: */
Error: Uncaught 'field' is invalid, should be like 'x' or 'x.y.z' or 'x.y[].z' format, and should not end with [].
```

```javascript
var case10 = [region].filterBy( null || undefined || '' || {} || [] || 1, 'SD');
/** expected result: */
Error: Uncaught 'field' can only be String type
```