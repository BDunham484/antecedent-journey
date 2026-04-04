import { GET_AUSTIN_TX_SHOW_DATA } from "../../../utils/queries";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";

const AustinTXScraper = ({
  setControlSwitch,
  setIsScraperLoading,
  setTotalScraped,
  setAustinScraper
}) => {
  const { loading, error, data } = useQuery(GET_AUSTIN_TX_SHOW_DATA, {
    fetchPolicy: 'network-only',
  });

  if (error) {
    console.log("❌❌❌❌ error: ", error);
    setControlSwitch(false);
  }

  useEffect(() => {
    if (loading) {
      setIsScraperLoading(true);
    }

    if (!loading && data) {
      console.log("🥷🥷🥷🥷 data: ", data);
      setIsScraperLoading(false);
      const concertData = data.getAustinTXShowData;
      setTotalScraped(concertData.length);
      setAustinScraper(concertData);
    }
  }, [data, loading, setAustinScraper, setIsScraperLoading, setTotalScraped]);

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

export default AustinTXScraper;
