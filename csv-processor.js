const validator = require("email-validator");
 
const getVolunteerRawCSV = () => {
    const Fs = require('fs');
    const CsvReadableStream = require('csv-reader');
    let inputStream = Fs.createReadStream('input.csv', 'utf8');
    let volunteerMap = [];
    return new Promise(function(resolve, reject) {
        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
            volunteerMap.push(row);
            })
            .on('end', function () {
            resolve(volunteerMap)
            });
    });
}


const getVolunteerRawCSVMap = async () => await getVolunteerRawCSV();

const removeAccents = str =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const processVolunteers = (t) => {
   // console.dir(t);
    const roleList = [];
    const volunteers = [];
    const errors = [];
    for(let vId in t){
       //console.dir(u); 
        let v = {
            firstName : t[vId][0],
            lastName : t[vId][1],
            phone : t[vId][2],
            email : t[vId][3],
            roles : []
        }
        for(let i=4; i < t[vId].length ; i++){
            
            let currentRole = removeAccents(t[vId][i].trim().toLowerCase())
            v.roles.push(currentRole);
            if (t[vId][i] != ''){ 
                roleList[currentRole] = true;
            }
        }

        if (!validator.validate(v.email) || v.email === ''){
        //    console.dir({error:true, user:v}, {depth:null});
            errors.push(v);
        }
        else{
            volunteers.push(v);
        }


        
    }
    //console.dir(volunteers,{depth:null});
    return {volunteers, roleList, errors};
}


const initAndProcessVolunteerList  = async () => {
   let csvMap = await getVolunteerRawCSVMap();
   let t = processVolunteers(csvMap) ;
  // console.dir(t.errors);
    return t;
   // console.dir(processVolunteers(t),{depth:null});
}


module.exports = initAndProcessVolunteerList;

//init();