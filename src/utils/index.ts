import {Note} from "../types/note";

export const mapDBToModel =
    ({
         id,
         title,
         body,
         tags,
         created_at,
         updated_at
     }: Note & { created_at: string; updated_at: string }) => ({
        id,
        title,
        body,
        tags,
        createdAt: created_at,
        updatedAt: updated_at
    })
