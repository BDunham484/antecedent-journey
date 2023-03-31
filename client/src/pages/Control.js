import { useState, useEffect } from "react"
import { useLazyQuery, useQuery } from '@apollo/client'
import { AUSTIN_CONCERT_SCRAPER } from "@/utils/queries"
import { getTodaysDate } from '../utils/helpers';
import Header from "@/components/Header"
import Switch from 'react-switch'
import styles from '@/styles/Control.module.css'
import AustinScraper from "@/components/Scrapers/AustinScraper";
import AustinDbCleaner from "@/components/DB_Cleaners/AustinDbCleaner";




const ControlCenter = () => {
    const [controlSwitch, setControlSwitch] = useState(false);

    const handleControlSwitch = () => {
        console.log('SWITCHED');
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
        console.log(controlSwitch);
    }

    //get today's date with imported helper function
    var today = getTodaysDate();
    console.log("TODAY: " + today);

    return (
        <div>
            <Header />
            <main id={styles.main}>
                <div className={styles.container}>
                    <div className={styles.date}>{today}</div>
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
                            <AustinScraper />
                            <AustinDbCleaner today={today}/>
                        </div>
                    }

                </div>
            </main>
        </div>

    )
}

export default ControlCenter
