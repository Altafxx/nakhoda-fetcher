import axios from "axios";
import { getProxies } from "./proxy-manager";

const instance = async (n: number) => {
    const { proxies } = await getProxies();

    if (!proxies.length) {
        throw new Error('No proxies available');
    }

    // Use modulo to cycle through available proxies
    const proxy = proxies[n % proxies.length];

    return axios.create({
        proxy: {
            host: proxy.host,
            port: proxy.port,
            protocol: 'http',
            auth: {
                username: process.env.PROXY_USERNAME || '',
                password: process.env.PROXY_PASSWORD || ''
            }
        },
    });
};

export default instance;
