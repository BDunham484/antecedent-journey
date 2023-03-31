import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_CONCERTS } from '@/utils/queries';
import Auth from '../utils/auth';


const TestPage = () => {
    const date = 'Fri Mar 24 2023';
    const { loading, data } = useQuery(ALL_CONCERTS);
    const concerts = data?.allConcerts || [];

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedIn = () => {
            const token = localStorage.getItem('id_token');
            if (!!token && !Auth.isTokenExpired(token)) {
                setIsLoggedIn(true);
            }
            // return !!token && !Auth.isTokenExpired(token);
        }

        loggedIn();
    }, [])


    if (loading) {
        <div>Loading...</div>
    }

    return (
        <div>
            {isLoggedIn ? (
                <div>
                    YUP
                    {concerts.map((concert, index) => (
                        <div key={index}>
                            {concert.artists}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    NOPE
                </div>
            )}
        </div>
    )
}

export default TestPage;
