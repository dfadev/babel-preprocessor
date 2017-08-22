# babel-preprocessor

This is a Babel plugin that adds preprocessor directives to Javascript.

## Features:

* Run code during transpilation
* Include external Javascript
* Conditional transpilation
* Embed values calculated during transpilation into output

## Installation

```sh
$ npm install babel-preprocessor
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": ["babel-preprocessor"]
}
```

### Via CLI

```sh
$ babel --plugins babel-preprocessor script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["babel-preprocessor"]
});
```

## Syntax

#### PREP, PREPROCESS
Execute code during transpilation.
###### Example:
```js
PREP
    console.log('this is executed during transpilation');
    var x = 'variables live in global context';
END
```

#### PREP(filename/expression, ...)
Execute code retrieved from the filename(s) specified.  If an expression is used it must return a filename.
```js
PREP('include/prep-file.js')
```

#### PREP[expr]
Execute the expression within the global context during transpilation.  Use this to access variables you have set using DEFINE or PREP.
```js
PREP
var preprocessVariable = 'OK';
END

console.log(PREP[preprocessVariable]);
```

#### DEFINE(expr, ...)
Define a variable within the transpilation's global context.
```js
DEFINE(x=0, y=1, z=2)
console.log(PREP[x], PREP[y], PREP[z]);
```

#### INCLUDE(expr, ...)
Include files.  If this is used inside a PREPROCESSOR or PREP directive, the file will execute within the transpilation global context.  If used outside a PREPROCESSOR directive it will be included in the transpilation output.
```js
INCLUDE("include/common-imports.js")
```
#### IF/ELSEIF (expr, ...)
Conditional compilation.
```js
IF (true)
    // this gets included in the output
    console.log('OK!');
ELSE
    // this does not
    console.log('NOT OK!');
END
```


