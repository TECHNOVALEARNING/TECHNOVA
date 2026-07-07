import ftplib
import os
import sys

FTP_HOST = '83.229.19.113' # Connect directly to LWS IP
FTP_USER = 'techn2807553'
FTP_PASS = 'gFQDv+2HUfj-hPq'

def main():
    print(f"Connecting to {FTP_HOST}...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, 21, timeout=15)
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully!")
    except Exception as e:
        print(f"Login failed: {e}")
        # Try TLS
        print("Retrying with FTPS...")
        try:
            ftp = ftplib.FTP_TLS()
            ftp.connect(FTP_HOST, 21, timeout=15)
            ftp.auth()
            ftp.login(FTP_USER, FTP_PASS)
            ftp.prot_p()
            print("Logged in successfully via FTPS!")
        except Exception as e2:
            print(f"FTPS Login failed: {e2}")
            sys.exit(1)

    print("\nListing target directory:")
    root_files = []
    ftp.dir(root_files.append)
    for line in root_files:
        print(line)

    # Determine where the public directory is
    dirs = [line.split()[-1] for line in root_files if line.startswith('d') or '<DIR>' in line]
    print("\nDetected directories:", dirs)
    
    target_dir = 'lws.technovalearning.com'

    print(f"\nTargeting folder: {target_dir}")
    if target_dir != '/':
        ftp.cwd(target_dir)

    local_file = r"C:\Users\user\Downloads\TECHNOVA\scratch\upload.php"
    remote_filename = "upload.php"

    print(f"Uploading {local_file} as {remote_filename}...")
    try:
        with open(local_file, "rb") as file_handle:
            ftp.storbinary(f"STOR {remote_filename}", file_handle)
        print("Upload completed successfully!")
    except Exception as e:
        print(f"Upload failed: {e}")
        ftp.quit()
        sys.exit(1)

    # Verify upload
    print("\nVerifying files in target folder:")
    folder_files = []
    ftp.dir(folder_files.append)
    uploaded_found = False
    for line in folder_files:
        print(line)
        if remote_filename in line:
            uploaded_found = True
            
    if uploaded_found:
        print("\nSUCCESS: upload.php is visible in the directory listing.")
    else:
        print("\nWARNING: upload.php was not found in listing after upload.")

    ftp.quit()

if __name__ == "__main__":
    main()
