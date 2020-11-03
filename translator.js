import moment from 'moment';

export class Translator {
    
    constructor() {
        this.translations = {
            title: {
                US: 
                    'Visualizing Air Quality in Ulaanbaatar from 2019 to 2020',
                MN: 
                    '2019-2020 оны Улаанбаатар Хотын Агаарын Чанарын Дүрслэл'
            },

            introduction: {
                US: 
                    "Cleaning up the toxic air has been one of the biggest challenges for the city of Ulaanbaatar in recent years. In 2012 the government passed the Law on Air, which was supposed to start addressing the growing crisis. After several unsuccessful efforts, the government passed resolution 62 which announced a ban on burning raw coal starting in 2019. Watch as PM2.5 levels change across the city from February 2019 to April 2020 and get a bird's eye view of Ulaanbaatar as it works towards a future of clean air.",
                MN: 
                    'Хортой агаарыг цэвэрлэх нь сүүлийн жилүүдэд Улаанбаатар хотын хамгийн тулгамдсан асуудлын нэг болоод байна. 2012 онд засгийн газраас энэхүү хямралыг шийдвэрлэх зорилгоор Агаарын тухай хуулийг батласан. Үүнээс хойш хэд хэдэн амжилтгүй оролдлогын дараа засгийн газар 2019 оноос эхлэн түүхий нүүрс шатаахыг хориглох 62 дугаар тогтоолыг гаргасан билээ. Энэ тогтоолоос хойш агаарын бохирдол Улаанбаатарт ямар түвшинд байсныг 2019 оны 2-р сараас 2020 оны 4-р сар хүртэлх PM2.5 түвшингээс харцгаая'
            },
            what_is_pm25: {
                US: 
                    "What is PM2.5?",
                MN: 
                    'PM2.5 гэж юу вэ?'
            },
            pm_25_is: {
                US: 
                    'PM2.5 is a type of air pollutant. It refers to atmospheric particulate matter that is less than 2.5 microns in diameter.',
                MN: 
                    'PM2.5 бол агаар дах 2.5 микрон диаметрээс бага хэмжээтэй тоосонцор юм.'
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
                    'Эрүүл'
            },
            moderate: {
                US: 
                    'Moderate',
                MN: 
                    'Бага Зэрэг Бохирдол'
            },
            unhealthy_sensitive: {
                US: 
                    'Unhealthy for Sensitive Groups',
                MN: 
                    'Эмзэг Бүлгийн Хүмүүст Аюултай'
            },
            unhealthy: {
                US: 
                    'Unhealthy',
                MN: 
                    'Аюултай'
            },
            very_unhealthy: {
                US: 
                    'Very Unhealthy',
                MN: 
                    'Маш Аюултай'
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
                    'PM2.5 is a major pollutant from burning coal, and people burn coal more frequently during cold weather. However, coal power plants and other PM2.5 sources, like vehicles, still operate in the summertime.',
                MN: 
                    'PM2.5 нь нүүрс шатаахаас үүдэлтэй агаарын бохирдол юм. Өвлийн улиралд нүүрс түлэхээс гадна жилийн турш нүүрсний цахилгаан станцууд болон тээврийн хэрэгслээс PM2.5 ялгардаг.'
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
            continue: {
                US: 'Continue',
                MN: 'Үргэлжлүүлэх'
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
            //-------- TIMELINE EVENTS -----------------------//
            event_title_2018_2019_season_ends: {
                US: 
                    '2018-2019 Air Pollution Season Ends',
                MN: 
                    '2018-2019 Утааны улирал дуусав'
            },
            event_title_2019_2020_season_starts: {
                US: 
                    '2019-2020 Air Pollution Season Starts',
                MN: 
                    '2019-2020 Утааны улирал эхлэв'
            },
            event_title_2019_2020_season_ends: {
                US: 
                    '2019-2020 Air Pollution Season Ends',
                MN: 
                    '2019-2020 Агаарын бохирдлын улирал дуусав'
            },
            event_title_raw_coal_ban_starts: {
                US: 
                    'Ban on Raw Coal Comes Into Effect',
                MN: 
                    'Түүхий нүүрсний хориг эхлэв'
            },
            event_text_raw_coal_ban_starts: {
                US: 
                    'The government announced the ban in a resolution on February 28th 2018. It is now forbidden for residents to burn raw coal within the city limits, though the rule does not apply to power plants. The government is working with state-run company Taval Tolgoi Tulsh LLC to manufacture a type of refined coal that will burn longer and cleaner and that can replace raw coal.',
                MN: 
                    'Засгийн газар хоригоо 2018 оны 2-р сарын 28-ны өдрийн тогтоолоор зарлаж оршин суугчдад хотын хэмжээнд түүхий нүүрс түлэхийг хориглов. Засгийн газар төрийн өмчит Тавал Толгой Түлш ХХК-тай хамтарч урт, илүү цэвэр, түүхий нүүрсийг орлуулж чадах боловсруулсан нүүрс үйлдвэрлэхээр ажиллаж байна.'
            },
            event_title_russian_wildfires: {
                US: 
                    'Wildfire Smoke from Russia Reaches Ulaanbaatar',
                MN: 
                    'Сибирийн түймрийн утаа Улаанбаатарт хүрэв'
            },
            event_text_russian_wildfires: {
                US: 
                    'Smoke from record-setting wildfires in Siberia blows south to Mongolia. July 2019 was Earth\'s hottest month ever recorded, resulting in dangerously dry conditions around the world.',
                MN: 
                    'Сибирийн түймрийн утаа Монгол орны өмнөд хэсэгт хүрэв. 2019 оны 7-р сар дэлхийн хамгийн халуун сараар тэмдэглэгдсэн бөгөөд дэлхий даяар аюултай хуурайшилттай байв.'
            },
            event_title_govt_announce_ap_reduction: {
                US: 
                    'Government Announces 49.6% Reduction in Pollution from Previous Years',
                MN: 
                    'Засгийн газар бохирдлын хэмжээг өмнөх жилүүдтэй харьцуулахад 49.6% бууруулсан хэмээн зарлав'
            },
            event_text_govt_announce_ap_reduction: {
                US: 
                    'Government officials cite research and say that pollution has been significantly reduced. One official notes that in previous years the air pollution levels had been above the standard, implying that this season is different. However, air pollution still remains above acceptable levels in many parts of the city.',
                MN: 
                    'Засгийн газрын ажилтнууд бохирдол ихээхэн буурсан гэсэн судалгааны талаар мэдэгдэхдээ өмнөх жилүүдэд агаарын бохирдлын түвшин стандарт хэмжээнээс дээгүүр байсан гэж зарласан нь энэ жилд утаа аюулт хэмжээнд байгаагүй мэтээр төөрөгдөл үүсгэв. Гэвч үнэн хэрэгтээ агаарын бохирдол хүлээн зөвшөөрөгдсөн хэмжээнээс давсан хэвээр байна.'
            },
            event_title_govt_announce_ap_plan: {
                US: 
                    '2020 Action Plan to Reduce Environmental Pollution',
                MN: 
                    'Орчны бохирдлыг бууруулах 2020 оны үйл ажиллагааны төлөвлөгөө'
            },
            event_text_govt_announce_ap_plan: {
                US: 
                    'Among several clauses on reducing pollution nationwide, the plan announces an intention to support production of refined coal and construct new plants that will serve Ulaanbaatar. Additionally, the plan says that the government will monitor use of the improved coal and continue to enforce the ban on raw coal. The plan also mentions that low-pressure boilers in schools and kindergardens should be replaced with efficient electric and gas stoves.',
                MN: 
                    'Агаарын бохирдлыг бууруулах тухай хэд хэдэн заалтын нэгт сайжруулсан нүүрсний үйлдвэрлэлийг дэмжих, шинэ үйлдвэр барих зэрэг тусгагдсан. Мөн уг төлөвлөгөөнд засгийн газар сайжруулсан нүүрсний ашиглалтыг хянаж, түүхий нүүрсний хоригийг үргэлжлүүлэн мөрдүүлнэ, мөн сургууль цэцэрлэгийн бага даралттай бойлеруудыг үр ашигтай цахилгаан, хийн зуухаар солих ёстой гэж тусгасан.'
            },
            event_title_govt_announce_new_refined_coal_plant: {
                US: 
                    'A Second Refined Coal Factory is Announced',
                MN: 
                    'Сайжруулсан нүүрсний хоёр дахь үйлдвэр товлогдов'
            },
            event_text_govt_announce_new_refined_coal_plant: {
                US: 
                    'The Energy Minister says that a new factory to produce refined coal will be built in eastern Ulaanbaatar by August and will begin producing refined coal on Septermber 15th, 2020.',
                MN: 
                    'Эрчим хүчний сайд 8-р сар гэхэд Улаанбаатар хотын зүүн хэсэгт сайжруулсан нүүрсний шинэ үйлдвэр барьж, 2020 оны 9-р сарын 15-наас сайжруулсан нүүрс үйлдвэрлэж эхэлнэ гэж мэдэгдэв.'
            },




            //--------- MORE INFO TEXT -----------------//
            info_title_low_cost_sensor_data: {
                US: 
                    'Low-Cost Sensor Data',
                MN: 
                    'Хямд Өртөгт Мэдрэгчийн Өгөгдөл'
            },
            info_body_low_cost_sensor_data: {
                US: 
                    'This visualization was made with data collected from 21 low-cost sensors installed around the city by People In Need Mongolia. The air quality stations on the map show their locations.',
                MN: 
                    'Энэхүү дүрслэлийг хотын эргэн тойронд People In Need Mongolia байгууллагаас суурилуулсан хямд өртөгтэй 21 мэдрэгчээс цуглуулсан өгөгдөл ашиглан хийсэн болно. Газрын зураг дээр эдгээр мэдрэнчүүдийн байршлыг харуулав.'
            },


            info_title_aq_modeling: {
                US: 
                    'Air Quality Modeling',
                MN: 
                    'Агаарын Чанарын Загварчлал'
            },
            info_body_aq_modeling: {
                US: 
                    'Creating the visualzation was a two-step process. First, the sensor data was combined with data from across the city, such as density of population per square km, density of coal-stoves (surveyed in 2013) and density of residential roads, to create a prediction map for each month. This process is called a Land Use Regression. Then the monthly prediction maps were ajdusted for each day in the month using the 7 day moving average at each sensor. The final visualization reflects a fusion of the monthly trends with smaller, daily variations in air quality.',
                MN: 
                    'Дүрслэлийг бүтээх нь хоёр үе шаттай үйл явц байв. Нэгдүгээрт, мэдрэгчүүдийн өгөгдлүүдийг нэг хавтгай дөрвөлжин км тутмын хүн амын нягтрал, нүүрсний зуухны нягтрал (2013 онд судалсан), орон сууцны замуудын нягтрал зэрэг өгөгдлүүдтэй нэгтгэн сар бүрийн тооцоололт газрын зургийг боловсруулсан болно. Энэ арга барилыг Land Use Regression гэж нэрлэдэг. Дараа нь сарын тооцоололт зургийг мэдрэгч бүрийн 7 хоногийн хөдөлгөөнт дундажтай нэгтгэсэн. Эцсийн дүрс нь сар бүрийн агаарын чанарын хандлагыг өдөр бүрийн нарийвчлалаар тооцоолцсон болно.'
            },

            
            //-----MORE INFO TITLES---------------//
            info_how_was_viz_made: {
                US: 
                    'How was this visualization made?',
                MN: 
                    'Энэ дүрслэлийг хэрхэн хийсэн бэ?'
            },
            info_what_viz_doesnt_show: {
                US: 
                    'What does the visualization NOT show?',
                MN: 
                    'Энэ дүрслэл юуг харуулаагүй вэ?'
            },




            info_title_info_prior_2019: {
                US: 
                    'Information Prior to 2019',
                MN: 
                    '2019 оноос өмнө мэдээлэл'
            },
            info_body_info_prior_2019: {
                US: 
                    'The low-cost sensor data becomes consistent around February 2019. While there is data going back further for a small number of sensors, this type of visualization requires a larger network of sensors with consistent data.',
                MN: 
                    'Хямд өртөгтэй мэдрэгчийн өгөгдөл нь 2019 оны 2-р сараас эхлээд тогтвортой болсон. Үүгээс өмнө хэдийгээр цөөн тооны мэдрэгчийн өгөгдөл байгаа боловч энэ төрлийн дүрслэл хийхэд олон мэдрэгчийн өгөгдөл шаардагддаг.'
            },

            info_title_other_pollutants: {
                US: 
                    'Air Pollutants other than PM2.5',
                MN: 
                    'PM2.5-ээс бусад агаар бохирдуулагчид'
            },
            info_body_other_pollutants: {
                US: 
                    'PM2.5 is harmful to human health, but it is not the only pollutant to worry about. If the map is entirely green it doesn\'t mean that there is no air pollution, only that PM2.5 levels are low.',
                MN: 
                    'PM2.5 нь хүний эрүүл мэндэд хортой боловч энэ нь санаа зовох цорын ганц бохирдуулагч биш юм. Хэдий газрын зураг бүхэлдээ ногоон байв ч энэ нь агаарын бохирдол байхгүй гэсэн үг биш, харин зөвхөн PM2.5 түвшин доогуур байгааг харуулна.'
            },

            info_title_accurate_spatial_estimates: {
                US: 
                    'Highly Accurate Spatial Estimates',
                MN: 
                    'Өндөр нарийвчлалтай орон зайн тооцоолол'
            },
            info_body_accurate_spatial_estimates: {
                US: 
                    'This visualization shows estimated trends in different parts of the city over time, and should not be used to make health exposure assessments or anything requiring numerical precision. In the future, more and better sensors around the city will help produce even more accurate maps.',
                MN: 
                    'Энэ дүрслэл нь хотын агаарын бохирдлын тооцоолсон ерөнхий чиг хандлагыг харуулдаг бөгөөд эрүүл мэндийн үнэлгээ болон бусад нарийвчлал шаардагдсан зүйлсэд ашиглахад тохиромжгүй. Ирээдүйд хотын эргэн тойронд олон, чанартай мэдрэгч суулгавал илүү нарийвчлалтай газрын зураг дүрслэх боломжтой болно.'
            },

            info_title_full_govt_actions: {
                US: 
                    'A Full List of Government Actions',
                MN: 
                    'Засгийн газрын үйл ажиллагааны жагсаалт'
            },
            info_body_full_govt_actions: {
                US: 
                    'The events selected for the timeline are some of the most notable events related to air pollution in Ulaanbaatar during this time period, but are not a comprehensive list.',
                MN: 
                    'Он цагийн хуваарьт сонгосон арга хэмжээнүүд нь энэ хугацаанд Улаанбаатар хотын агаарын бохирдолтой холбоотой онцлох үйл явдлууд боловч дэлгэрэнгүй жагсаалт биш юм.'
            },
            
            thanks_to: {
                US: 
                    'Thanks very much to Public Lab Mongolia for supplying the low-cost sensor data, and to People In Need for installing and maintaing the low-cost sensors.',
                MN: 
                    'Хямд өртөгтэй мэдрэгчийг суурилуулж, ажиллуулж байгаа People In Need болон эдгээр мэдрэгчийн өгөгдлийг бидэнд олгосон Public Lab Mongolia-д маш их баярлалаа.'
            },
            who_am_i: {
                US: 
                    'The author of this visualization works with Breathe Mongolia, a non-profit dedicated to ending air pollution in Mongolia. This project was created in part to fulfill coursework for the Master\'s of Urban Science, Policy and Planning program at the Singapore University of Technology and Design. If you\'d like more information about the visualization or would like to get in touch, please email hayley.garment<at>gmail.com.',
                MN: 
                
                    'Энэхүү дүрслэлийн зохиогч нь Монгол орны агаарын бохирдлыг зогсоох зорилготой, ашгийн бус Breathe Mongolia байгууллагын ажилтан юм. Энэхүү төслийг Singapore University of Technology and Design дахь хот байгуулалт, бодлого, төлөвлөлтийн мастерын хөтөлбөрийн курсын ажлыг гүйцэтгэх зорилгоор бүтээсэн болно. Хэрэв та дүрслэлийн талаар илүү мэдээлэл авахыг хүсч байвал эсвэл холбоо барихыг хүсэж байвал hayley.garment<at>gmail.com хаягаар холбогдоно уу.'
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
