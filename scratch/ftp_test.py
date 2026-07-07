import socket
import ftplib
import sys

FTP_HOST = 'ftp.technovalearning.com'
FTP_USER = 'LWS-809138'
FTP_PASS = '3ndeadha'

def test_resolve():
    print(f"Resolving IP address for {FTP_HOST}...")
    try:
        ip = socket.gethostbyname(FTP_HOST)
        print(f"Resolved to: {ip}")
        return ip
    except Exception as e:
        print(f"Failed to resolve host: {e}")
        return None

def test_plain_ftp(ip):
    print(f"\nTesting plain FTP on {ip}...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(ip, 21, timeout=10)
        print("Connected to port 21!")
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully (Plain FTP)!")
        ftp.quit()
        return True
    except Exception as e:
        print(f"Plain FTP failed: {e}")
        return False

def test_ftps(ip):
    print(f"\nTesting Explicit FTPS (TLS) on {ip}...")
    try:
        ftp = ftplib.FTP_TLS()
        ftp.connect(ip, 21, timeout=10)
        print("Connected to port 21!")
        ftp.auth()
        print("TLS handshake completed!")
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully (FTPS)!")
        ftp.prot_p()
        print("Secure data connection enabled!")
        ftp.quit()
        return True
    except Exception as e:
        print(f"FTPS failed: {e}")
        return False

def main():
    ip = test_resolve()
    if not ip:
        sys.exit(1)
        
    plain_ok = test_plain_ftp(ip)
    if not plain_ok:
        ftps_ok = test_ftps(ip)
        if not ftps_ok:
            # Try connecting directly to ftp.lws.fr
            print("\nRetrying with ftp.lws.fr...")
            lws_ip = socket.gethostbyname("ftp.lws.fr")
            print(f"ftp.lws.fr IP: {lws_ip}")
            test_plain_ftp(lws_ip) or test_ftps(lws_ip)

if __name__ == "__main__":
    main()
