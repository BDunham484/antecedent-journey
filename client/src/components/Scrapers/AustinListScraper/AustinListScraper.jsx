import { AUSTIN_TX_LIST_SCRAPER } from "../../../utils/queries";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";

const AustinListScraper = ({
  setControlSwitch,
  setIsQueryLoading,
  setTotalScraped,
  setAustinScraper
}) => {
  const { loading, error, data } = useQuery(AUSTIN_TX_LIST_SCRAPER);

  if (error) {
    console.log("❌❌❌❌ error: ", error);
    setControlSwitch(false);
  }

  useEffect(() => {
    if (loading) {
      setIsQueryLoading(true)
    }

    if (!loading && data) {
      console.log("🥷🥷🥷🥷 data: ", data);
      setIsQueryLoading(false);
      const concertData = data.getAustinList;
      setTotalScraped(concertData.length);
      setAustinScraper(concertData);
    }
  }, [data, loading, setAustinScraper, setIsQueryLoading, setTotalScraped]);

  return (
    <>
      {error &&
        <div>
          <h2>{error}</h2>
          {error &&
            error.graphQLErrors.map(({ message }, i) => (
              <span key={i}>{message}</span>
            ))}
        </div>
      }
    </>
  );
};

export default AustinListScraper;
