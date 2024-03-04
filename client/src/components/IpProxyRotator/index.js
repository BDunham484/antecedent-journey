// import { useQuery } from "@apollo/client";
// import { GET_IPS_AND_PORTS } from "../../utils/queries";

// const IpProxyRotator = () => {
//     const { loading, data: { ipProxyRotator } } = useQuery(GET_IPS_AND_PORTS);

//     let randomNumber = Math.floor(Math.random() * 100);
//     const ipAddresses = ipProxyRotator[0];
//     const portNumbers = ipProxyRotator[1]

//     // let proxy = `http://${ipAddresses[randomNumber]}:${portNumbers[randomNumber]}`;

//     const host = `${ipAddresses[randomNumber]}`;
//     const port = `${portNumbers[randomNumber]}`;
//     const proxy = {
//         protocol: 'http',
//         host: host,
//         port: port
//     }

//     console.log('🍔🍔🍔🍔 proxy: ', proxy);
//     // console.log('🍔🍔🍔🍔 ipProxyRotator: ', ipProxyRotator);
//     // console.log('🍔🍔🍔🍔 ipAddresses: ', ipAddresses);
//     // console.log('🍔🍔🍔🍔 portNumbers: ', portNumbers);

//     return proxy;
// };

// export default IpProxyRotator;

export {};
