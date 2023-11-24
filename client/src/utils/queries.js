import { gql } from '@apollo/client';

export const GET_TODAYS_CONCERTS = gql`
    query concerts($date: String) {
        concerts(date: $date) {
            artists
            description
            date
            times
            venue
            address
            phone
            website
            email
            ticketLink
        }
    }
`;

export const GET_CONCERTS_BY_DATE = gql`
    query concertsFromDb($date: String!) {
        concertsFromDb(date: $date) {
            _id
            artists
            customId
            date
            times
            venue
            address
            address2
            phone
            website
            email
            ticketLink
        }
    }
`;

export const GET_URL_ARRAY = gql`
    query getUrlArray($date: String!) {
        getUrlArray(date: $date) 
    }
`;

export const AUSTIN_CONCERT_SCRAPER = gql`
    query austinConcertScraper($date: String) {
        austinConcertScraper(date: $date) {
            customId
            artists
            date
            times
            venue
            address
            address2
            phone
            website
            email
            ticketLink
        }
    }
`;

export const AUSTIN_TX_CONCERT_SCRAPER = gql`
    query austinTxConcertScraper($urlData: [String], $date: String) {
        austinTxConcertScraper(urlData: $urlData, date: $date) {
            customId
            artists
            date
            times
            venue
            address
            address2
            phone
            website
            email
            ticketLink
        }
    }
`;

export const QUERY_USER_CONCERTS = gql`
    query userConcerts($username: String) {
        userConcerts(username: $username) {
            _id
            artists
            artistsLink
            description
            date
            times
            venue
            address
            phone
            website
            email
            ticketLink
        }
    }
`;

export const QUERY_USER = gql`
    query user($username: String!) {
        user(username: $username) {
            _id
            username
            email
            concertCount
            concerts {
                _id
                artists
                artistsLink
                description
                date
                times
                venue
                address
                phone
                website
                email
                ticketLink
            }
            friendCount
            friends {
                _id
                username
            }
            receivedRequests {
                _id
                username
            }
            requestCount
            sentRequests {
                _id
                username
            }
            blockedUsers {
                _id
            }
        }
    }
`;

export const QUERY_ME = gql`
    {
        me {
            _id
            username
            email
            concertCount
            concerts {
                _id
                artists
                artistsLink
                description
                date
                times
                venue
                address
                phone
                website
                email
                ticketLink
            }
            requestCount
            friendCount
            friends {
                _id
                username
            }
            receivedCount
            receivedRequests {
                _id
                username
            }
            sentCount
            sentRequests {
                _id
                username
            }
            blockedCount
            blockedUsers {
                _id
                username
            }
        }
    }
`;

export const QUERY_ME_BASIC = gql`
    {
        me {
            _id
            username
            email
            concertCount
            concerts {
                _id
                artists
            }
            friendCount
            friends {
                _id
                username
            }
        }
    }
`;

export const GET_YESTERDAYS_CONCERTS = gql`
    query getYesterdaysConcerts($date: String!) {
        getYesterdaysConcerts(date: $date) {
            _id
            customId
            artists
            address
            phone
            venue
            date
            times
            email
            website
            ticketLink
            artistsLink
        }
    }
`;

export const GET_CONCERT_BY_ID = gql`
    query concert($concertId: ID!) {
        concert(concertId: $concertId) {
            _id
            customId
            artists
            artistsLink
            date
            times
            venue
            address
            phone
            website
            email
            ticketLink
            yes {
                _id
            }
            no {
                _id
            }
            maybe {
                _id
            }
        }
    }
`;

export const ALL_CONCERTS = gql`
query allConcerts {
    allConcerts {
        date
        artists
    }
}
`;