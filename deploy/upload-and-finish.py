#!/usr/bin/env python3
"""
Upload pre-built binaries to server and complete deployment.
Run this AFTER the Go build on server finishes (or kill it first).
"""
import paramiko
import os
import sys

HOST = "120.48.166.99"
USER = "root"
PASSWORD = "@Qrc2006825"
LOCAL_GO_BINARY = "F:/Bolg/bolg-api/bolg-api-linux"
LOCAL_ADMIN_BUILD = "F:/Bolg/admin/.next"

def run(ssh, cmd, timeout=120):
    print(f"  >>> {cmd[:100]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(out)
    if err:
        print("  STDERR:", err[:200])
    return out, err

def main():
    print("=" * 50)
    print("Connecting to server...")
    print("=" * 50)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    # 1. Kill any running Go build process
    print("\n[1/6] Stopping any existing Go build...")
    run(ssh, "pkill -f 'go build' 2>/dev/null; echo 'done'")

    # 2. Upload Go binary
    print("\n[2/6] Uploading Go binary (34MB)...")
    sftp = ssh.open_sftp()
    sftp.put(LOCAL_GO_BINARY, "/opt/bolg/bolg-api/bolg-api")
    sftp.chmod("/opt/bolg/bolg-api/bolg-api", 0o755)
    sftp.close()
    print("  Go binary uploaded.")

    # Verify
    run(ssh, "ls -la /opt/bolg/bolg-api/bolg-api")

    # 3. Build admin on server (with resource limits)
    print("\n[3/6] Building admin dashboard on server...")
    run(ssh, """
cd /opt/bolg/admin
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
npm config set registry https://registry.npmmirror.com
npm install 2>&1 | tail -5
""", timeout=300)

    run(ssh, """
cd /opt/bolg/admin
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export NODE_OPTIONS='--max-old-space-size=512'
nice -n 19 npm run build 2>&1 | tail -20
""", timeout=600)

    # 4. Ensure uploads directories exist
    print("\n[4/6] Creating upload directories...")
    run(ssh, "mkdir -p /opt/bolg/bolg-api/uploads/{works,general,categories}")

    # 5. Configure Nginx
    print("\n[5/6] Configuring Nginx...")
    run(ssh, "cp /opt/bolg/deploy/nginx.conf /etc/nginx/sites-available/bolg")
    run(ssh, "ln -sf /etc/nginx/sites-available/bolg /etc/nginx/sites-enabled/bolg")
    run(ssh, "rm -f /etc/nginx/sites-enabled/default")
    run(ssh, "nginx -t && systemctl reload nginx")

    # 6. Create systemd services and start
    print("\n[6/6] Creating systemd services...")

    # Go API service
    run(ssh, """
cat > /etc/systemd/system/bolg-api.service <<'UNIT'
[Unit]
Description=Bolg API Server
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bolg/bolg-api
ExecStart=/opt/bolg/bolg-api/bolg-api
Restart=always
RestartSec=5
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
UNIT
""")

    # Next.js admin service
    run(ssh, """
cat > /etc/systemd/system/bolg-admin.service <<'UNIT'
[Unit]
Description=Bolg Admin Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bolg/admin
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
UNIT
""")

    run(ssh, "systemctl daemon-reload")
    run(ssh, "systemctl enable bolg-api bolg-admin")
    run(ssh, "systemctl restart bolg-api bolg-admin")

    print("\n" + "=" * 50)
    print("Deployment Complete!")
    print("=" * 50)
    print("  Homepage:  http://qurit.cloud")
    print("  Admin:     http://qurit.cloud/admin")
    print("  API:       http://qurit.cloud/api/v1")
    print("  Works:     http://qurit.cloud/works")

    ssh.close()

if __name__ == "__main__":
    main()
