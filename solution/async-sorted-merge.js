"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

function heapPush(heap, newKey) {
  heap.push(newKey);

  let curr = heap.length - 1;

  while (curr > 0) {
    let parent = Math.floor((curr - 1) / 2);
    if (heap[curr].log.date < heap[parent].log.date) {
      [heap[curr], heap[parent]] = [heap[parent], heap[curr]];
      curr = parent;
    } else {
      break;
    }
  }
}

function heapPop(heap) {
  const n = heap.length;
  [heap[0], heap[n - 1]] = [heap[n - 1], heap[0]];

  const removedKey = heap.pop();

  let curr = 0;

  while (2 * curr + 1 < heap.length) {
    const leftIndex = 2 * curr + 1;
    const rightIndex = 2 * curr + 2;
    const minChildIndex =
      rightIndex < heap.length &&
      heap[rightIndex].log.date < heap[leftIndex].log.date
        ? rightIndex
        : leftIndex;
    if (heap[minChildIndex].log.date < heap[curr].log.date) {
      [heap[minChildIndex], heap[curr]] = [heap[curr], heap[minChildIndex]];
      curr = minChildIndex;
    } else {
      break;
    }
  }

  return removedKey;
}

module.exports = async (logSources, printer) => {
  const logHeap = [];

  for (let i = 0; i < logSources.length; i++) {
    const newLog = await logSources[i].popAsync();

    heapPush(logHeap, { log: newLog, src: logSources[i] });
  }

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
