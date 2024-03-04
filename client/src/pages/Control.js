import { useState } from "react"
import { getTodaysDate } from '../utils/helpers';
import Switch from 'react-switch'
import AustinScraper from "../components/Scrapers/AustinScraper";
import AustinDbCleaner from '../components/DB_Cleaners/AustinDbCleaner'
import IpProxyRotator from "../components/IpProxyRotator";



const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);

    const handleControlSwitch = () => {
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
    }

    //get today's date with imported helper function
    var today = getTodaysDate();

    console.log('butts')

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
                            {/* <IpProxyRotator /> */}
                            <AustinScraper setControlSwitch={setControlSwitch} />
                            <AustinDbCleaner today={today}/>
                        </div>
                    }
                </div>
            </main>
        </div>

    )
}

export default Control;
