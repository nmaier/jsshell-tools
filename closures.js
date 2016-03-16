"use strict";

function traverse(node, cb, filter, level=0) {
  if (!node) {
    return;
  }
  if (Array.isArray(node)) {
    node.forEach(n => traverse(n, cb, filter, level + 1));
    return;
  }
  if (typeof node === "object") {
    if (node.type && (!filter || filter.has(node.type))) {
      cb(node, level);
    }
    Object.keys(node).forEach(k => {
      if (k === "parent" || k === "loc" || !node[k]) {
				return;
			}
      traverse(node[k], cb, filter, level + 1);
    });
  }
}

const filter = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
]);

function parse(i) {
  let cnt = read(i);
  let ast = Reflect.parse("" + cnt, {source: i, loc:true, type:"script"});
  let yielded = 0;
  traverse(ast, (n, level) => {
    if (n.body.type !== "BlockStatement") {
      let {start, end, source} = n.loc;
      print(`${source}:${start.line} :${end.line}`);
      yielded++;
    }
  }, filter);
  return yielded;
}

function main() {
  if (!scriptArgs.length) {
    print("Call me with some scripts");
    return;
  }
  if (scriptArgs.some(e => e === "-h" || e === "-?" || e == "--help")) {
    print("Usage:");
    print("js closures.js file.js [file2.js]");
    return;
  }
  let totalWarnings = 0;
  for (let i of scriptArgs) {
    let warnings = parse(i);
    totalWarnings += warnings;
    if (warnings) {
      print();
      print(warnings, "warnings");
      print();
    }
  }
  print(totalWarnings, "total");
}
main();
