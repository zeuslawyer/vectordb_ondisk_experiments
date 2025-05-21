# Setting Up Git Commit Signing with GPG on Windows

This tutorial walks you through the process of setting up Git commit signing using GPG on your Windows system, ensuring your commits on platforms like GitHub are marked as "Verified".

## 1. Key Concepts

* **Commit Signing:** Cryptographically signing your Git commits to verify their origin and integrity.
* **GPG (GNU Privacy Guard):** A tool for encryption and signing, used here to generate and manage your signing keys.
* **SSH Keys:** Used for secure authentication with remote repositories (not directly for signing commits).

## 2. Prerequisites

* **Git for Windows:** You should have Git installed on your Windows machine.
* **GPG for Windows (Gpg4win):** We'll install this to manage our GPG keys.

## 3. Installing Gpg4win

1.  Go to the Gpg4win website ([https://www.gpg4win.org/](https://www.gpg4win.org/)).
2.  Download the installer.
3.  Run the installer and follow the on-screen instructions. Ensure that "GPA" (GNU Privacy Assistant) is selected during the installation, as it provides a graphical interface for key management.

## 4. Generating a New GPG Key Pair

1.  Open GPA (it should be in your Start Menu under "GNU Privacy Guard").
2.  Go to "Key" in the menu bar and select "Generate New Key".
3.  Follow the prompts:
    * Enter your **Name**.
    * Enter your **Email address** (the one associated with your GitHub account).
    * You can optionally add a comment.
    * Click "Next".
    * Choose a strong **passphrase** and enter it. Click "OK".
    * Move your mouse around as instructed to generate randomness.
    * Once the key is generated, you might be asked to create a revocation certificate. It's a good idea to do this and store it safely.

## 5. Listing Your GPG Keys and Finding Your Key ID

1.  In GPA, your newly generated key should be listed.
2.  To see the Key ID, right-click on your key and select "Properties".
3.  The Key ID is usually displayed in the format `XXXXXXXXXXXXXXX`. You'll need this later. You can also see a longer format. For Git configuration, either should work, but let's use the shorter one for now.

   Alternatively, you can use the command line. Open `cmd` or PowerShell and run:
   ```bash
   gpg --list-secret-keys --keyid-format LONG
   ```
   Look for the `sec` line, and the Key ID is the long hexadecimal number.

## 6. Telling Git About Your GPG Key

1.  Open Git Bash.
2.  Configure Git to use your GPG signing key globally:
    ```bash
    git config --global user.signingkey <your_key_id>
    ```
    Replace `<your_key_id>` with the Key ID you found (e.g., `ABC123DEF4567890`).

3.  Tell Git which program to use for signing. On Windows with Gpg4win, this is usually `gpg`:
    ```bash
    git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
    ```
    (Adjust the path if your Gpg4win installation is different).

## 7. Adding Your GPG Key to GitHub

1.  Export your public GPG key in the ASCII armored format. In Git Bash:
    ```bash
    gpg --armor --export <your_email_address>
    ```
    Replace `<your_email_address>` with the email you used when generating the key.
2.  Copy the entire output, starting from `-----BEGIN PGP PUBLIC KEY BLOCK-----` and ending with `-----END PGP PUBLIC KEY BLOCK-----`.
3.  Go to your GitHub account settings:
    * Click your profile picture, then "Settings".
    * In the sidebar, click "SSH and GPG keys".
    * Click "New GPG key" (or "Add new GPG key").
    * Paste your public key into the "Key" field.
    * Click "Add GPG key".

## 8. Configuring Git to Automatically Sign Commits (Optional but Recommended)

1.  To automatically sign all your commits, run