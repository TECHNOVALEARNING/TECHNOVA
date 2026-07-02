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
    logoUrl: "https://logo.clearbit.com/cloudflare.com",
    loginUrl: "https://dash.cloudflare.com/login",
  },
  {
    name: "Hostinger",
    nsMatches: ["hostinger.com", "dns-parking.com"],
    logoUrl: "https://logo.clearbit.com/hostinger.com",
    loginUrl: "https://hpanel.hostinger.com/login",
  },
  {
    name: "OVH",
    nsMatches: ["ovh.net", "ovh.com", "anycast.me"],
    logoUrl: "https://logo.clearbit.com/ovh.com",
    loginUrl: "https://www.ovh.com/manager/",
  },
  {
    name: "GoDaddy",
    nsMatches: ["domaincontrol.com"],
    logoUrl: "https://logo.clearbit.com/godaddy.com",
    loginUrl: "https://sso.godaddy.com/",
  },
  {
    name: "Namecheap",
    nsMatches: ["namecheaphosting.com", "registrar-servers.com"],
    logoUrl: "https://logo.clearbit.com/namecheap.com",
    loginUrl: "https://www.namecheap.com/myaccount/login/",
  },
  {
    name: "Ionos / 1&1",
    nsMatches: ["ui-dns.com", "1and1-dns.com", "1and1-dns.de", "1and1-dns.org", "ionos.com"],
    logoUrl: "https://logo.clearbit.com/ionos.com",
    loginUrl: "https://login.ionos.fr/",
  },
  {
    name: "LWS",
    nsMatches: ["lws-hosting.com", "lwsdns.com"],
    logoUrl: "https://logo.clearbit.com/lws.fr",
    loginUrl: "https://panel.lws.fr/",
  },
  {
    name: "O2Switch",
    nsMatches: ["o2switch.net"],
    logoUrl: "https://logo.clearbit.com/o2switch.fr",
    loginUrl: "https://www.o2switch.fr/espace-client/",
  },
  {
    name: "HostGator",
    nsMatches: ["hostgator.com"],
    logoUrl: "https://logo.clearbit.com/hostgator.com",
    loginUrl: "https://portal.hostgator.com/",
  },
  {
    name: "Bluehost",
    nsMatches: ["bluehost.com"],
    logoUrl: "https://logo.clearbit.com/bluehost.com",
    loginUrl: "https://my.bluehost.com/",
  },
];

export async function detectDnsProvider(domain: string): Promise<DnsProvider | null> {
  try {
    const cleanDomain = domain.replace(/^www\./, "");
    const response = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=NS`);

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.Answer || data.Answer.length === 0) return null;

    // Concaténer toutes les réponses NS en minuscule pour la recherche
    const nsRecordsStr = data.Answer.map((a: any) => a.data.toLowerCase()).join(" ");

    for (const provider of DNS_PROVIDERS) {
      if (provider.nsMatches.some((match) => nsRecordsStr.includes(match.toLowerCase()))) {
        return provider;
      }
    }

    return null; // Fournisseur non détecté ou inconnu
  } catch (error) {
    console.error("Erreur lors de la détection du DNS:", error);
    return null;
  }
}
