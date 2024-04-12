import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_CONCERT } from "../../../utils/mutations";

const AustinListDbUpdater = ({
  austinScraper,
  setTotals,
  totalConcerts,
  setControlSwitch,
}) => {
  const [addConcert] = useMutation(ADD_CONCERT);
  const [concertsAdded, setConcertsAdded] = useState(0);

  useEffect(() => {
    const addUpdate = async (arr) => {
      const addedEvents = [];

      for (let i = 0; i <= arr.length - 1; i++) {
        try {
          const addEvent = async () => {
            const response = await addConcert({
              variables: { ...arr[i] },
            });
            if (response) {
              console.log("🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 response: ", response.data.addConcert);

              return response;
            }
          };
          const result = await addEvent();
          if (result) {
            addedEvents.push(result);
          }
        } catch (err) {
          console.log("❌❌❌❌");
          console.log("arr[i]: ", arr[i]);
          console.error(err);
        }

        if (i === arr.length - 1) {
          setControlSwitch(false);
        }
      }

      console.log("🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 addedEvents: ", addedEvents);
    };

    let updaterResults;
    if (austinScraper) {
      updaterResults = addUpdate(austinScraper);
    }

    console.log("🤞🤞🤞🤞 updaterResults: ", updaterResults);

    const printUpdaterResults = async () => {
      const a = await updaterResults;

      if (a && a.length) {
        let mapResult = a.map((b) => {
          return b.length;
        });
        const sum = mapResult.reduce((total, amount) => total + amount);
        setTotals((current) => [...current, sum]);
        setConcertsAdded(sum);
        return sum;
      }
    };

    printUpdaterResults();
  }, [
    addConcert,
    austinScraper,
    setTotals,
    setConcertsAdded,
    setControlSwitch,
  ]);

  return (
    <div className="dbUpdater-wrapper">
      <h3>UPDATER: ✅</h3>
      <div className="indent">Updated: {concertsAdded}</div>
      {/* <div className='indent'>Total: {totalConcerts}</div> */}
    </div>
  );
};

export default AustinListDbUpdater;
