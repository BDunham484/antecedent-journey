import { useState } from "react"
// import { useLazyQuery, useQuery } from '@apollo/client'
// import { AUSTIN_CONCERT_SCRAPER } from "@/utils/queries"
import { getTodaysDate } from '../utils/helpers';
import Switch from 'react-switch'
// import styles from '@/styles/Control.module.css'
// import AustinScraper from "@/components/Scrapers/AustinScraper";
import AustinScraper from "../components/Scrapers/AustinScraper";
// import AustinDbCleaner from "@/components/DB_Cleaners/AustinDbCleaner";
import AustinDbCleaner from '../components/DB_Cleaners/AustinDbCleaner'




const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);

    const handleControlSwitch = () => {
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
    }

    //get today's date with imported helper function
    var today = getTodaysDate();

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
