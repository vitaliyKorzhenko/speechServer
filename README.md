# speechTherapyServer
speechTherapyServer 


# Config
configs json -> путь к базе (не пушаем) - для прода свой конфиг


# DataBase Config -> который через миграции 
## config json -> путь к базе в которой проходят миграции

database - зауск миграций происходит так

# комманды для мигарций
cd database 

sequelize: db migrate 

для смены базы меняем config

# HELPERS course constant - зло полное подумать как уйти
 не пушим его не когда (заточен под запуск речи)

helpers/course constant



# Helpers url HELPER не надо пушить

heleprs/urlHelper

# попробовать обьединить два!

# deploy russian bot
id 2 russian bot -> 

cd projects -> govorikaBot-> git pull

pm2 stop 2 

pm2 start node app.js


# deploy ua bot

