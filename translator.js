export class Translator {
    
    constructor() {
        this.translations = {
            title: {
                US: 
                    'Visualizing Air Quality in Ulaanbaatar',
                MN: 
                    'Монгол хэл энд'
            },

            introduction: {
                US: 
                    "Cleaning up the toxic air has been one of the biggest challenges for the city of Ulaanbaatar in recent years. In 2012 the government of ? passed the Law on Air, which was supposed to start addressing the causes undelying the crisis. After many unsuccessful efforts, the city of UB released resolutiion 62 which announced a ban on the burning of raw coal starting in 2019. Watch as pm2.5 levels change across the city from February 2019 to April 2020 and get a bird's eye view of Ulaanbaatar's public policy as it attempts to clean the air.",
                MN: 
                    'Хортой агаарыг цэвэрлэх нь сүүлийн жилүүдэд Улаанбаатар хотын хувьд тулгамдсан асуудлын нэг болоод байна. 2012 онд Засгийн газрын? хямралыг үл тоомсорлож буй шалтгааныг шийдвэрлэх ажлыг эхлүүлэхээр төлөвлөсөн Агаарын тухай хуулийг батлав. Олон тооны хүчин чармайлт гаргасны дараа нийслэл 2019 онд түүхий нүүрс шатаахыг хориглох тухай зарласан 62 тогтоолыг гаргалаа. 2019 оны 2-р сараас 2020 оны 4-р сар хүртэл pm2.5 түвшин хот даяар өөрчлөгдөж, шувуудын нүдээр харах боломжтой. агаарыг цэвэрлэх гэсэн оролдлогоор төрийн бодлого.'
            },
            pm25_scale_title: {
                US: 'Estimated PM2.5 Concentration',
                MN: 'Тооцоолсон PM2.5 концентраци'
            },
            good: {
                US: 
                    'Good',
                MN: 
                    'Сайн'
            },
            moderate: {
                US: 
                    'Moderate',
                MN: 
                    'Бага Бохирдол'
            },
            unhealthy_sensitive: {
                US: 
                    'Unhealthy for Sensitive Groups',
                MN: 
                    'Mэдрэг Хүмүүс Болгоомжил'
            },
            unhealthy: {
                US: 
                    'Unhealthy',
                MN: 
                    'Их Бохирдол'
            },
            very_unhealthy: {
                US: 
                    'Very Unhealthy',
                MN: 
                    'Эрүүл Мэндэд Аюултай'
            },
            hazardous: {
                US: 
                    'Hazardous',
                MN: 
                    'Маш Их Хортой'
            },
            legend_not_enough_data: {
                US: 
                    'Not enough data for estimate',
                MN: 
                    'Тооцоолоход хангалттай мэдээлэл байхгүй байна'
            }
        }
    }

    translate(phrase, lang) {
        return this.translations[phrase][lang];
    } 

}