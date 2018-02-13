import {Component, OnInit} from '@angular/core';
import { Geolocation } from "@ionic-native/geolocation";

import { NavController } from 'ionic-angular';
import {openWeatherConfig} from '../../app/openWeatherConfig';
import {WeatherService} from '../../app/weather.service';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit{

  ngOnInit(): void{
    this.loadWeatherByPosition();
  }

  private data = false;
  private noData = false;
  private search = '';
  private weatherData = new WeatherData();
  private weatherForecastDatas = [];
  private weatherForecastDatasDetails : any[] = [];

  constructor(public navCtrl: NavController,
                private geolocation: Geolocation,
                private weatherService: WeatherService) {

  }

  loadWeather(): void {
    this.weatherService.getWeather(this.search)
      .subscribe(data => {

        this.weatherData = this.getWeatherData(data);

        this.data = true;
        this.noData = false;
      },
      err=>{
        this.data = false;
        this.noData = true;
      });

    this.weatherService.getForecast(this.search)
      .subscribe(data => {
          let forecastTemp = this.getForecastDatas(data);
          this.weatherForecastDatas = forecastTemp['forecast'];
          this.weatherForecastDatasDetails = forecastTemp['forecastDetails']
        },
        err=>{
          this.weatherForecastDatas = [];
          console.log(JSON.stringify(err));
        });
  }


  loadWeatherByPosition(): void{
    this.geolocation.getCurrentPosition().then((resp)=> {

      let latitude = resp.coords.latitude;
      let longitude = resp.coords.longitude;

      this.weatherService.getWeatherCurrentPosition(latitude, longitude)
        .subscribe(data => {
            this.weatherData = this.getWeatherData(data);
            this.data = true;
            this.noData = false;

          },
          err=>{
            this.data = false;
            this.noData = true;
          });

      this.weatherService.getForecastCurrentPosition(latitude, longitude)
        .subscribe(data => {
            let forecastTemp = this.getForecastDatas(data);
            this.weatherForecastDatas = forecastTemp['forecast'];
            this.weatherForecastDatasDetails = forecastTemp['forecastDetails']
          },
          err=>{
            this.weatherForecastDatas = [];
            console.log(JSON.stringify(err));
          });


    }).catch((error) => {
      console.log('Error getting location');
      console.log('Code d\'erreur: ' + error.code);
      console.log('Message d\'erreur: ' + error.message);
    })
  }

  typping(): void {
    this.noData = false;
  }

  getWeatherData(data): WeatherData {

    let tempDate = new Date(data['dt'] * 1000);
    tempDate = new Date(tempDate.getTime() + tempDate.getTimezoneOffset()*60000);

    let weatherDataTemp = new WeatherData();

    weatherDataTemp.day = this.weekDay(data['dt']);
    weatherDataTemp.time = tempDate.getHours() + "h" + (tempDate.getMinutes()<10?'0':'') + tempDate.getMinutes();
    weatherDataTemp.icon = openWeatherConfig.imgUrl + data['weather'][0].icon + '.png';
    weatherDataTemp.main = data['weather'][0].main;
    weatherDataTemp.city = data['name'];
    weatherDataTemp.description = data['weather'][0].description;
    weatherDataTemp.temp = Math.round(data['main'].temp);

    return weatherDataTemp;
  }

  getForecastDatas(data): any{

    let forecastDataTemp = [];

    let list = data['list'];
    let now = new Date();

    let dates = [];
    let datesOk = [];
    let minDates = [];
    let maxDates = [];


    for(let i = 0; i < 6; i++){
      let date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12);
      let minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 0);
      let maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1, 0);

      dates.push(date);
      minDates.push(minDate);
      maxDates.push(maxDate);
      datesOk.push(false);
    }

    let dateDetails: any[] = [];

    for(let i = 0; i < 6; i++){

      let dateDetailsForOneDay : WeatherData[] = [];

      for(let j = 0; j < list.length; j++) {

        let tempDate = new Date(list[j].dt*1000);
        tempDate = new Date(tempDate.getTime() + tempDate.getTimezoneOffset()*60000);

        if((tempDate.getTime()>= minDates[i].getTime()) && (tempDate.getTime()<maxDates[i].getTime())){
          dateDetailsForOneDay.push(this.getWeatherData(list[j]));
        }
      }
      if(i==0 && dateDetailsForOneDay.length!=0){
        dateDetails.push(dateDetailsForOneDay);
        forecastDataTemp.push(dateDetailsForOneDay[0]);
      }else if(i!=0){
        dateDetails.push(dateDetailsForOneDay);
      }
    }

    for(let i = 1; i < 6; i++){
      for(let j = 0; j < list.length; j++) {

        let tempDate = new Date(list[j].dt*1000);
        tempDate = new Date(tempDate.getTime() + tempDate.getTimezoneOffset()*60000);

        if (!datesOk[i] && (tempDate.getTime() >= dates[i].getTime())) {
          forecastDataTemp.push(this.getWeatherData(list[j]));
          datesOk[i] = true;
        }
      }
    }

    return {forecast: forecastDataTemp, forecastDetails: dateDetails};
  }

  private weekDay(UNIX_timestamp){
    let a = new Date(UNIX_timestamp * 1000);

    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[a.getDay()];
  }
}

class WeatherData {
  day: String;
  time: String;
  icon: String;
  main: String;
  city: String;
  description: String;
  temp: number;
}
