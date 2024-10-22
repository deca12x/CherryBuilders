import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SearchParamsComponent: React.FC<{ onParamsChange: (passcode: string | null, eventSlug: string | null) => void }> = ({
  onParamsChange,
}) => {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<{ passcode: string | null; eventSlug: string | null }>({
    passcode: null,
    eventSlug: null,
  });

  useEffect(() => {
    const passcode = searchParams.get("passcode");
    const eventSlug = searchParams.get("event-slug");
    setParams({ passcode, eventSlug });
    onParamsChange(passcode, eventSlug);
  }, [searchParams, onParamsChange]);

  return null;
};

export default SearchParamsComponent;
