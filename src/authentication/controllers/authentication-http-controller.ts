import { HttpServer, RequestContext } from "utils/http"

export function registerAuthenticationRoutes(deps: {
  httpServer: HttpServer,
}) {
  const { httpServer: server } = deps

  server.addEndpoint('POST', '/login', authenticate)
  function authenticate(ctx: RequestContext): Response {
    // Placeholder just to check if cookies are working as expected

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    const sessionId = encodeURI(Math.floor(Math.random() * 10000000).toString(16).padStart(30, "x"))
    const expires = new Date(Date.now() + 5 * 60 * 60).toUTCString()
    headers.append('Set-Cookie', `sessionId=${sessionId}; Path=/; Expires=${expires}; HttpOnly`)

    return new Response(JSON.stringify({
        "message": "Successfully authenticated!"
      }),
      {
        headers,
        status: 200
      }
    )
  }
}
