"use strict";

const { heapPush, heapPop } = require("./heap.js");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = async (logSources, printer) => {
  const logHeap = [];

  const logStore = [];

  const heapPromises = [];

  logSources.forEach((logSource) => {
    heapPromises.push(logSource.popAsync());
  });

  const newLogs = await Promise.all(heapPromises);
  logSources.forEach((logSource) => {
    logStore.push(logSource.popAsync());
  });

  newLogs.forEach((newLog, i) => {
    heapPush(logHeap, { log: newLog, logSourcesIndex: i });
  });

  while (logHeap.length > 0) {
    const curr = heapPop(logHeap);
    printer.print(curr.log);

    if (logStore[curr.logSourcesIndex]) {
      const newLog = await logStore[curr.logSourcesIndex];
      if (newLog) {
        heapPush(logHeap, {
          log: newLog,
          logSourcesIndex: curr.logSourcesIndex,
        });
        logStore[curr.logSourcesIndex] =
          logSources[curr.logSourcesIndex].popAsync();
      }
    }
  }

  printer.done();

  return new Promise((resolve, reject) => {
    resolve(console.log("Async sort complete."));
  });
};
