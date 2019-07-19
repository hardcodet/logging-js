import {BatchedSink} from "./BatchedSink";
import {HttpSinkOptions} from "./HttpSinkOptions";
import {ILogMessage} from "../Logger/ILogMessage";

/**
 * Logs buffered messages to an HTTP endpoint with built-in retry capabilites.
 */
export class HttpSink extends BatchedSink<HttpSinkOptions> {
    private batchId = 1;

    protected async emitLogs(messages: ILogMessage[]): Promise<void> {
        // create batch
        const batch = this.createBatch(messages);

        // send logs
        await this.sendLogs(batch);
    }

    private createBatch(msgs: ILogMessage[]) {
        const batch: any = {};

        // clones the messages and adds an additional @timestamp field
        batch.msgs = msgs.map(m => Object.assign({}, m, {'@timestamp': m.timestamp}));

        batch.attemptNumber = 1;
        batch.sleepUntilNextRetry = 3 * 1000;
        batch.id = this.batchId++;

        return batch;
    }

    private async sendLogs(batch): Promise<void> {
        const body = this.serializeMessages(batch.msgs);
        const options = {
            body,
            method: 'POST',
            headers: {
                accept: '*/*',
                'user-agent': this.options.userAgent,
                'content-type': 'text/plain',
            },
        };

        try {
            const response = await fetch(this.options.endpointUri, options);
            if (!response.ok) {
                // handle like any exception error locally
                const msg = `Posting logs failed with HTTP error: ${response.statusText}`;
                this.handleSendError(batch, msg);
            }
        } catch (ex) {
            this.handleSendError(batch, ex.toString());
        }
    }

    private serializeMessages(msgs) {
        let body = '';

        for (const m of msgs) {
            body = `${body}${this.jsonToString(m)}\n`;
        }

        return body;
    }

    private handleSendError(batch, errorMessage: string) {
        if (batch.attemptNumber >= this.options.numberOfRetries) {
            // retry limit exceeded - giving up
            const errorMsg = `Failed after ${batch.attemptNumber} retries and giving up. Error: ${errorMessage}`;
            this.writeErrorToConsole(new Error(errorMsg));
        } else {
            // schedule retry
            this.logToConsole(`Log batch #${batch.id} not sent and will retry. Reason: ${errorMessage}`);
            const sleepTimeMs = batch.sleepUntilNextRetry;
            batch.sleepUntilNextRetry = batch.sleepUntilNextRetry * 2;
            batch.attemptNumber++;

            setTimeout(() => {
                this.sendLogs(batch);
            }, sleepTimeMs);
        }
    }
}
