You can build own binaries:


1. Install Node.js (from your distro repositories or from Node.js official site)


2. Download GiveawayJoiner sources


3. Open terminal and in sources folder do this commands:

npm install electron@2

npm update

npm install electron-builder

electron-builder -l --dir


4. GiveawayJoiner build will be in 'sources folder'/distr/linux-unpacked


P.S.: To run GiveawayJoiner you need package 'libgconf-2-4' to be installed in your OS
