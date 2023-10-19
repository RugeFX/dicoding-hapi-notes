export interface Note {
  id: string
  title: string
  body: string
  tags: string[]
  owner: string
}

export type NotePayload = Omit<Note, 'id'>

export interface MappedNote {
  id: string
  title: string
  body: string
  tags: string[]
  createdAt: string
  updatedAt: string
  username: string
}
