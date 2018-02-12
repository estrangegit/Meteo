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
          this.weatherForecastDatas = this.getForecastDatas(data);
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
            this.weatherForecastDatas = this.getForecastDatas(data);
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

    console.log(data);
    console.log(tempDate.getHours());
    console.log(tempDate.getMinutes());

    let weatherDataTemp = new WeatherData();

    weatherDataTemp.day = this.weekDay(data['dt']);
    weatherDataTemp.icon = openWeatherConfig.imgUrl + data['weather'][0].icon + '.png';
    weatherDataTemp.main = data['weather'][0].main;
    weatherDataTemp.city = data['name'];
    weatherDataTemp.description = data['weather'][0].description;
    weatherDataTemp.temp = Math.round(data['main'].temp);

    return weatherDataTemp;
  }

  getForecastDatas(data): WeatherData[]{

    let forecastDataTemp = [];

    let list = data['list'];

    let now = new Date();

    let date1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12);
    let date2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12);
    let date3 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 12);

    let date1Ok = false;
    let date2Ok = false;
    let date3Ok = false;


    for(let i = 0; i < list.length; i++) {

      let tempDate = new Date(list[i].dt*1000);
      tempDate = new Date(tempDate.getTime() + tempDate.getTimezoneOffset()*60000);

      if (!date1Ok && (tempDate.getTime() >= date1.getTime())) {
        forecastDataTemp.push(this.getWeatherData(list[i]));
        date1Ok = true;
      }

      if (!date2Ok && (tempDate.getTime() >= date2.getTime())) {
        forecastDataTemp.push(this.getWeatherData(list[i]));
        date2Ok = true;
      }

      if (!date3Ok && (tempDate.getTime() >= date3.getTime())) {
        forecastDataTemp.push(this.getWeatherData(list[i]));
        date3Ok = true;
      }
    }

    return forecastDataTemp;
  }

  private weekDay(UNIX_timestamp){
    let a = new Date(UNIX_timestamp * 1000);

    let days = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
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
