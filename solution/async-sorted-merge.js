"use strict";

const { heapPush, heapPop } = require("./heap.js");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = async (logSources, printer) => {
  const logHeap = [];

  const promises = [];
  for (let i = 0; i < logSources.length; i++) {
    promises.push(logSources[i].popAsync());
  }

  const newLogs = await Promise.all(promises);

  newLogs.forEach((newLog, i) => {
    heapPush(logHeap, { log: newLog, src: logSources[i] });
  });

  while (logHeap.length > 0) {
    const curr = heapPop(logHeap);
    printer.print(curr.log);
    const sourcePop = await curr.src.popAsync();
    if (sourcePop) {
      heapPush(logHeap, { log: sourcePop, src: curr.src });
    }
  }

  printer.done();

  return new Promise((resolve, reject) => {
    resolve(console.log("Async sort complete."));
  });
};
