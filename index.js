/**
 * Inspirations:
 * @see https://x.com/aidenybai/status/1873444625907597780
 * @see https://github.com/developit/workerize - full working library from the creator of Preact.
 * @see https://x.com/hatem_hosny_/status/1873648482051113452
 * @see https://github.com/mdn/dom-examples/tree/main/web-workers
 * @see https://github.com/mdn/dom-examples/tree/main/web-workers/simple-web-worker
 */
function createInlinedWorker(source) {
    const blob = new Blob([source], { type:"text/javascript" });
    const url = URL.createObjectURL(blob)

    /**
     * This inlines the web worker by converting the `source` to a blob, but this could also be an external JS file, which is the web worker code.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#spawning_a_dedicated_worker
     * @type {Worker}
     */
    const worker = new Worker(url);

    URL.revokeObjectURL(url)

    return worker;
}

const worker = createInlinedWorker(`

    function expensiveOperation() {
    let chars = '';

    let limit = 1_000_000_000;
    console.time("starting log")
    while(limit--) {
        chars = Math.random()
    }
    
    console.timeEnd("starting log")

    return chars;
    }
    
    /**
    * Offloads expensive operation to the web worker, as long as it's not tied to any UI or DOM work. Not all window properties and methods are available.
    * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#concepts_and_usage
    */
    const expensiveData = expensiveOperation();
    
    postMessage(expensiveData);
    
    onmessage = function(event) {
        console.log("received data back from the main thread in the worker", event.data);
        
        postMessage("closing the interaction")
    }    
`)

const MESSAGE_LIMIT = 1
let currentMessageCount = 0
worker.addEventListener("message", event => {
    console.log("received data", event.data);

    if(currentMessageCount >= MESSAGE_LIMIT) {
        return;
    }

    currentMessageCount++;
    // This would make more sense to call in events like `submit` or something, or else it would be an infinite loop.
    worker.postMessage(`Received the data from the worker, ${event.data} and passing back a random number ${Math.random()}`)
})