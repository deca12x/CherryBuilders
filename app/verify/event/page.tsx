"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { K2D } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import ConnectButton from "@/components/ui/connectButton";
import { usePrivy } from "@privy-io/react-auth";
import {
  getEventBySlug,
  getPasscodeByCode,
  getUser,
  updatePasscodeByCode,
} from "@/lib/supabase/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorCard from "@/components/ui/error-card";
import SearchParamsComponent from "@/components/searchparams";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Component() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();

  const [error, setError] = useState(false);
  const [invalidPasscode, setInvalidPasscode] = useState(false);
  const [invalidEvent, setInvalidEvent] = useState(false);
  const [passcodeAlreadyUsed, setPasscodeAlreadyUsed] = useState(false);
  const [passcodeUsedByAnotherUser, setPasscodeUsedByAnotherUser] =
    useState(false);
  const [jwt, setJwt] = useState<string | null>("");
  const [eventName, setEventName] = useState<string>("");
  const [wasUserChecked, setWasUserChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successfulVerification, setSuccessfulVerification] = useState(false);

  const address = user?.wallet?.address;
  const [passcode, setPasscode] = useState<string | null>(null);
  const [eventSlug, setEventSlug] = useState<string | null>(null);

  const handleParamsChange = (
    passcode: string | null,
    eventSlug: string | null
  ) => {
    setPasscode(passcode);
    setEventSlug(eventSlug);
  };

  useEffect(() => {
    const fetchPasscodeAndEvent = async () => {
      if (!passcode) {
        setInvalidPasscode(true);
        setIsLoading(false);
        return;
      }
      if (!eventSlug) {
        setInvalidEvent(true);
        setIsLoading(false);
        return;
      }

      // check the passcode
      const {
        success: passcodeSuccess,
        data: passcodeData,
        error: passcodeError,
      } = await getPasscodeByCode(passcode, jwt);
      if (passcodeError) {
        setError(true);
        setIsLoading(false);
        return;
      }
      if (passcodeSuccess && !passcodeData) {
        setInvalidPasscode(true);
        setIsLoading(false);
        return;
      }

      // If the passcode has already been used
      if (passcodeData.consumed) {
        setPasscodeAlreadyUsed(true);
        if (passcodeData.user_address !== address) {
          setPasscodeUsedByAnotherUser(true);
        }
        setIsLoading(false);
        return;
      }

      // check the event
      const {
        success: eventSuccess,
        data: eventData,
        error: eventError,
      } = await getEventBySlug(eventSlug, jwt);
      if (eventError) {
        setError(true);
        setIsLoading(false);
        return;
      }
      if (!eventSuccess || !eventData) {
        setInvalidEvent(true);
        setIsLoading(false);
        return;
      }

      if (!eventData.active) {
        setInvalidEvent(true);
        setIsLoading(false);
        return;
      }

      // set the event name
      setEventName(eventData.name);
      setIsLoading(false);
    };

    if (wasUserChecked) fetchPasscodeAndEvent();
  }, [wasUserChecked, passcode, eventSlug, jwt, address]);

  useEffect(() => {
    const checkUser = async () => {
      if (!address || !user || !ready) return;

      // setting the jwt as a state variable to avoid stale closure
      const token = await getAccessToken();
      setJwt(token);

      // check if the user exists in the database
      const { success, data, error } = await getUser(address, token);

      // if the user is not found, redirect to the profile creation page
      if (!success && error) {
        setError(true);
        setIsLoading(false);
        return;
      } else if (!data) {
        router.push(
          `/profile/creation?passcode=${passcode}&event-slug=${eventSlug}`
        );
        return;
      } else {
        setWasUserChecked(true);
      }
    };

    checkUser();
  }, [address, router, user, ready]);

  // A function to handle the verification of the passcode
  const handleVerify = async () => {
    if (!passcode || !eventSlug || !address || !jwt) return;
    setIsVerifying(true);

    const { error } = await updatePasscodeByCode(
      passcode,
      address,
      eventSlug,
      true,
      jwt
    );

    if (error) {
      setError(true);
      setIsVerifying(false);
      return;
    }

    setSuccessfulVerification(true);
    setIsVerifying(false);
  };

  // A button component to redirect the user to the matching page
  const RedirectButton = ({ text }: { text: string }) => {
    return (
      <button
        className="flex items-center justify-center bg-red py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md"
        onClick={() => router.push("/matching")}
      >
        {text}
      </button>
    );
  };

  if (error) {
    return <ErrorCard />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center sm:p-24 p-3 bg-background">
      <Card className="w-full max-w-[90vw] sm:max-w-xl">
        <CardContent className="pt-6 pb-8">
          <Suspense fallback={<Skeleton className="h-8 w-3/4 mx-auto" />}>
            <SearchParamsComponent onParamsChange={handleParamsChange} />
          </Suspense>
          {user && address && ready && jwt ? (
            isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
              </div>
            ) : invalidPasscode ? (
              <div className="text-center space-y-4">
                <h1 className={`text-3xl font-bold text-red ${k2d.className}`}>
                  Invalid Passcode
                </h1>
                <p className="text-grey-foreground">
                  The provided passcode is not valid. Please check and try
                  again.
                </p>
              </div>
            ) : invalidEvent ? (
              <div className="text-center space-y-4">
                <h1 className={`text-3xl font-bold text-red ${k2d.className}`}>
                  Invalid Event
                </h1>
                <p className="text-grey-foreground">
                  The specified event could not be found. Please check the event
                  details.
                </p>
              </div>
            ) : passcodeAlreadyUsed ? (
              <div className="text-center space-y-4">
                <h1 className={`text-3xl font-bold text-red ${k2d.className}`}>
                  Passcode Already Used
                </h1>
                {passcodeUsedByAnotherUser ? (
                  <div className="flex flex-col justify-center items-center sm:mt-9 mt-7 gap-3">
                    <p className="text-grey-foreground">
                      {"This passcode has been used already by someone else :("}
                    </p>
                    <RedirectButton text="Start Matching" />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center sm:mt-9 mt-7 gap-3">
                    <p className="text-grey-foreground">
                      {"You have already used this passcode, you're in! :)"}
                    </p>
                    <RedirectButton text="Start Matching" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <h1
                  className={`text-2xl sm:text-3xl font-bold text-center text-red ${k2d.className}`}
                >
                  Verify your attendance to
                </h1>
                <h1
                  className={`text-4xl sm:text-5xl font-bold text-center text-red-foreground mt-2 ${k2d.className}`}
                >
                  {eventName}
                </h1>
                {successfulVerification ? (
                  <div className="flex flex-col justify-center items-center mt-7 gap-3">
                    <h1
                      className={`text-2xl font-bold text-center text-green-500 ${k2d.className}`}
                    >
                      Congrats you have verified your attendance!
                    </h1>
                    <RedirectButton text="Start Matching" />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center sm:mt-9 mt-7 gap-3">
                    <button
                      className="bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-white py-3 px-10 rounded-lg text-lg font-semibold shadow-md"
                      onClick={handleVerify}
                      disabled={isVerifying}
                    >
                      Verify
                    </button>
                  </div>
                )}
              </>
            )
          ) : (
            <>
              {ready ? (
                <h1
                  className={`text-3xl font-bold text-center text-red ${k2d.className}`}
                >
                  Please log in to verify your attendance
                </h1>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-1/2 mx-auto" />
                </div>
              )}
              <div className="flex flex-col justify-center items-center mt-7 gap-3">
                <ConnectButton />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
