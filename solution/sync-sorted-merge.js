"use strict";

const { heapPush, heapPop } = require("./heap.js");

module.exports = (logSources, printer) => {
  const logHeap = [];

  logSources.forEach((logSource) => {
    heapPush(logHeap, { log: logSource.pop(), src: logSource });
  });
  while (logHeap.length > 0) {
    const curr = heapPop(logHeap);
    printer.print(curr.log);
    const sourcePop = curr.src.pop();
    if (sourcePop) {
      heapPush(logHeap, { log: sourcePop, src: curr.src });
    }
  }

  printer.done();

  return console.log("Sync sort complete.");
};
