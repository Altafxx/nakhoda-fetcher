import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import instance from './axios-instance';

const PROXY_FILE_PATH = path.join(process.cwd(), 'src/config/proxies.json');
const WEBSHARE_API_TOKEN = process.env.WEBSHARE_API_TOKEN;
const DISCORD_PROXY_BOT = process.env.DISCORD_PROXY_BOT;

interface ProxyResponse {
    proxy_address: string;
    port: number;
}

interface ProxyConfig {
    lastUpdated: string;
    proxies: Array<{
        host: string;
        port: number;
    }>;
}

const sendDiscordNotification = async (content: string) => {
    try {
        if (!DISCORD_PROXY_BOT) return;
        await axios.post(DISCORD_PROXY_BOT, { content });
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
    }
};

export async function getProxies(): Promise<ProxyConfig> {
    try {
        const data = await fs.readFile(PROXY_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return { lastUpdated: '', proxies: [] };
    }
}

export async function refreshProxies(): Promise<void> {
    try {
        const currentConfig = await getProxies();
        const oldProxies = currentConfig.proxies;

        const response = await axios.get(
            'https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=10',
            {
                headers: {
                    'Authorization': `Token ${WEBSHARE_API_TOKEN}`
                }
            }
        );

        const newProxies = response.data.results.map((proxy: ProxyResponse) => ({
            host: proxy.proxy_address,
            port: proxy.port
        }));

        const proxyConfig: ProxyConfig = {
            lastUpdated: new Date().toISOString(),
            proxies: newProxies
        };

        await fs.writeFile(PROXY_FILE_PATH, JSON.stringify(proxyConfig, null, 2));

        // Generate change report
        const changes = [];
        for (let i = 0; i < Math.max(oldProxies.length, newProxies.length); i++) {
            const oldProxy = oldProxies[i];
            const newProxy = newProxies[i];

            if (!oldProxy && newProxy) {
                changes.push(`➕ Added new proxy #${i}: ${newProxy.host}:${newProxy.port}`);
            } else if (oldProxy && !newProxy) {
                changes.push(`➖ Removed proxy #${i}: ${oldProxy.host}:${oldProxy.port}`);
            } else if (oldProxy && newProxy && (oldProxy.host !== newProxy.host || oldProxy.port !== newProxy.port)) {
                changes.push(`🔄 Replaced proxy #${i}:\n   Old: ${oldProxy.host}:${oldProxy.port}\n   New: ${newProxy.host}:${newProxy.port}`);
            }
        }

        if (changes.length > 0) {
            const message = `📢 Proxy List Updated ${new Date().toISOString()}\n\n${changes.join('\n')}`;
            await sendDiscordNotification(message);
        } else {
            await sendDiscordNotification(`ℹ️ Proxy refresh completed, but no changes were necessary (${new Date().toISOString()})`);
        }

        console.log('Proxies refreshed successfully');
    } catch (error) {
        const errorMessage = `❌ Failed to refresh proxies: ${error instanceof Error ? error.message : 'Unknown error'}`;
        await sendDiscordNotification(errorMessage);
        console.error('Failed to refresh proxies:', error);
    }
}

export async function checkAllProxies() {
    try {
        const { proxies } = await getProxies();
        const results = await Promise.all(
            proxies.map(async (proxy, index) => {
                try {
                    const axiosInstance = await instance(index);
                    const response = await axiosInstance.get('https://ifconfig.me/ip');
                    return {
                        proxy: `${proxy.host}:${proxy.port}`,
                        isWorking: response.status === 200,
                        currentIP: response.data
                    };
                } catch (error) {
                    return {
                        proxy: `${proxy.host}:${proxy.port}`,
                        isWorking: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            })
        );
        return results;
    } catch (error) {
        throw new Error('Failed to check proxies: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}
