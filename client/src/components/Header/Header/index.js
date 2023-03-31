// import { Link } from "react-router-dom";
import Auth from '../../utils/auth';
import { CubeAlt } from '@styled-icons/boxicons-regular';
import Link from 'next/link';
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
        console.log(token);
        if (token) {
            setIsLoggedIn(true);
        }
    }, [])


    return (
            <header>
                <div className="display-flex title-wrapper">
                    <Link href="/">
                        <h1 id="title">NOISEBX</h1>
                        <h1 id="title-mobile">NBX</h1>
                    </Link>
                    <CubeAlt id="cube-icon" />

                </div>

                <nav id="navigation">
                    {isLoggedIn ? (
                        <ul>
                            <li>
                                <Link href="/Control">Control</Link>
                            </li>
                            <li>
                                <Link href="/" onClick={logout}>
                                    Logout
                                </Link>
                            </li>
                        </ul>
                    ) : (
                        <ul>
                            <li>
                                <Link href="/Login">Login</Link>
                            </li>
                            <li>
                                <Link href="/signup">Signup</Link>
                            </li>
                        </ul>
                    )}
                </nav>
            </header>
    );
};

export default Header;