PREP
var prep = 'OK';
END

console.log('prep = ', PREP[prep]);

IF(false)
	IF(true)
		console.log('inside false,true');
	END
ELSEIF(true)
	IF(true)
		IF(true)
			console.log('deep inside elseif,if,if OK');
		END
	END
ELSE
	IF(true)
		console.log('inside else,true');
	END
END

IF(true)
	PREP
		if (true) {
			INCLUDE("test/include/prep-include.js");
		}
	END
END

console.log('prepInclude = ', PREP[prepInclude]);


IF(true)
	IF(false)
		console.log("ELSEIF NOTOK");
	ELSEIF(false)
		console.log("ELSEIF NOTOK");
	ELSEIF(false)
	ELSEIF(true)
		console.log('ELSEIF OK');
	ELSE
		console.log("ELSEIF NOTOK");
	END
END

IF(true)
	IF(false)
		INCLUDE('test/include/include.js');
	ELSEIF(false)
	ELSE
	END
ELSE
console.log('else code');
END

DEFINE(x=true, y=true, z=false, math=4 * 4)

IF(y)
console.log('y is true OK');
END

IF(z)
ELSE
console.log('z is false OK');
END

console.log('math is', PREP[math], '16 == OK');

PREP("test/include/prep-include2.js")
console.log('prepInclude2 = ', PREP[prepInclude2]);

console.log('included file: OK');
INCLUDE("test/include/include.js")
console.log('end included file: OK');

IF (false)
	DEFINE(y=true)
END

IF(true)
	PREP
		INCLUDE("test/include/prep-include3.js")
	END
	console.log('prepInclude3 = ', PREP[prepInclude3]);

	IF(true)
	console.log("inner if OK");
	END
END

var data = $INCLUDE('test/include/text.txt');

PREP
	var prepData = $INCLUDE('test/include/text.txt');
END

console.log(PREP[prepData]);

var textFromShellCmd = $PROCINCLUDE('echo', [ 'hello there', 'again' ], { shell: true })

PREP
	var shellTxt = $PROCINCLUDE('echo', [ 'one', 'two', 'three' ]);
END

console.log(PREP[shellTxt]);

PROCINCLUDE('echo', [ 'var x = 123' ])
