/*
COMP-6062 Final Practical Project
Name: Jonel Raya
Date: 13Apr202
*/

//The weatherCode array data is based on the WMO Weather interpretation codes (WW)
//found in https://open-meteo.com/en/docs.

const weatherCode = {
    0: 'Clear Sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Depositing rime fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Intense drizzle',
    56: 'Light freezing drizzle',
    57: 'Intense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy intense rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy intense snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Slight or modarete thunderstorm',
    96: 'Thunderstorm with slight and heavy hail',
    99: 'Thunderstorm with slight and heavy hail',
}

//Create a new Vue app
const app = Vue.createApp({
    
    data() {

        return{

            //profile data
            name: 'Aang',
            age: 10,
            imageUrl: "https://sm.ign.com/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.jpg",

            //weather data
            city: 'London',
            province: 'Ontario',
            country: 'Canada',
            temp: 25,
            wind: 10,
            condition: '',

            //dictionary data
            word: null,
            phonetic: '',
            definition: '',
            
        };
    },

    methods: {

        async  getUserData(){

            let randnum = Math.random().toFixed(0);
            await fetch("https://randomuser.me/api/")
                .then(response => {
                    if(response.ok){
                        return response.json();
                    }
                    else{
                        console.log("An error occured. Please try again");
                    }
                })
                .then(async userData => {
                    let fname = await userData.results[randnum]['name']?.first;//Get first name
                    let lname = await userData.results[randnum]['name']?.last;//Get last name
                    this.name = fname + ' ' + lname;//Combine first and last name
                    this.age = await userData.results[randnum]['dob']['age'];//Get the age inside date of birth parameter
                    this.imageUrl = await userData.results[randnum]['picture']['large'];//Get large profile pic
                    console.log(this.name, this.age, this.imageUrl);
                })
                .catch(error => {
                    console.log('Error: ', error);
                });

        },

        async getWeatherData(city, province, country){

            city = this.city ?? "London";
            province = this.province ?? "Ontario";
            country = this.country ?? "Canada";
            let latitude = 0.0;
            let longitude = 0.0;
            let hourly = ['temperature_2m','weather_code','wind_speed_10m'].join(',');
            let url1 = `https://nominatim.openstreetmap.org/search?addressdetails=1&q=${city}+${province}+${country}&format=jsonv2&limit=1`;
            
            await fetch(url1)
            .then(response => {
                if (response.ok){
                    return response.json();
                }
                else {
                    console.log('An error occured. Please try again.');
                }
            })
            .then(data => {
                latitude = data[0].lat;
                longitude = data[0].lon;
                console.log(latitude);
                console.log(longitude);
                let baseUrl = 'https://api.open-meteo.com/v1/forecast';
                let url2 = `${baseUrl}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&hourly=${encodeURIComponent(hourly)}`;

                fetch(url2)
                .then(response => {
                    if (response.ok){
                        return response.json();
                    }
                    else {
                        console.log('An error occured. Please try again.');
                    }
                })
                .then(async data => {
                    //Get latest temp from the array
                    this.temp = await data.hourly.temperature_2m[1];
                    //Get latest wind speed from the array
                    this.wind = await data.hourly.wind_speed_10m[1] + ' ' +  await data.hourly_units.wind_speed_10m;
                    //Get latest weather code from the array
                    let wc = await data.hourly.weather_code[1];
                    this.condition = weatherCode[wc];
                    console.log(this.temp,'\xB0C', this.wind, this.condition);
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            })
            .catch(error => {
                console.error('Error:', error);
            });
           
        },

        async defineWord(){
            
            let  oneWord = this.word ?? 'hello';

            await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${oneWord}`)
            .then(response => {
                if (response.ok){
                    return response.json();
                }
                else {
                    console.log('An error occured. Please try again.');
                }
            })
            .then(async word => {
                let phoneticTxt = null;
                const phoneticArr = await word[0].phonetics;
                phoneticArr.forEach(element => {
                    //Ensure the phonetic text will show on the page
                    if(element.text != null)
                    {
                       phoneticTxt = element.text;
                    }
                });
                //Update phonetic value
                this.phonetic = phoneticTxt;
                //Update and get the first definition of the word
                this.definition =  await word[0].meanings[0].definitions[0]['definition'];
                console.log(this.word, ':', this.definition, '|', this.phonetic);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        
        }

    },

    //Loads a random user profile and default weather forecast automatically w/o button click
    created() {
        
        this.getUserData(); 
        this.getWeatherData(this.city, this.province, this.country);

    },


});

app.mount('#app');
