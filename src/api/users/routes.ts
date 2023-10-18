import type UsersHandler from "./handler";
import type {ServerRoute} from "@hapi/hapi";

const routes = (handler: UsersHandler): ServerRoute[] => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.postUserHandler
    },
    {
        method: 'GET',
        path: '/users/{id}',
        handler: handler.getUserByIdHandler
    }
]

export default routes
