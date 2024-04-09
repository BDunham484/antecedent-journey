import { useState, useEffect } from "react"
import { getTodaysDate } from '../utils/helpers';
import Switch from 'react-switch'
import AustinScraper from "../components/Scrapers/AustinScraper";
import AustinDbCleaner from '../components/DB_Cleaners/AustinDbCleaner'
import IpProxyRotator from "../components/IpProxyRotator";
import AustinListScraper from "../components/Scrapers/AustinListScraper/AustinListScraper";



const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);
    const [proxies, setProxies] = useState([]);
    const [proxyObject, setProxyObject] = useState([]);

    const handleControlSwitch = () => {
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
    }

    //get today's date with imported helper function
    var today = getTodaysDate();

    // useEffect(() => {
    //     console.log('🎃🎃🎃🎃 Control.js proxies: ', proxies);
    //     console.log('🎃🎃🎃🎃 Control.js proxyObject: ', proxyObject);
    // }, [proxies]);

    return (
        <div>
            <main id={'control-main'}>
                <div className={'control-container'}>
                    <h2>AUSTIN</h2>
                    <div className={'control-date'}>{today}</div>
                    <Switch
                        onChange={handleControlSwitch}
                        checked={controlSwitch}
                        offColor={'#525050'}
                        onColor={'#525050'}
                        offHandleColor={'#383737'}
                        onHandleColor={'#383737'}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow={'#eee3d0'}
                        activeBoxShadow={'#eee3d0'}
                    />
                    {controlSwitch &&
                        <div>
                            {/* <IpProxyRotator 
                                setProxies={setProxies}
                                proxyObject={proxyObject}
                                setProxyObject={setProxyObject}
                            /> */}
                            {/* {(Object.values(proxyObject).length > 0) &&
                            <AustinScraper setControlSwitch={setControlSwitch} proxies={proxies} proxyObject={proxyObject} />} */}
                            <AustinListScraper setControlSwitch={setControlSwitch} />
                            {/* <AustinDbCleaner today={today}/> */}
                        </div>
                    }
                </div>
            </main>
        </div>

    )
}

export default Control;
