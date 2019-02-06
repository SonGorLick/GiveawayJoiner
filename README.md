To build own binaries:


1. Install Node.js (from your distro repositories or from Node.js official site)
2. Download GiveawayJoiner sources
3. Open terminal, in sources directory enter and run this commands:

npm install electron@2                                  
npm update                                 
npm install electron-builder                   
electron-builder -l --dir                              


4. GiveawayJoiner build will be in sources subdirectory '/dist/linux-unpacked'
5. Recommended 'Noto' fonts to be installed in your OS
6: Need 'libgconf-2-4' lib to be installed in your OS
7. To run GiveawayJoiner, open terminal in app directory enter and run this command './giveawayjoiner'
