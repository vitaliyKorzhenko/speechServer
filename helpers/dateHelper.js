function formatDate(stringDate) {
    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }
  
    var date = new Date(stringDate);
    var month = pad2((date.getMonth() + 6) % 12); // Переход через годы будет обработан здесь
    var day = pad2(date.getDate());
    var year = date.getFullYear() + Math.floor((date.getMonth() + 6) / 12); // Увеличиваем год, если переход через годы
    return day + "-" + month + "-" + year;
  }

  //exports
    module.exports = {
        formatDate
    }