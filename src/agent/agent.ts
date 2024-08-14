export interface Message {
    role: string
    content: string
}

export interface AgentInterface {
    query(request: string, context: Iterable<Message>): string;
}

export class Raider implements AgentInterface {
    query(request: string, history: Iterable<Message>): string {
        // <Insert axios query to https://localhost:8000/api/generate

        return "";
    }
}