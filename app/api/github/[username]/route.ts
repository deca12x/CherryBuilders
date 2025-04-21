import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

// Cache directory
const CACHE_DIR = path.resolve(process.cwd(), ".github-cache");

// Ensure cache directory exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create cache directory:", error);
}

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface CachedData {
  timestamp: number;
  data: ContributionCalendar;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      return NextResponse.json(
        { error: "GitHub username is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedData = await getCachedData(username);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // GitHub GraphQL API endpoint
    const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
    const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GitHub token is not configured" },
        { status: 500 }
      );
    }

    // Get the current date and date from one year ago
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Format dates for GraphQL query
    const fromDate = oneYearAgo.toISOString();
    const toDate = now.toISOString();

    // GraphQL query to fetch contributions data
    const query = `
      query($username: String!, $fromDate: DateTime!, $toDate: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $fromDate, to: $toDate) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;

    // Make request to GitHub GraphQL API
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
          fromDate,
          toDate,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GitHub API error:", errorData);
      return NextResponse.json(
        {
          error: `Failed to fetch GitHub contributions: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check for errors in the GraphQL response
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 500 }
      );
    }

    // Check if user exists and has contributions data
    if (!data.data?.user?.contributionsCollection?.contributionCalendar) {
      return NextResponse.json(
        { error: "User not found or no contributions data available" },
        { status: 404 }
      );
    }

    // Get the contributions data
    const contributionData =
      data.data.user.contributionsCollection.contributionCalendar;

    // Cache the data
    await cacheData(username, contributionData);

    // Return the data
    return NextResponse.json(contributionData);
  } catch (error) {
    console.error("Error in GitHub API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub contributions" },
      { status: 500 }
    );
  }
}

// Function to get cached data
async function getCachedData(
  username: string
): Promise<ContributionCalendar | null> {
  try {
    const cacheFile = path.join(CACHE_DIR, `${username}.json`);

    // Check if cache file exists
    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    // Read and parse the cache file
    const rawData = await fsPromises.readFile(cacheFile, "utf-8");
    const cachedData: CachedData = JSON.parse(rawData);

    // Check if cache is older than 24 hours
    const now = Date.now();
    const cacheAge = now - cachedData.timestamp;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (cacheAge < oneDayMs) {
      return cachedData.data;
    }

    // Cache is too old
    return null;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

// Function to cache data
async function cacheData(
  username: string,
  data: ContributionCalendar
): Promise<void> {
  try {
    const cacheFile = path.join(CACHE_DIR, `${username}.json`);
    const cacheData: CachedData = {
      timestamp: Date.now(),
      data,
    };

    await fsPromises.writeFile(cacheFile, JSON.stringify(cacheData), "utf-8");
  } catch (error) {
    console.error("Error writing cache:", error);
  }
}
