````markdown
# Setting Up Git Commit Signing with GPG on macOS

This tutorial walks you through the process of setting up Git commit signing using GPG on your macOS system, ensuring your commits on platforms like GitHub are marked as "Verified".

## 1. Key Concepts

* **Commit Signing:** Cryptographically signing your Git commits to verify their origin and integrity.
* **GPG (GNU Privacy Guard):** A tool for encryption and signing, used here to generate and manage your signing keys.
* **SSH Keys:** Used for secure authentication with remote repositories (not directly for signing commits).

## 2. Prerequisites

* **Homebrew:** A package manager for macOS (you already have this installed).

## 3. Installing GPG

1.  Open your Terminal.
2.  Run the command to install GPG:
    ```bash
    brew install gpg
    ```

## 4. Generating a New GPG Key Pair

1.  Run the following command:
    ```bash
    gpg --full-generate-key
    ```
2.  Follow the prompts:
    * Choose `RSA and RSA (default)`.
    * Enter keysize `4096`.
    * Decide on key validity (or press Enter for no expiration).
    * Enter your **Real name**.
    * Enter your **Email address** (the one associated with your GitHub account).
    * Add an optional **Comment**.
    * Confirm your details.
    * Create a strong **passphrase**.

## 5. Listing Your GPG Keys and Finding Your Key ID

1.  List your secret keys to find the key ID you'll use for Git:
    ```bash
    gpg --list-secret-keys --keyid-format LONG
    ```
2.  Look for the `sec` line. The key ID you need is the long hexadecimal number after `rsa4096/`. For example: `38BAB943F3C286E7`.

## 6. Telling Git About Your GPG Key

1.  Configure Git to use your GPG signing key globally:
    ```bash
    git config --global user.signingkey <your_key_id>
    ```
    Replace `<your_key_id>` with the key ID you found in the previous step (e.g., `38BAB943F3C286E7`).

2.  Tell Git which program to use for signing:
    ```bash
    git config --global gpg.program gpg
    ```

## 7. Adding Your GPG Key to GitHub

1.  Export your public GPG key in the ASCII armored format:
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

1.  To automatically sign all your commits, run:
    ```bash
    git config --global commit.gpgsign true
    ```
    To disable this later, use:
    ```bash
    git config --global --unset commit.gpgsign
    ```

## 9. Troubleshooting Pinentry Issues (If You Encountered "gpg failed to sign the data")

You might have needed to install a pinentry program for GPG to handle passphrase prompts correctly on macOS.

1.  **Install `pinentry-mac` (recommended):**
    ```bash
    brew install pinentry-mac
    ```
2.  **Configure GPG Agent to use `pinentry-mac`:**
    * Create or edit `~/.gnupg/gpg-agent.conf`.
    * Add the line:
        ```
        pinentry-program /usr/local/bin/pinentry-mac
        ```
        (Adjust the path if necessary using `which pinentry-mac`).
    * Restart the GPG agent:
        ```bash
        killall gpg-agent
        gpg-agent --daemon
        ```

## 10. Testing Your Signed Commits

1.  Make a change in one of your Git repositories.
2.  Commit the change:
    ```bash
    git commit -m "Test signed commit"
    ```
    You might be prompted for your GPG passphrase.
3.  Push the commit to GitHub.
4.  On GitHub, the commit should now display a "Verified" badge.

You're all set! Your commits will now be cryptographically signed, adding a layer of trust to your contributions.
````

Let me know if you'd like any adjustments or further details in this tutorial\!