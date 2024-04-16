import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@apollo/client";
import { ADD_CONCERT } from "../../../utils/mutations";

const AustinListDbUpdater = ({
  austinScraper,
  concertCount,
  setConcertCount,
  setControlSwitch,
  setIsUpdaterRunning,
}) => {
  const [addConcert] = useMutation(ADD_CONCERT);
  const [results, setResults] = useState([]);

  const addUpdate = useCallback(
    async (arr) => {
      setIsUpdaterRunning(true);
      const results = [];

      for (let i = 0; i <= arr.length - 1; i++) {
        try {
          const addEvent = async () => {
            const response = await addConcert({
              variables: { ...arr[i] },
            });
            if (response) {
              return response;
            }
          };
          const result = await addEvent();
          if (result) {
            results.push(result);
            setConcertCount(results.length);
            console.log("👁️👁️👁️👁️ results: ", results);
          }
        } catch (err) {
          console.log("❌❌❌❌");
          console.log("arr[i]: ", arr[i]);
          console.error(err);
        }

        if (i === arr.length - 1) {
          setControlSwitch(false);
          setResults(results);
        }
      }
    },
    [addConcert, setControlSwitch, setConcertCount, setIsUpdaterRunning]
  );

  useMemo(() => addUpdate(austinScraper), [austinScraper, addUpdate]);

  console.log("👁️👁️👁️👁️ concertCount: ", concertCount);

  // const printUpdaterResults = async () => {
  //   const a = await updaterResults;

  //   if (a && a.length) {
  //     let mapResult = a.map((b) => {
  //       return b.length;
  //     });
  //     const sum = mapResult.reduce((total, amount) => total + amount);
  //     setTotals((current) => [...current, sum]);
  //     setConcertsAdded(sum);
  //     return sum;
  //   }
  // };

  // printUpdaterResults();
  return (
    // <div className="dbUpdater-wrapper">
    //   <h3>UPDATER: ✅</h3>
    //   <div className="indent">Total: {concertCount}</div>
    // </div>
    <></>
  );
};

export default AustinListDbUpdater;
