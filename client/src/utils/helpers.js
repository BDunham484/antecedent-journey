export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const getTodaysDate = () => {
    const date = new Date().toDateString();
    return date;
}

export const setProxyObject = (data) => {
    let randomNumber = Math.floor(Math.random() * 100);
    const ipAddresses = data[0];
    const portNumbers = data[1]

    const host = `${ipAddresses[randomNumber]}`;
    const port = `${portNumbers[randomNumber]}`;
    const proxy = {
        protocol: 'http',
        host: host,
        port: port
    }

    console.log('🍔🍔🍔🍔 proxy: ', proxy);

    return proxy;
}

