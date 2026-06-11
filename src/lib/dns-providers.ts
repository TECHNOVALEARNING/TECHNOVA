export interface DnsProvider {
  name: string;
  nsMatches: string[];
  logoUrl: string;
  loginUrl: string;
}

export const DNS_PROVIDERS: DnsProvider[] = [
  {
    name: "Cloudflare",
    nsMatches: ["cloudflare.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg",
    loginUrl: "https://dash.cloudflare.com/login"
  },
  {
    name: "Hostinger",
    nsMatches: ["hostinger.com", "dns-parking.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Hostinger_logo_with_name_2021.svg",
    loginUrl: "https://hpanel.hostinger.com/login"
  },
  {
    name: "OVH",
    nsMatches: ["ovh.net", "ovh.com", "anycast.me"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/OVHcloud_logo_2019.svg",
    loginUrl: "https://www.ovh.com/manager/"
  },
  {
    name: "GoDaddy",
    nsMatches: ["domaincontrol.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/GoDaddy_logo.svg",
    loginUrl: "https://sso.godaddy.com/"
  },
  {
    name: "Namecheap",
    nsMatches: ["namecheaphosting.com", "registrar-servers.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/Namecheap_logo.svg",
    loginUrl: "https://www.namecheap.com/myaccount/login/"
  },
  {
    name: "Ionos / 1&1",
    nsMatches: ["ui-dns.com", "1and1-dns.com", "1and1-dns.de", "1and1-dns.org", "ionos.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/IONOS_logo.svg",
    loginUrl: "https://login.ionos.fr/"
  },
  {
    name: "LWS",
    nsMatches: ["lws-hosting.com", "lwsdns.com"],
    logoUrl: "https://www.lws.fr/assets/images/logo-lws-n.svg",
    loginUrl: "https://panel.lws.fr/"
  },
  {
    name: "O2Switch",
    nsMatches: ["o2switch.net"],
    logoUrl: "https://www.o2switch.fr/images/logo-o2switch.svg",
    loginUrl: "https://www.o2switch.fr/espace-client/"
  },
  {
    name: "HostGator",
    nsMatches: ["hostgator.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/HostGator_logo.svg",
    loginUrl: "https://portal.hostgator.com/"
  },
  {
    name: "Bluehost",
    nsMatches: ["bluehost.com"],
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Bluehost_Logo.svg",
    loginUrl: "https://my.bluehost.com/"
  }
];

export async function detectDnsProvider(domain: string): Promise<DnsProvider | null> {
  try {
    const cleanDomain = domain.replace(/^www\./, '');
    const response = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=NS`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.Answer || data.Answer.length === 0) return null;

    // Concaténer toutes les réponses NS en minuscule pour la recherche
    const nsRecordsStr = data.Answer.map((a: any) => a.data.toLowerCase()).join(' ');

    for (const provider of DNS_PROVIDERS) {
      if (provider.nsMatches.some(match => nsRecordsStr.includes(match.toLowerCase()))) {
        return provider;
      }
    }
    
    return null; // Fournisseur non détecté ou inconnu
  } catch (error) {
    console.error("Erreur lors de la détection du DNS:", error);
    return null;
  }
}
