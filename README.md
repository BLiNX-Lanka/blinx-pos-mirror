# BLiNX POS signed mirror

A static copy of the BLiNX-signed store descriptors, used by the BLiNX POS app only when the Cloudflare directory is unreachable.

* **Public data only.** A descriptor holds a store's public project address, public key and brand. No licence, no secret, no personal data.
* **Signed.** The app verifies every file against keys compiled into the app. A forged or edited file is rejected, so this repository cannot redirect a till.
* **File names are not store codes.** `v1/m/<scrypt(code)>.jws`, so this public file list does not reveal which stores exist.
* **Written by the BLiNX publication job only** (two-person rule). Do not edit by hand.
* `.github/workflows/health.yml` checks the directory and this mirror every 30 minutes and fails (GitHub emails the repository admins) when either is down, out of step, or a descriptor has less than 21 days of validity left.
