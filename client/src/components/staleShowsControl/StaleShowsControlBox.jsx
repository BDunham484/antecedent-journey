import { useEffect, useState } from "react";
import Switch from 'react-switch';
import { switchTheme } from "../../definitions/constants";
import useStaleShowCleaner from "../../hooks/useStaleShowCleaner";

const StaleShowControlBox = () => {
    const { hasStale, isDeleting, execute } = useStaleShowCleaner();

    const [staleSwitch, setStaleSwitch] = useState(false);

    useEffect(() => {
        if (!isDeleting && staleSwitch) {
            setStaleSwitch(false);
        }
    }, [isDeleting, staleSwitch]);

    const handleStaleSwitch = () => {
        if (!staleSwitch) {
            setStaleSwitch(true);
            execute();
        }
    };

    return (
        <div className={`control-container${isDeleting ? ' stale-shimmer' : hasStale ? ' stale-alert' : ''}`}>
            <div className='control-header'>
                <div>
                    <h2>STALE SHOWS</h2>
                    <div>
                        {isDeleting
                            ? 'Deleting stale shows...'
                            : hasStale
                                ? 'Stale shows detected.'
                                : 'No stale shows detected.'}
                    </div>
                </div>
                <Switch
                    {...switchTheme}
                    onChange={handleStaleSwitch}
                    checked={staleSwitch}
                    disabled={!hasStale || isDeleting}
                />
            </div>
        </div>
    );
};

export default StaleShowControlBox;