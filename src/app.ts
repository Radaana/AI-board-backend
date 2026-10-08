import express, { type Express, type Request, type Response } from 'express';
import type { ICreateDialog, IDialog } from './model/dialog.ts';
import crypto from 'crypto';

const dialogsMap: Map<IDialog['id'], IDialog> = new Map();

const clientRequestIdsMap: Map<string, string> = new Map();

const app: Express = express();
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send();
});

app.get('/dialogs', (req: Request, res: Response) => {
    res.status(200).send(Array.from(dialogsMap.values()));
});

app.post('/dialogs', (req: Request, res: Response) => {
    if (!req.body || !(typeof req.body === 'object') || !('clientRequestId' in req.body) || !('text' in req.body)) {
        return res.status(400).send('Invalid request body. Expected { clientRequestId: string, text: string }');
    }

    const body: ICreateDialog = req.body;
    const { clientRequestId, text } = body;

    if (typeof clientRequestId !== 'string' || typeof text !== 'string') {
        return res.status(400).send('Invalid request body content. Expected { clientRequestId: string, text: string }');
    }

    const textTrimmed = text.trim();

    if (!clientRequestId || !textTrimmed) {
        return res.status(400).send("Invalid request body content. Empty 'text' or 'clientRequestId' is not allowed.");
    }

    const dialogId = clientRequestIdsMap.get(clientRequestId);
    if (dialogId) {
        const dialog = dialogsMap.get(dialogId);
        if (dialog?.messages[0].text !== textTrimmed) {
            return res.status(409).send(dialog);
        }
        return res.status(200).send(dialog);
    } else {
        const newDialogId = crypto.randomUUID();
        clientRequestIdsMap.set(clientRequestId, newDialogId);
        const newDialog: IDialog = {
            id: newDialogId,
            messages: [
                {
                    text: textTrimmed,
                    author: 'user',
                    id: crypto.randomUUID(),
                },
            ],
            title: 'New Dialog',
        };
        dialogsMap.set(newDialogId, newDialog);
        return res.status(201).send(newDialog);
    }
});

app.listen(3000);
