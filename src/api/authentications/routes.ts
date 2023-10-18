import type AuthenticationsHandler from "./handler";
import {ServerRoute} from "@hapi/hapi";

const routes = (handler: AuthenticationsHandler): ServerRoute[] => [
    {
        method: 'POST',
        path: '/authentications',
        handler: handler.postAuthenticationHandler
    },
    {
        method: 'PUT',
        path: '/authentications',
        handler: handler.putAuthenticationHandler
    },
    {
        method: 'DELETE',
        path: '/authentications',
        handler: handler.deleteAuthenticationHandler
    }
]

export default routes
