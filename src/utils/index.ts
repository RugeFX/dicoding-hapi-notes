import {MappedNote, Note} from "../types/note";

export const mapDBToModel =
    ({
         id,
         title,
         body,
         tags,
         created_at,
         updated_at,
         username,
     }: Note & { created_at: string; updated_at: string; username: string }): MappedNote => ({
        id,
        title,
        body,
        tags,
        createdAt: created_at,
        updatedAt: updated_at,
        username,
    })
