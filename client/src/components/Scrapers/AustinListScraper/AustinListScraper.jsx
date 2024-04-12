import AustinListDbUpdater from "../../DB_Updaters/AustinListDbUpdater/AustinListDbUpdater";
import { AUSTIN_TX_LIST_SCRAPER } from "../../../utils/queries";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

const AustinListScraper = ({ setControlSwitch, concertCount, setConcertCount }) => {
  const [austinScraper, setAustinScraper] = useState([]);
  // const [totals, setTotals] = useState([]);

  const { loading, error, data } = useQuery(AUSTIN_TX_LIST_SCRAPER);

  if (error) {
    console.log("❌❌❌❌ error: ", error);
    setControlSwitch(false);
  }

  useEffect(() => {
    if (!loading && data) {
      console.log("🥷🥷🥷🥷 data: ", data);
      const concertData = data.getAustinList;
      setAustinScraper(concertData);
    }
  }, [data, loading]);

  // let totalConcerts;

  // if (totals.length > 0) {
  //   totalConcerts = totals.reduce((total, amount) => total + amount);
  // }

  return (
    <>
      <div>
        <h3>SCRAPER: ✅</h3>
        {austinScraper && austinScraper.length > 0 && (
          <AustinListDbUpdater
            austinScraper={austinScraper}
            concertCount={concertCount}
            setConcertCount={setConcertCount}
            setControlSwitch={setControlSwitch}
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
