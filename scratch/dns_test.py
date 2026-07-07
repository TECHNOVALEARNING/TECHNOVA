import socket

def main():
    for host in ['technovalearning.com', 'www.technovalearning.com', 'ftp.technovalearning.com']:
        try:
            ips = socket.getaddrinfo(host, None)
            ip_set = {ip[4][0] for ip in ips}
            print(f"{host}: {ip_set}")
        except Exception as e:
            print(f"{host} error: {e}")

if __name__ == "__main__":
    main()
