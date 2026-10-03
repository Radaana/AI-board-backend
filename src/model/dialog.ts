export interface ICreateDialog {
    clientRequestId: string; // deduplication ID
    text: string;
}

export interface IDialog {
    id: string; // uuid
    messages: IMessage[];
    title: string;
}

export interface IMessage {
    text: string;
    author: 'user' | 'model';
    id: string; // uuid
}
