function getNextDate(dayOfWeek, currentDate) {
    const daysUntilNextClass = (7 + dayOfWeek - currentDate.getDay()) % 7;
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysUntilNextClass);
    
    const day = nextDate.getDate().toString().padStart(2, '0');
    const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
    
    return `${day}.${month}`;
}

const getNextClassSchedule = (clientScheduleJSON, useRuVersion) => {
  function translateTextToUkrainian(text) {
    if (useRuVersion) {
      return text;
    }
    const translationMap = {
      'Понедельник': 'Понеділок',
      'Вторник': 'Вівторок',
      'Среда': 'Середа',
      'Четверг': 'Четвер',
      'Пятница': 'Пʼятниця',
      'Суббота': 'Субота',
      'Воскресенье': 'Неділя'
    };
  
    return translationMap[text] || text;
  }
    const clientSchedule = JSON.parse(clientScheduleJSON);
    console.log('clientSchedule', clientSchedule);
    if (clientSchedule.length === 0) {
        return useRuVersion ? 
        `Спасибо вам! Желаем Вам позитивного и плодотворного выполнения заданий. После отправки вами результатов, вы получите следующий урок` : 
        `Дякуємо вам! Бажаємо Вам позитивного та плідного виконання завдань. Після надсилання вами результатів, ви отримаєте наступний урок, відповідно до вашого графіка`;
    }
    const allDays = [
        { text: 'Понедельник', value: 1 },
        { text: 'Вторник', value: 2 },
        { text: 'Среда', value: 3 },
        { text: 'Четверг', value: 4 },
        { text: 'Пятница', value: 5 },
        { text: 'Суббота', value: 6 },
        { text: 'Воскресенье', value: 0 }
      ];
      
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    console.log('Now', currentDay, currentHour);
  
    const futureDays = clientSchedule.filter(item => {
      return (item.day > currentDay) || (item.day === currentDay && item.time > currentHour);
    });
    console.log('futureDays', futureDays);
    const uaMessage = `Дякуємо вам! Бажаємо Вам позитивного та плідного виконання завдань. Після надсилання вами результатів, ви отримаєте наступний урок у `;
    const ruMessage = `Спасибо вам! Желаем Вам позитивного и плодотворного выполнения заданий. После отправки вами результатов, вы получите следующий урок в `;
    const message = useRuVersion ? ruMessage : uaMessage;
    if (futureDays.length === 0) {
      const nextClass = clientSchedule[0];
      const nextDate = getNextDate(nextClass.day, now);

      const nextDay = allDays.find(day => day.value === nextClass.day);
      return  message +  `${translateTextToUkrainian(nextDay.text)} (${nextDate})`;
    } else {
      const nextClass = futureDays[0];
      const nextDate = getNextDate(nextClass.day, now);

      const nextDay = allDays.find(day => day.value === nextClass.day);
      return message +  `${translateTextToUkrainian(nextDay.text)} (${nextDate})`;
    }
  }
  
 module.exports = {
    getNextClassSchedule
}
  