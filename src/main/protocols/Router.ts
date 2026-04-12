import type { Logger } from "../utils/logger";

type RequestContext = {
  url: URL;
  path: string;
  query: URLSearchParams;
  logger: Logger,
};

export type Route = {
  match: (path: string) => boolean;
  handle: (ctx: RequestContext) => Promise<Response>;
};

export class Router {
  private routes: Route[] = [];

  register(route: Route) {
    this.routes.push(route);
  }

  async handle(ctx: RequestContext): Promise<Response> {
    const route = this.routes.find((r) => r.match(ctx.path));

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    return route.handle(ctx);
  }
}
