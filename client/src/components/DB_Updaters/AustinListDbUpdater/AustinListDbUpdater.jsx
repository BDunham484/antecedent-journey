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
  const [insertError, setInsertError] = useState(undefined);
  const [results, setResults] = useState([]);

  console.log('✅✅✅✅ austinScraper: ', austinScraper);

  const addUpdate = useCallback(async (showData) => {
      setTimeout(() => setIsUpdaterRunning(true), 500);
      const results = [];
      console.log('✅✅✅✅ showData: ', showData);
      for (let i = 0; i <= showData.length - 1; i++) {
        if (insertError) {
          break;
        }
        try {
          const addEvent = async () => {
            const response = await addConcert({
              variables: { ...showData[i] },
            });
            if (response) {
              return response;
            }
          };
          const result = await addEvent();
          if (result) {
            results.push(result);
            setConcertCount(results.length);
          }
        } catch (err) {
          setInsertError(err);
          console.log("❌❌❌❌");
          console.log("showData[i]: ", showData[i]);
          console.error(err);
          setControlSwitch(false);
        }

        if (i === showData.length - 1) {
          setControlSwitch(false);
          setResults(results);
        }
      }
    },
    [insertError, addConcert, setConcertCount, setControlSwitch, setIsUpdaterRunning]
  );

  // changelog-start
  // const testData = useMemo(() => austinScraper[0], [austinScraper]);
  // const updates = useMemo(() => addUpdate([testData]), [addUpdate, testData]);
  // const updates = useMemo(async () => await addUpdate([testData]), [addUpdate, testData]);
  
  // useMemo(() => addUpdate([testData]), [testData, addUpdate]);
  useMemo(() => addUpdate(austinScraper), [austinScraper, addUpdate]);
  // changelog-end

  // if (updates) {
  //   console.log("👁️👁️👁️👁️ updates: ", updates);
  //   setControlSwitch(false);
  //   setResults(updates);
  // }

  console.log("👁️👁️👁️👁️ concertCount: ", concertCount);
  console.log("👁️👁️👁️👁️ results: ", results);

  return (
    <>
      {insertError &&
        <div>
          <h2>{insertError}</h2>
          {insertError &&
            insertError.graphQLErrors.map(({ message }, i) => (
              <span key={i}>{message}</span>
            ))}
        </div>
      }
    </>
  );
};

export default AustinListDbUpdater;
