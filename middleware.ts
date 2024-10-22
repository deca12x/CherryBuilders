import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "./lib/privy";

export const config = {
  matcher: "/api/:function*",
};

export async function middleware(req: NextRequest) {
  if (req.url.includes("/api/public") || req.url.includes("/api/external")) {
    // If the request is for a public or external endpoint, continue processing the request
    return NextResponse.next();
  }

  // Get the Privy token from the headers
  const authToken = req.headers.get("Authorization");

  //console.log("Authorization: ", authToken);

  if (!authToken) {
    console.error("\nMissing auth token\n");
    return NextResponse.json(
      { error: "Missing auth token" },
      {
        status: 401,
      }
    );
  }

  try {
    const token = authToken.replace("Bearer ", "");
    const { isValid, user } = await verifyAuthToken(token);
    if (!isValid) {
      // Respond with JSON indicating an error message
      console.error("\nAuthentication failed because jwt is not valid\n");
      return NextResponse.json(
        { error: "Authentication failed" },
        {
          status: 401,
        }
      );
    }
    // If authentication is successful, continue processing the request
    const response = NextResponse.next();
    // privy embedded wallet address
    const address = user?.wallet?.address;
    response.headers.set("x-address", address!);
    return response;
  } catch (error: any) {
    // Handle errors related to token verification or other issues
    console.error("\nGeneric error occurred while verifying jwt\n");
    return NextResponse.json(
      {
        error: "Authentication failed: " + error.message,
      },
      {
        status: 401,
      }
    );
  }
}
