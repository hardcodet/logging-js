# Structured Logging for Typescript / Javascript

An opinionated logger for Typescript / Javascript projects, optimized for structured logging.

```
// create a named logger
const logger = loggingStore.createLogger("foo");

logger.debug("hello world");
logger.info("Log structured data", {name: "fooData", id: 123, result: "OK" });
logger.warn(`Could not find order ${order.id}.`);
logger.error("Log exception", e);
logger.fatal("Log exception and structured data", e, {name: "orderData", ...orderDto})
```

Some features:

- Structured logging (every log message is represented as a JSON document)
- Custom field injection (e.g. system information), which can be changed at runtime.
- Built-in log-level filtering (e.g. only warnings and above in production)
- Works out of the box in React Native
- Built-in HTTP sink optimized for ELK (e.g. Elasticsearch, Amazon, logz.io)
- Easily extendable with custom sinks


## Installation

<a href="https://www.npmjs.com/package/@hardcodet/logging-js"><img src="https://img.shields.io/npm/v/@hardcodet/logging-js.svg" alt="NPM Version" /></a>
<br>

Using NPM:

```
npm i @hardcodet/logging-js
```

Using Yarn:

```
yarn add @hardcodet/logging-js
```


## Logging Sinks ##

A "sink" is basically just a class that outputs logged messages.

### Built-in Sinks ###

The package comes with two logging sinks:

- `ConsoleSink` which just outputs colored log messages to the console / terminal.
- `HttpSink` which logs directly to an arbitrary HTTP endpoint. It is highly optimized
  for input into an ElasticSearch cluster (e.g. http://logz.io), but will also work
  for other systems.


### Custom Sinks ###

Writing a custom sink is really trivial, however. Most of the needed business logic is
encapsulated in the `BatchedSink` base class, so writing your own logging sink is as easy as this: 


```
export class MySink extends BatchedSink {

    protected async emitLogs(messages: ILogMessage[]): Promise<void> {
        // write the current batch to wherever
    }
    
}
```

## Logging Data ##

Every log message is internally routed as a JSON document with the following data:

- static global fields (e.g. environment or application name)
- the actual log message (log level, message, error, payload)
- custom extra-fields (e.g. system information or the currently user)

Here's an example log message as it's sent with the `HttpSink`:

```
{
    // global fields (set on LoggingStore)
    "env": "DEV",
    "appName": "my shiny application",


    // name of the logger that sent the message
    "context": "ConnectivityStore",


    // message information
    "@timestamp": "2020-06-22T10:01:05.467Z",
    "level": "Info",
    "isException": false,
    "message": "Connectivity change.",

    // message payload - "payloadType" is the "name" of the payload during logging
    "payloadType": "connectivityData",
    "connectivityData": {
      "isInternetReachable": true,
      "isConnected": true,
      "type": "wifi"
    },


    // custom injected fields (configured for the sink - see setup sample below)
    "os": "Android",
    "deviceInfo": {
      "osVersion": "10",
      "model": "SM-G970F",
      "brand": "samsung"
    }
}
```

### Payload Logging ###

Every logging method optionally takes an `Error` instance or a _payload_. Payloads are
simply JSON-serializable objects that are included in the log message - they are great
for filtering or diagnosis.
 
For the sake of proper logging, every payload should provide a `name` key. That `name` is used
as a JSON key to merge the payload into the JSON document that is created for every logged message.
This is very convenient when searching / filtering structured logs. Also, it helps to avoid indexing
errors in log processing systems like Elasticsearch.

    private foo(context: any) {
        bool success = ...;
        if(!success) {
            const payload = { name: "fooData", key: "abc" }
            logger.warn("Couldn't perform action", payload);
        }
    }


If you already have an object you want to log, just use the `...` spread operator to generate a
payload object from it with a `name` key:

    private logConnectivityChange(connectivityDto) {
        const payload = { name: "connectivityData", ...connectivityDto },
        logger.info(`Connectivity change.`, payload);
    }


## Logging Setup ##

Setting up logging involves the following steps:

- setting up the sinks you want to use
- creating a `LoggingStore`, which is basically a factory for your loggers
- typically expose a way to retrieve loggers from your `LoggingStore` 

Minimal sample:

```
// 1: log to console
const consoleSink = new ConsoleSink();

// 2: create the logging store
const loggingStore = new LoggingStore("myAppName", "DEV", [consoleSink]);

// 3: expose factory function to create named loggers
export default function createLogger(context: string): ILogger {
    return loggingStore.createLogger(context);
}
```


More involved sample with filtering and extra-fields:

```
// include some custom fields with every message logged by the HTTP sink
const extraFields = {
    os: Device.osName,
    ip: Device.ipAddress,
    deviceInfo: {
        brand: Device.brand,
        model: Device.modelName
    }
}

// HTTP logging with the extra fields
const httpOptions = new HttpSinkOptions("http://www.foo.com/logs");
httpOptions.extraFields = () => extraFields;
const httpSink = new HttpSink(httpOptions);

// also log to console
const consoleSink = new ConsoleSink();

// put sinks into array
const sinks = [httpSink, consoleSink];

// filter out debug / info messages
const minLevel = LogLevel.Warning;

// create the logging store
const loggingStore = new LoggingStore("myAppName", "DEV", sinks, minLevel);


// expose factory function to create loggers
export default function createLogger(context: string): ILogger {
    return loggingStore.createLogger(context);
}
```


### Base class ###

You may want to abstract away most of the logging infrastructure. One way to do that
is by creating a simple base class. The snippet below would work with the
exported `createLogger` function from the setup sample above.


    export abstract class LogEnabled {
    
        protected logger: ILogger;
    
        protected constructor(loggerName?: string) {
            this.logger = createLogger(loggerName || this.constructor.name);
        }
    }


This allows you to simple extend that base class, which will expose a named logger.
The logger in the snippet below will log with the context "_UserService"_:

    export class UserService extends LogEnabled {
    
        public getUser(email: string) {
            const user = ...
            
            if (!user) {
                this.logger.warn(`No user with email ${email} found.`);
            }
    
            ...
        }
    }


### Sink Options

```
export class BatchedSinkOptions {
    public sendIntervalMs: number = 5 * 1000;
    public bufferSize: number = 100;
    public internalDebugMessages: boolean = false;
    public numberOfRetries: number = 3;
    public suppressErrors: boolean = false;
    public extraFields: () => any = undefined;
}
```

|Option Value |Description                                                             |Default                  |
|-------------|------------------------------------------------------------------------|-------------------------|
|sendIntervalMs         |Interval in which batches are sent to the sink.                                  |5000 (ms)               |
|bufferSize             |Maxiumum buffer size. If that size is reached, the buffer is flushed quicker than the configured `sendIntervalMs`. Setting this to `1` would disable buffering.|100                        |
|internalDebugMessages  |Set to `true` to have the logger write debug messages itself (to diagnose logging itself). |`false`    |
|numberOfRetries        |Number of retries if writing to the sink fails (e.g. in case of HTTP connection issues).                   |3|
|suppressErrors         |By default, error that occur while logging are written to the console. Set to false to suppress. |false                        |
|extraFields            |Allows dynamic injection of fields that are included in every message (e.g. user or system information).                      |-                        |


### Shutdown and Flushing ###

If you use sinks that buffer log messages (as does `BatchedSink`), you might want to flush your sinks
when your application shuts down by invoking `closeAndFlush` of your `LoggingStore`. More on `LoggingStore`
in the setup sample below.

```
// setup
const loggingStore: LoggingStore = ....

function shutDown() {
    loggingStore.closeAndFlush();
}
``` 
