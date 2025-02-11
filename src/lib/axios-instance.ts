import axios from "axios";

const HOST = process.env.PROXY_HOST?.split(',')
const PORT = process.env.PROXY_PORT?.split(',')
const USERNAME = process.env.PROXY_USERNAME
const PASSWORD = process.env.PROXY_PASSWORD

if (!HOST || !PORT || !USERNAME || !PASSWORD) {
    throw new Error('Proxy credentials not found')
}

const instance = (n: number) => axios.create({
    proxy: {
        host: HOST[n],
        port: parseInt(PORT[n]),
        protocol: 'http',
        auth: {
            username: USERNAME,
            password: PASSWORD,
        }
    },
});

export default instance;