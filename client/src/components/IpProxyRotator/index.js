import { useQuery } from "@apollo/client";
import { GET_IPS_AND_PORTS } from "../../utils/queries";
import { createProxyObject, createProxiesArray } from "../../utils/helpers";
import { useState, useEffect } from "react";

const IpProxyRotator = ({ setProxies, proxyObject, setProxyObject }) => {
    // const [proxyObject, setProxyObject] = useState([]);
    // const [isProxyObject, setIsProxyObject] = useState(false);

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

            const difference = Math.abs(ipAddresses.length - portNumbers.length);

            (ipAddresses.length > portNumbers.length) ?
                ipAddresses.splice(((ipAddresses.length - difference)-1), difference) :
                portNumbers.splice(((portNumbers.length - difference)-1), difference);

            const newProxies = createProxiesArray(ipAddresses, portNumbers)

            setProxies(newProxies);

            // const newProxy = createProxyObject(proxyData)
            // setProxyObject(newProxy);
        };
    }, [loadingProxy, proxyData, setProxies]);

    return (
        <div>
            <h2>Proxies</h2>
        </div>
    );
};

export default IpProxyRotator;

// export {};
