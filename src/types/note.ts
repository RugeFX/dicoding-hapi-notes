export type Note = {
    id: string
    title: string
    body: string
    tags: string[]
    owner: string
}

export type NotePayload = Omit<Note, "id">
