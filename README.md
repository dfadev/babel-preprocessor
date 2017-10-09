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
Include files as code.  If this is used inside a PREPROCESSOR or PREP directive, the file will execute within the transpilation global context.  If used outside a PREPROCESSOR directive it will be included in the transpilation output.
```js
INCLUDE("include/common-imports.js")
```

#### $INCLUDE(expr, ...)
Include files as a string.
```js
var x = $INCLUDE("include/about.txt", "include/about_footer.txt")
console.log(x);
```

#### PROCINCLUDE(command, arguments, options)
Include process output as code.  This takes the same parameters as child_process.spawnSync.  If this is used inside a PREPROCESSOR or PREP directive, the file will execute within the transpilation global context.  If used outside a PREPROCESSOR directive it will be included in the transpilation output.

```js
PROCINCLUDE('echo', [ 'var x = 123' ])
```

#### $PROCINCLUDE(command, arguments, options)
Include process output as a string.  This takes the same parameters as child_process.spawnSync.
```js
var transpileDate = $PROCINCLUDE('date');
var platform = $PROCINCLUDE('uname', [ '-a' ]);

console.log('transpiled at ', transpileDate);
console.log('on platform ', platform);
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


