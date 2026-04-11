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

export const formatConcertDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getUTCDay()]} ${months[date.getUTCMonth()]} ${String(date.getUTCDate()).padStart(2, '0')} ${date.getUTCFullYear()}`;
};

export const formatScrapeTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();

    const sameLocalDate = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    let dateLabel;
    if (sameLocalDate(date, now)) {
        dateLabel = 'Today';
    } else if (sameLocalDate(date, yesterday)) {
        dateLabel = 'Yesterday';
    } else {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateLabel = `${days[date.getDay()]} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()}`;
    }

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    return `${dateLabel} ${hours}:${minutes}${ampm}`;
};

export const createProxyObject = (data) => {
    let randomNumber = Math.floor(Math.random() * 100);

    const ipAddresses = data.ipProxyRotator[0];
    const portNumbers = data.ipProxyRotator[1]

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

export const createProxiesArray = (ipAddresses, portNumbers) => {
    const length = ipAddresses.length;
    const ipRegex = new RegExp(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/);
    const portRegex = new RegExp(/^\d{2,5}$/)
    const proxies = [];
    const hostGenerator = (ipAddresses) => {
        let randomNumber = Math.floor((Math.random() * length) - 1);
        const host = `${ipAddresses[randomNumber]}`;

        return host;
    }

    const portGenerator = (portNumbers) => {
        let randomNumber = Math.floor((Math.random() * length) - 1);
        const port = `${portNumbers[randomNumber]}`;

        return port
    }

    for (let i = 0; i < length; i++) {
        let host;
        let port;
        host = hostGenerator(ipAddresses);
        port = portGenerator(portNumbers);

        while (!ipRegex.test(host)) {
            host = hostGenerator(ipAddresses);
        }

        while (!portRegex.test(port)) {
            port = portGenerator(portNumbers);
        }
        // console.log('🥷🥷🥷🥷 regex test host: ', ipRegex.test(host));
        // console.log('🥷🥷🥷🥷 regex test port: ', portRegex.test(port));
        const proxy = {
            protocol: 'http',
            host: host,
            port: port
        }
        // console.log('🥷🥷🥷🥷 proxy: ', proxy);

        proxies.push(proxy);
    }

    // console.log('🥷🥷🥷🥷 proxies: ', proxies);

    return proxies;
};

