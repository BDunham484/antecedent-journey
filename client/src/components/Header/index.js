import { Link } from "react-router-dom";
// import Auth from '../../../../../legendary-journey/client/src/utils/auth';
import Auth from '../../utils/auth'
import { CubeAlt } from '@styled-icons/boxicons-regular';
// import Link from 'next/link';
import { useEffect, useState } from 'react';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const logout = event => {
        event.preventDefault();
        Auth.logout();
    };

    // Auth.loggedIn() & Auth.getToken() were causing errors because nextjs server-side rendering couldn't recognize localstorage.  moving the function to component and wrapping in useEffect fixed the issue.  May need to consider moving this setup to globalState and passing isLoggedIn state down as props/context to appropriate components.
    // useEffect(() => {
    //     const loggedIn = () => {
    //         const token = localStorage.getItem('id_token');
    //         if (!!token && !Auth.isTokenExpired(token)) {
    //             setIsLoggedIn(true);
    //         }
    //         // return !!token && !Auth.isTokenExpired(token);
    //     }

    //     loggedIn();
    // }, [])
    useEffect(() => {
        // const loggedIn = () => {
        //     const token = localStorage.getItem('id_token');


        //     // return !!token && !Auth.isTokenExpired(token);
        // }

        const token = Auth.loggedIn();

        if (token) {
            setIsLoggedIn(true);
        }
    }, [])


    return (
        <header>
            <div className="display-flex title-wrapper">
                <Link to="/">
                    <CubeAlt id="cube-icon" />
                </Link>

            </div>

            <nav id="navigation">
                {isLoggedIn ? (
                    <ul>
                        <li>
                            <Link to="/Control">Control</Link>
                        </li>
                        <li>
                            <Link to="/" onClick={logout}>
                                Logout
                            </Link>
                        </li>
                    </ul>
                ) : (
                    <ul>
                        <li>
                            <Link to="/Login">Login</Link>
                        </li>
                        <li>
                            <Link to="/signup">Signup</Link>
                        </li>
                    </ul>
                )}
            </nav>
        </header>
    );
};

export default Header;