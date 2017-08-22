import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { transformFileSync } from 'babel-core';
import plugin from '../src';

//function trim(str) {
  //return str.replace(/^\s+|\s+$/, '');
//}

//describe('', () => {
  //const fixturesDir = path.join(__dirname, 'fixtures');
  //fs.readdirSync(fixturesDir).map((caseName) => {
    //it(`should ${caseName.split('-').join(' ')}`, () => {
      //const fixtureDir = path.join(fixturesDir, caseName);
      //const actualPath = path.join(fixtureDir, 'actual.js');
      //const actual = transformFileSync(actualPath).code;

      //const expected = fs.readFileSync(
          //path.join(fixtureDir, 'expected.js')
      //).toString();

      //assert.equal(trim(actual), trim(expected));
    //});
  //});
//});

var tests = [
	{ file: 'prep' },
]

describe('transform code', function (){
	tests.forEach(function(test) {
		it('src/' + test.file + '.js', function (done) {
			var transformed = transformFileSync(path.join(__dirname, `src/${test.file}.js`), {
				plugins: [[plugin, test.options]],
				babelrc: false,
				comments: false,
			}).code;
			var expected = fs.readFileSync(path.join(__dirname, `expected/${test.file}.js`)).toString();
			if (expected[expected.length - 1] === '\n') expected = expected.slice(0, -1);
			assert.equal(transformed, expected);
			done();
		});
	});
});

