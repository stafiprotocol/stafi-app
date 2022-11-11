import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname === "/") {
    url.pathname = "/rtoken";
    return NextResponse.redirect(url);
  }
  if (url.pathname === "/validator") {
    url.pathname = "/validator/reth/token-stake";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/", "/validator"],
};
