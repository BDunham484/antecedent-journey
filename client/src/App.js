import './App.css';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Control from './pages/Control'
import NoMatch from './pages/NoMatch';
import Signup from './pages/Signup';
import Header from './components/Header';
import Footer from './components/Footer';
import { ConcertProvider } from './utils/GlobalState';


// const SERVER_URL = 
//   process.env.NODE_ENV === 'production' ? 'https://whispering-retreat-35925.herokuapp.com' : 'http://localhost:3001'

//establish link to GraphQL server
const httpLink = createHttpLink({
  // uri: `${SERVER_URL}/graphql`,
  uri: '/graphql',
});

//middleware function that retrieves token and combines with exiisting HTTP Link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

//use ApolloClient() constructor to instantiate the Apollo Client instance/create connection to API endpoint
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

function App() {



  return (
    <ApolloProvider client={client}>
      <ConcertProvider>
        <Router>
          <div>
            <div>
              <Header />
              <main>
                <Routes>
                  <Route
                    path="/"
                    element={<Home />}
                  />
                  <Route
                    path="/login"
                    element={<Login />}
                  />
                  <Route
                    path="/signup"
                    element={<Signup />}
                  />
                  <Route 
                    path="/control"
                    element={<Control />}
                  />
                  <Route
                    path="*"
                    element={<NoMatch />}
                  />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </ConcertProvider>
    </ApolloProvider>
  );
}

export default App;
