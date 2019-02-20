 Differences from the GiftSeeker:

 1. Changed color design, icons, font in the app (like Adapta-Nokto theme)
 2. Increased Timer to max. 1440 minutes (24 hours)
 3. Increased Pages number to check, max. 30 pages now
 4. Added retry connect to services in 5 minutes if the network is offline
 5. Completely portable app (all user data and options storied in app subdirectory 'giveawayjoinerdata'. You can use multiple 
    copies of the app with different accounts and options, just make copies of app with different appname directories 
    like 'giveawayjoiner1', 'giveawayjoiner2', etc. For example)
 6. The Indiegala service working fixed (17.02.19. Login in app to IndieGala then click 'Visit open web site' to solve the         captcha, close app browser and then click on 'start' service)
 7. The OpiumPulses service enter in 'cost' giveaways too, only using filter for 'everyone' (in test mode)  
 8. Removed functions 'auto update' and 'startup with os' in the app
 9. New display timer with fixes (now showing in 00:00:00 format)
10. Translations changes and fixes
11. Code optimizations and bugfixes for Linux compatibility
12. Latest Electron 2.x tree at the moment of app build

!!!! GiveawayJoiner need 'libgconf-2-4' lib to be installed in your Linux distro, recommended 'Noto' fonts to be installed too

To build own binaries:

1. Install Node.js (from your distro repositories or from Node.js official site)
2. Download GiveawayJoiner sources
3. Open terminal in sources directory and run this commands:
  >npm install electron@2                                  
  >npm update                                 
  >npm install electron-builder                   
  >electron-builder -l --dir                              
4. GiveawayJoiner build will be in sources subdirectory '/dist/linux-unpacked'
5. To run GiveawayJoiner open terminal in app directory enter and run this command './giveawayjoiner'
