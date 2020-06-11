[![DeepScan grade](https://deepscan.io/api/teams/2928/projects/4373/branches/35596/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=2928&pid=4373&bid=35596)
[![CodeFactor](https://www.codefactor.io/repository/github/pumpcin/giveawayjoiner/badge)](https://www.codefactor.io/repository/github/pumpcin/giveawayjoiner)
 
 Для сборки программы вручную из исходников:

  1. Скачиваем Node.js с сайта и устанавливаем, для linux-дистрибутивов можно установить из репозиториев указанных на сайте.
  2. Скачиваем исходники GiveawayJoiner, можно как определенной версии в релизе либо самые последние на главной странице.
  3. Запускаем программу Terminal в папке исходников, если ос Windows тогда коммандную строку (cmd.exe) от имени администратора. Далее вводим комманды через 'Enter' :
  >npm install electron                                  
  >npm update                                 
  >npm install -g electron-builder                   
  >electron-builder --dir                              
  
  Программа GiveawayJoiner будет собрана в папке исходников в подпапке 'dist'.
  
  П.С.: В linux-дистрибутивах возможно потребуется установить дополнительно библиотеку 'libgconf-2-4'. Для пользователей Ubuntu в терминале ввести команду и нажать 'Enter' (потребуется ввести пароль):
  >sudo apt-get install gconf2
