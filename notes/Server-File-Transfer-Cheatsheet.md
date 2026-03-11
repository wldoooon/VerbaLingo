# Large File Transfer Cheatsheet

When moving gigabytes of data (like `.jsonl` files) to a VPS, sending thousands of small files or trying to send one uncompressed giant file is very slow because of network overhead and bandwidth limits.

The expert solution is to **compress the entire folder into one file** before sending.

## 1. Pack and Compress with `tar`

This command takes an entire folder and compresses it into a single `.tar.gz` file.

```powershell
tar -czvf english_data_export.tar.gz english_data/
```

**What the flags mean:**

- `tar`: The Tape Archive tool.
- `-c`: **C**reate a new archive.
- `-z`: Use g**Z**ip to highly compress the files (critical for shrinking text files).
- `-v`: **V**erbose mode (prints out each file name as it packs them so you can monitor progress).
- `-f`: Output **F**ile name (we are telling it to name the file `english_data_export.tar.gz`).
- `english_data/`: The target folder you want to compress.

## 2. Transfer using `scp`

Now you have a single, highly compressed file. Send it to your VPS using `scp` (Secure Copy Protocol).

```powershell
scp english_data_export.tar.gz your_username@your_vps_ip:~/
```

**What the parts mean:**

- `scp`: Secure Copy (uses SSH to send the data safely).
- `english_data_export.tar.gz`: The file we just created.
- `your_username@your_vps_ip`: Your VPS login credentials.
- `~/`: The destination on the VPS. `~/` means the user's home directory.

## 3. Unpack on the VPS

SSH into your VPS. Once you are logged in, use `tar` to unpack the file back into its original folder structure.

```bash
tar -xzvf english_data_export.tar.gz
```

**What the flags mean:**

- `tar`: The Tape Archive tool.
- `-x`: e**X**tract (unpack) the archive.
- `-z`: Unzip using g**Z**ip.
- `-v`: **V**erbose mode (see files as they drop onto your drive).
- `-f`: Target **F**ile name.

After running this, your `english_data` folder will appear on your VPS with all its contents completely intact!
