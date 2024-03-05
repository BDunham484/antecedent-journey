import { useQuery } from "@apollo/client";
import { GET_IPS_AND_PORTS } from "../../utils/queries";
import { createProxyObject, createProxiesArray } from "../../utils/helpers";
import { useState, useEffect } from "react";

const IpProxyRotator = ({ proxies, setProxies, proxyObject, setProxyObject }) => {
    // const [proxyObject, setProxyObject] = useState([]);
    const [isProxyObject, setIsProxyObject] = useState(false);

    const { loading: loadingProxy, data: proxyData } = useQuery(GET_IPS_AND_PORTS);

    useEffect(() => {
        console.log('🤞🤞🤞🤞 proxyData: ', proxyData);

        if (
            !loadingProxy &&
            (proxyData.ipProxyRotator[0].length > 0) &&
            (proxyData.ipProxyRotator[1].length > 0)
            ) 
            {
            const ipAddresses = [...proxyData.ipProxyRotator[0]];
            const portNumbers = [...proxyData.ipProxyRotator[1]];
            // console.log('🤞🤞🤞🤞 ipAddresses.length: ', ipAddresses.length);
            // console.log('🤞🤞🤞🤞 portNumbers.length: ', portNumbers.length);
            const difference = Math.abs(ipAddresses.length - portNumbers.length);
            // console.log('🤞🤞🤞🤞 difference: ', difference);
            (ipAddresses.length > portNumbers.length) ?
                ipAddresses.splice(((ipAddresses.length - difference)-1), difference) :
                portNumbers.splice(((portNumbers.length - difference)-1), difference);
            // console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 ipAddresses.length: ', ipAddresses.length);
            // console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 portNumbers.length: ', portNumbers.length);

            setProxies(createProxiesArray(ipAddresses, portNumbers));

            // const newProxy = createProxyObject(proxyData)
            // setProxyObject(newProxy);
        };
    }, [loadingProxy, proxyData, setProxies]);

    return (
        <div>
            <h2>proxyObject</h2>
            <p>protocol: {proxyObject.protocol}</p>
            <p>host: {proxyObject.host}</p>
            <p>port: {proxyObject.port}</p>
        </div>
    );
};

export default IpProxyRotator;

// export {};
