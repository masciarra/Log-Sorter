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
    const { log, logSourcesIndex } = heapPop(logHeap);
    printer.print(log);

    if (logStore[logSourcesIndex]) {
      const newLog = await logStore[logSourcesIndex];
      if (newLog) {
        heapPush(logHeap, {
          log: newLog,
          logSourcesIndex: logSourcesIndex,
        });
        logStore[logSourcesIndex] = logSources[logSourcesIndex].popAsync();
      }
    }
  }

  printer.done();

  return new Promise((resolve, reject) => {
    resolve(console.log("Async sort complete."));
  });
};
