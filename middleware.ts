import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (process.env.NEXT_PUBLIC_SITE === "validator") {
    if (url.pathname === "/") {
      url.pathname = "/validator/reth/token-stake";
      return NextResponse.redirect(url);
    }
  } else {
    if (url.pathname === "/") {
      url.pathname = "/rtoken";
      return NextResponse.redirect(url);
    }
  }
}

export const config = {
  matcher: ["/", "/rtoken/stake/:tokenName*"],
};
