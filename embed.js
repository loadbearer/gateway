const scriptElement = document.currentScript;
const config = scriptElement.getAttribute('data-config');
async function checkDomains(domains) {
    for (let i = 0; i < domains.length; i++) {
        let domain = domains[i];
        let url = 'https://'+domain+'/ping?'+Math.random();
        let response = null;
        try{
            response = await fetch(url);
        } catch(e) {
            continue;
        }
        let data = await response.text();
        if(Math.abs(parseFloat(data) - (new Date().getTime() / 1000)) < 43200) {
            return domain;
        }
    }
    throw new Error("No valid domain found");
}
async function fetchGateway(sub) {
    let response = await fetch('https://cloudflare-dns.com/dns-query?name=gateway.loadbearer.io&type=TXT', {headers: {'Accept': 'application/dns-json'}});
    let data = await response.json();
    let domains = (data.Answer[0].data.substring(1, data.Answer[0].data.length - 1)).split(',');
    return await checkDomains(domains.map((d) => (sub||'manifest.')+d));
}
const frame = document.createElement('div');

fetchGateway('embed.').then((domain) => {
    frame.innerHTML = `<iframe src="https://${domain}/#${config}" marginheight="0" marginwidth="0" scrolling="no" allowfullscreen="yes" allow="encrypted-media; picture-in-picture; autoplay" width="100%" height="100%" frameborder="0"></iframe>`;
    scriptElement.parentNode.insertBefore(frame, scriptElement.nextSibling);
});
