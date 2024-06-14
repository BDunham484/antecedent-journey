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

  const addUpdate = useCallback(
    async (arr) => {
      setTimeout(() => setIsUpdaterRunning(true), 500);
      const results = [];
      console.log('✅✅✅✅ arr: ', arr);


      // changelog-start
      for (let i = 0; i <= 10; i++) {
      // for (let i = 0; i <= arr.length - 1; i++) {
        // changelog-end
        if (insertError) {
          break;
        }
        try {
          const addEvent = async () => {
            // changelog-start
            console.log('🍕🍕🍕🍕 arr[i]: ', arr[i]);
            // changelog-end
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
          }
        } catch (err) {
          setInsertError(err);
          console.log("❌❌❌❌");
          console.log("arr[i]: ", arr[i]);
          console.error(err);
          setControlSwitch(false);
        }

        if (i === arr.length - 1) {
          setControlSwitch(false);
          setResults(results);
        }
      }
    },
    [setIsUpdaterRunning, insertError, addConcert, setConcertCount, setControlSwitch]
  );

  useMemo(() => addUpdate(austinScraper), [austinScraper, addUpdate]);

  console.log("👁️👁️👁️👁️ concertCount: ", concertCount);

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
