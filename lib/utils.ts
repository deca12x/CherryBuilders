import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to shorten the address
export const shortenAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
};
