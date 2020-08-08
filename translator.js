import moment from 'moment';

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
            seven_day_avg_on: {
                US: '7 day avg',
                MN: '7 хоногийн дундаж'
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
            },
            legend_station_marker: {
                US: 
                    'Air Quality Station',
                MN: 
                    'Агаарын чанарын станц'
            },
            legend_temperature_description: {
                US: 
                    'PM2.5 is a major pollutant from burning coal, and people burn coal more frequently during cold weather. However, coal power plants and other PM2.5 sources, like vehicles, stil operate in the summertime.',
                MN: 
                    'PM2.5 нь нүүрс шатаахад хүргэдэг томоохон бохирдуулагч бөгөөд хүмүүс хүйтний улиралд нүүрс түлдэг. Гэсэн хэдий ч нүүрсний цахилгаан станцууд болон бусад PM2.5 эх үүсвэрүүд, тухайлбал тээврийн хэрэгсэл, зуны улиралд ажилладаг.'
            },
            legend_temperature_title: {
                US: 
                    'PM2.5 and Temperature',
                MN: 
                    'PM2.5 ба Температур'
            },
            pm25_mov_avg_title: {
                US: 
                    'Observed citywide PM2.5 average concentration: 7 day average',
                MN: 
                    'Хотын хэмжээнд ажиглагдсан PM2.5 дундаж концентраци: 7 хоногийн дундаж'
            },
            January: {
                US: 
                    'Jan',
                MN: 
                    '1-cap'
            },
            February: {
                US: 
                    'Feb',
                MN: 
                    '2-cap'
            },
            March: {
                US: 
                    'Mar',
                MN: 
                    '3-cap'
            },
            April: {
                US: 
                    'Apr',
                MN: 
                    '4-cap'
            },
            May: {
                US: 
                    'May',
                MN: 
                    '5-cap'
            },
            June: {
                US: 
                    'Jun',
                MN: 
                    '6-cap'
            },
            July: {
                US: 
                    'Jul',
                MN: 
                    '7-cap'
            },
            August: {
                US: 
                    'Aug',
                MN: 
                    '8-cap'
            },
            September: {
                US: 
                    'Sep',
                MN: 
                    '9-cap'
            },
            October: {
                US: 
                    'Oct',
                MN: 
                    '10-cap'
            },
            November: {
                US: 
                    'Nov',
                MN: 
                    '11-cap'
            },
            December: {
                US: 
                    'Dec',
                MN: 
                    '12-cap'
            },
            photo_credit: {
                US: 
                    'Image source',
                MN: 
                    'Эх сурвалж'
            },
            info_source: {
                US: 
                    'Source',
                MN: 
                    'Эх сурвалж'
            },
            event_title_2018_2019_season_ends: {
                US: 
                    '2018-2019 Air Pollution Season Ends',
                MN: 
                    '2018-2019 Агаарын бохирдлын улирал дуусна'
            },
            event_title_2019_2020_season_starts: {
                US: 
                    '2019-2020 Air Pollution Season Starts',
                MN: 
                    '2019-2020 Агаарын бохирдлын улирал эхэллээ'
            },
            event_title_2019_2020_season_ends: {
                US: 
                    '2019-2020 Air Pollution Season Ends',
                MN: 
                    '2019-2020 Агаарын бохирдлын улирал дуусна'
            },
            event_title_raw_coal_ban_starts: {
                US: 
                    'Ban on Raw Coal Comes Into Effect',
                MN: 
                    'Түүхий нүүрс дээр хориг тавигдаж эхэллээ'
            },
            event_text_raw_coal_ban_starts: {
                US: 
                    'The government announced the ban in a resolution on February 28th 2018. It is now forbidden for residents to burn raw coal within the city limits, though the rule does not apply to power plants. The government is working with state-run company Taval Tolgoi Tulsh LLC to manufacture a type of refined coal that will burn longer and cleaner and that can replace raw coal.',
                MN: 
                    'Засгийн газар хоригоо 2018 оны 2-р сарын 28-ны өдөр тогтоолоор зарлав. Одоо оршин суугчдад хотын хэмжээнд түүхий нүүрс түлэхийг хориглоно. Засгийн газар төрийн өмчит Тавал Толгой Түлш ХХК-тай хамтарч урт, илүү цэвэр, түүхий нүүрсийг орлуулж чадах цэвэршүүлсэн нүүрс үйлдвэрлэхээр ажиллаж байна.'
            },
            event_title_russian_wildfires: {
                US: 
                    'Wildfire Smoke from Russia Reaches Ulaanbaatar',
                MN: 
                    'Оросын түймрийн утаа Улаанбаатарт хүрч байна'
            },
            event_text_russian_wildfires: {
                US: 
                    'Smoke from record-setting wildfires in Siberia blows south to Mongolia. July 2019 was Earth\'s hottest month ever recorded, resulting in dangerously dry conditions around the world.',
                MN: 
                    'Сибирьт тогтоосон түймрийн утаа Монгол орны өмнөд хэсэгт үлдэв. 2019 оны 7-р сар бол дэлхийн хамгийн халуун сараар тэмдэглэгдсэн бөгөөд дэлхийн хуурай нөхцөлд аюултай нөхцөл байдал үүссэн юм.'
            },
            event_title_govt_announce_ap_reduction: {
                US: 
                    'Government Announces 49.6% Reduction in Pollution from Previous Years',
                MN: 
                    'Засгийн газар өмнөх жилүүдийн бохирдлыг 49.6% бууруулж байгааг зарлав'
            },
            event_text_govt_announce_ap_reduction: {
                US: 
                    'Government officials cite research and say that pollution has been significantly reduced. One official notes that in previous years the air pollution levels had been above the standard, implying that this season is different. However, air pollution still remains above acceptable levels in many parts of the city.',
                MN: 
                    'Засгийн газрын ажилтнууд судалгааг иш татан, бохирдол ихээхэн буурсан гэж мэдэгдэв. Өмнөх жилүүдэд агаарын бохирдлын түвшин стандарт хэмжээнээс дээгүүр байсан нь энэ улирал өөр байгааг тэмдэглэжээ. Гэсэн хэдий ч агаарын бохирдол хотын олон хэсэгт хүлээн зөвшөөрөгдсөн хэмжээнээс дээгүүр хэвээр байна.'
            },
            event_title_govt_announce_ap_plan: {
                US: 
                    '2020 Action Plan to Reduce Environmental Pollution',
                MN: 
                    'Орчны бохирдлыг бууруулахад 2020 хэрэгжүүлэх үйл ажиллагааны төлөвлөгөө'
            },
            event_text_govt_announce_ap_plan: {
                US: 
                    'Among several clauses on reducing pollution nationwide, the plan announces an intention to support production of refined coal and construct new plants that will serve Ulaanbaatar. Additionally, the plan says that the government will monitor use of the improved coal and continue to enforce the ban on raw coal. The plan also mentions that low-pressure boilers in schools and kindergardens should be replaced with efficient electric and gas stoves.',
                MN: 
                    'Улсын хэмжээнд бохирдлыг бууруулах тухай хэд хэдэн заалтын дотор энэ төлөвлөгөө нь цэвэршүүлсэн нүүрсний үйлдвэрлэлийг дэмжих, Улаанбаатар хотод үйлчилэх шинэ үйлдвэр барих бодолтой байгаагаа зарласан. Нэмж дурдахад уг төлөвлөгөөнд засгийн газар сайжруулсан нүүрсний ашиглалтыг хянаж, түүхий нүүрсний хоригийг үргэлжлүүлэн хэрэгжүүлнэ гэж заасан. Мөн төлөвлөгөөнд сургууль, цэцэрлэгийн бага даралттай бойлеруудыг үр ашигтай цахилгаан, хийн зуухаар ​​сольж байх ёстой гэж заасан.'
            },
            event_title_govt_announce_new_refined_coal_plant: {
                US: 
                    'A Second Refined Coal Factory is Announced',
                MN: 
                    'Цэвэршүүлсэн нүүрсний хоёр дахь үйлдвэр зарлагдлаа'
            },
            event_text_govt_announce_new_refined_coal_plant: {
                US: 
                    'The Energy Minister says that a new factory to produce refined coal will be built in eastern Ulaanbaatar by August and will begin producing refined coal on Septermber 15th, 2020.',
                MN: 
                    'Эрчим хүчний сайд 8-р сар гэхэд Улаанбаатар хотын зүүн хэсэгт цэвэршүүлсэн нүүрс үйлдвэрлэх шинэ үйлдвэр барьж, 2020 оны 9-р сарын 15-наас цэвэршүүлсэн нүүрс үйлдвэрлэж эхэлнэ гэж мэдэгдэв.'
            },
            none: {
                US: 
                    '?',
                MN: 
                    '?'
            },
        }
    }

    translate(phrase, lang) {
        return this.translations[phrase][lang];
    }
    
    translateDate(dateString, lang) {
        let date = moment(dateString);
        if (lang == 'MN') {
            return date.format('YYYY [оны] M [сарын] D');
        } else {
            return date.format('MMMM Do YYYY');
        }
    }

}