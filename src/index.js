import * as t from "babel-types";
import generate from "babel-generator";
import * as fs from "fs";
import * as babylon from "babylon";
import * as babel from "babel-core";
import * as p from "path";

const PREP = "PREP", PREPROCESS = "PREPROCESS", END = "END",
	INCLUDE = "INCLUDE", DEFINE = "DEFINE",
	IF = "IF", ELSEIF = "ELSEIF", ELSE = "ELSE";

function evalAst(node) { return evalGlobal(generate(node).code); }
function evalGlobal(code) { return (void 0, eval)(code); }

export default function({types: t }) {
	return {
		visitor: {

			Statement: { exit(path, state) { handleStatement(path, state); } },

			ExpressionStatement(path, state) {
				if (path.node.expression.type == "Identifier") {
					var nm = path.node.expression.name;
					if (nm === PREPROCESS || nm === PREP) handlePrep(path, state);
					else if (nm === END) handleEnd(path, state);
					else if (nm === ELSE) handleElse(path, state);
				} else if (path.node.expression.type === "CallExpression" && t.isIdentifier(path.node.expression.callee)) {
					var nm = path.node.expression.callee.name;
					if (nm === PREPROCESS || nm === PREP) handlePrepCall(path, state);
					else if (nm === INCLUDE) handleInclude(path, state);
					else if (nm === DEFINE) handleDefine(path, state);
					else if (nm === IF) handleIf(path, state);
					else if (nm === ELSEIF) handleElseIf(path, state);
				}
			},

			MemberExpression(path, state) {
				if (t.isIdentifier(path.node.object) && (path.node.object.name == PREP || path.node.object.name == PREPROCESS))
					handlePrepAccess(path, state);
			}
		}
	};
}

function handleStatement(path, state) {
	if (state.current && state.current.prep && path.parent == state.current.parent) { // && !state.remove) {
		state.current.code.push(path.node);
		path.remove();
	}

	if (state.current && state.current.remove && path.parent == state.current.parent) path.remove();
}

function handlePrepAccess(path, state) {
	var rslt = evalAst(path.node.property);
	if (Object.prototype.toString.call(rslt) === '[object String]') {
		path.replaceWith(t.stringLiteral(rslt));
	}
	else
		path.replaceWithSourceString(rslt);
}

function handlePrep(path, state) {
	if ( !state.current || (state.current && state.current.satisfied && !state.current.remove) ) {
		if (state.current && state.current.prep)
			throw path.buildCodeFrameError("nested " + path.node.expression.name + " not allowed");
		if (!state.current) {
			state.current = {
				satisfied: true,
				remove: false
			};
		}
		state.current.prep = true;
		state.current.parent = path.parent;
		state.current.code = []
		path.remove();
	} else {
		state.current.prep = true;
		path.remove();
	}
}

function handleEnd(path, state) {
	if (state.current && state.current.prep) {
		if ( !state.current || (state.current && state.current.satisfied && !state.current.remove) ) {
			var code = "";
			for (let i = 0; i < state.current.code.length; i++)
				code += generate(state.current.code[i]).code;
			evalGlobal(code);
		}
		state.current.prep = false;
	} else if (state.current) {
		state.current = undefined;
		if (state.nested) {
			state.current = state.nested.pop();
			if (state.nested.length == 0) {
				state.nested = undefined;
			}
		}
	}
	path.remove();
}

function handlePrepCall(path, state) {
	if ( !state.current || (state.current && state.current.satisfied) ) {
		for (let i = 0; i < path.node.expression.arguments.length; i++) {
			var fname = evalAst(path.node.expression.arguments[i]);
			if (!fs.existsSync(fname))
				throw path.buildCodeFrameError("missing preprocessor file: " + p.join(process.cwd(), fname));
			try {
				var code = fs.readFileSync(fname).toString();
				var rslt = evalGlobal(code);
			} catch (ex) {
				throw path.buildCodeFrameError(ex);
			}
		}
	}

	path.remove();
}

function handleInclude(path, state) {
	if ( !state.current || (state.current && state.current.satisfied && !state.current.remove) ) {
		var inc = "";
		for (let i = 0; i < path.node.expression.arguments.length; i++) {
			var fname = evalAst(path.node.expression.arguments[i]);
			if (!fs.existsSync(fname))
				throw path.buildCodeFrameError("missing include file: " + p.join(process.cwd(), fname));
			inc += fs.readFileSync(fname).toString();
		}

		var rslt = babel.transform(inc);
		for (let i = 0; i < rslt.ast.program.body.length; i++) {
			if (state.current && state.current.prep)
				state.current.code.push(rslt.ast.program.body[i]);
			else
				path.insertBefore(rslt.ast.program.body[i]);
		}
	}
	path.remove();
}

function handleDefine(path, state) {
	if (state.current && state.current.prep)
		throw path.buildCodeFrameError("DEFINE not allowed inside PREP, use normal variable declaration");

	if ( !state.current || (state.current && state.current.satisfied && !state.current.remove) )
		for (let i = 0; i < path.node.expression.arguments.length; i++)
			evalAst(path.node.expression.arguments[i]);
	path.remove();
}

function handleIf(path, state) {
	if (path.node.expression.arguments.length < 1 || path.node.expression.arguments.length > 1)
		throw path.buildCodeFrameError("only one argument to IF is allowed");

	if (state.current && state.current.prep)
		throw path.buildCodeFrameError("IF not allowed inside PREP, use normal if statement");

	var shouldEval = true;

	if (state.current) {
		if (state.current.remove) {
			shouldEval = false;
		}
		if (!state.nested) state.nested = [];
		state.nested.push(state.current);
	} else {
		state.current = { prep: false, parent: undefined };
	}

	if (shouldEval) {
		var rslt = evalAst(path.node.expression.arguments[0]);

		state.current = rslt ?
			{
				prep: state.current.prep,
				satisfied: true,
				remove: false,
				code: [],
				parent: path.parent
			}
			:
			{
				prep: state.current.prep,
				satisfied: false,
				remove: true,
				code: [],
				parent: path.parent
			};
	} else {
		state.current = {
			prep: state.current.prep,
			satisfied: true,
			remove: true,
			code: [],
			parent: path.parent
		}
	}

	path.remove();
}

function handleElseIf(path, state) {
	if (!state.current)
		throw path.buildCodeFrameError("missing IF statement");

	if (state.current.satisfied) {
		state.current.remove = true;
	} else {
		if (path.node.expression.arguments.length < 1 || path.node.expression.arguments.length > 1)
			throw path.buildCodeFrameError("only one argument to ELSEIF is allowed");

		var rslt = evalAst(path.node.expression.arguments[0]);
		if (rslt) {
			state.current.satisfied = true;
			state.current.remove = false;
		} else {
			state.current.remove = true;
		}
	}
	path.remove();
}

function handleElse(path, state) {
	if (!state.current)
		throw path.buildCodeFrameError("missing IF statement");

	if (state.current.satisfied) {
		state.current.remove = true;
	} else {
		state.current.satisfied = true;
		state.current.remove = false;
	}
	path.remove();
}

