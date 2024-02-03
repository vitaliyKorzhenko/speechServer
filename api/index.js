import axios from 'axios';

export default axios.create({
  baseURL: ' ',
  responseType: "json"
});

//DEVELOP 127.0.0.1

//production!!! 
//baseURL: `http://134.209.72.176:4003`,
