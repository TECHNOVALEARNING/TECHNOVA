import ftplib
import sys

FTP_HOST = '216.198.79.1'
FTP_USER = 'LWS-809138'
FTP_PASS = '3ndeadha'

def main():
    print(f"Connecting to LWS IP {FTP_HOST}...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, 21, timeout=10)
        print("Connected successfully to port 21!")
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully via plain FTP!")
        
        root_files = []
        ftp.dir(root_files.append)
        print("\nListing LWS root directory:")
        for line in root_files:
            print(line)
            
        ftp.quit()
    except Exception as e:
        print(f"Connection to plain FTP failed: {e}")
        
        # Try FTPS (explicit TLS)
        print("\nTrying FTPS...")
        try:
            ftp = ftplib.FTP_TLS()
            ftp.connect(FTP_HOST, 21, timeout=10)
            ftp.auth()
            ftp.login(FTP_USER, FTP_PASS)
            print("Logged in successfully via FTPS!")
            
            root_files = []
            ftp.dir(root_files.append)
            print("\nListing LWS root directory (FTPS):")
            for line in root_files:
                print(line)
                
            ftp.quit()
        except Exception as e2:
            print(f"FTPS connection failed: {e2}")

if __name__ == "__main__":
    main()
