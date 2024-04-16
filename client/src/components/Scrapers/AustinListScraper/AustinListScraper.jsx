import AustinListDbUpdater from "../../DB_Updaters/AustinListDbUpdater/AustinListDbUpdater";
import { AUSTIN_TX_LIST_SCRAPER } from "../../../utils/queries";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

const AustinListScraper = ({
  controlSwitch,
  setControlSwitch,
  concertCount,
  setConcertCount,
  setIsQueryLoading,
  setTotalScraped,
  setIsUpdaterRunning,
}) => {
  const [austinScraper, setAustinScraper] = useState([]);
  // const [totals, setTotals] = useState([]);

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
      // setTotals(concertData.length);
      setTotalScraped(concertData.length);
      setAustinScraper(concertData);
    }
  }, [data, loading, setIsQueryLoading, setTotalScraped]);

  return (
    <>
      <div>
        {/* <h3>SCRAPER: {!controlSwitch ? '🪦' : loading ? '⌛...' : '✅'}</h3> */}
        {/* <h3>SCRAPER: {loading ? '⌛...' : '✅'}</h3> */}
        {/* <div className="indent">Total: {totals ? totals : '🚫'}</div> */}
        {austinScraper && austinScraper.length > 0 && (
          <AustinListDbUpdater
            austinScraper={austinScraper}
            concertCount={concertCount}
            setConcertCount={setConcertCount}
            setControlSwitch={setControlSwitch}
            setIsUpdaterRunning={setIsUpdaterRunning}
          />
        )}
      </div>
      {(error) &&
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
