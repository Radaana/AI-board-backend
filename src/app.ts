import express, { type Express, type Request, type Response } from 'express';
import type { ICreateDialog, IDialog } from './model/dialog.ts';
import crypto from 'crypto';

const dialogsMap: Record<IDialog['id'], IDialog> = {};
const clientRequestIdsMap: Map<string, string> = new Map();

const app: Express = express();
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send();
});

app.get('/dialogs', (req: Request, res: Response) => {
    res.status(200).send(Object.values(dialogsMap));
});

app.post('/dialogs', (req: Request, res: Response) => {
    if (!req.body || !(typeof req.body === 'object') || !('clientRequestId' in req.body) || !('text' in req.body)) {
        return res.status(400).send();
    }

    const body: ICreateDialog = req.body;
    const { clientRequestId, text } = body;

    if (typeof clientRequestId !== 'string' || typeof text !== 'string') {
        return res.status(400).send();
    }

    const textTrimmed = text.trim();

    if (!clientRequestId || !textTrimmed) {
        return res.status(400).send();
    }

    const dialogId = clientRequestIdsMap.get(clientRequestId);
    if (dialogId) {
        const dialog = dialogsMap[dialogId];
        if (dialog.messages[0].text !== textTrimmed) {
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
        dialogsMap[newDialogId] = newDialog;
        return res.status(201).send(newDialog);
    }
});

app.listen(3000);
