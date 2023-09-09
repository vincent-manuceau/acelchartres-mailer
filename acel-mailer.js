const striptags = require('striptags');
const initAndProcessVolunteerList = require('./csv-processor');
const roles = require('./roles');
const dates = require('./dates');
const signature = require('./signature');
const nodemailer = require('nodemailer');

require('dotenv').config()
//console.log(process.env)

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_LOGIN,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

const SENDMAIL = async (mailDetails, callback) => {
    try {
      const info = await transporter.sendMail(mailDetails)
      callback(info);
    } catch (error) {
      console.log(error);
    } 
  };

const processVolunteerMailTemplate = (v) => {
    const obj = {name:v.lastName+' '+v.firstName, email:v.email, roles:[]};

    const subject = "Confirmation d'inscription en tant que bénévole pour le Meeting Aérien de Chartres" ;
    let msg = `<html><head><meta charset="utf-8"><title>${subject}</title></head><body>
    Cher(e) ${v.lastName} ${v.firstName},
    <br/><br/>
    Nous sommes ravis de vous informer que votre inscription en tant que bénévole pour le Meeting Aérien de Chartres a été validée avec succès. Votre engagement et votre enthousiasme sont précieux pour faire de cet événement une expérience exceptionnelle pour tous les participants.
    <br/><br/>    
    Nous souhaitons vous informer des détails importants concernant votre participation en tant que bénévole :
    <br/><br/>
    <h2><u>Votre Poste et Vos Horaires :</u></h2> 
        `;
    for(let i=0; i < v.roles.length ; i++){
        if (v.roles[i] !== ''){
            msg += `<h3 style='margin-bottom:0'>${dates[i].date}</h3><ul style='margin-top:0'>
                <li>Horaires : <b>à partir de ${dates[i].time}</b></li>
                <li>Poste : <b>${roles[v.roles[i]].title}</b></li>
                <li>Responsable : <b>${roles[v.roles[i]].resp}</b></li></ul>
        `;
        obj.roles.push({
            date: dates[i].date+' '+dates[i].time,
            role: roles[v.roles[i]].title,
            resp: roles[v.roles[i]].resp
        })
        }
    }
    
    msg += 
    
    `<br/><br/>
    Vous trouverez ci-joint un plan du site pour vous aider à vous familiariser avec les lieux et à prévoir vos déplacements le jour de l'événement.
    <br/><br/>
    <h2><u>Procédure de Récupération de Votre Badge :</u></h2> 
    Un badge d'accès vous sera délivré pour votre poste. Vous pourrez le récupérer au QG des bénévoles (voir plan) à partir de 08h00 le samedi et 07h00 le dimanche.
    <br/><br/>
    Nous sommes impatients de travailler avec vous pour faire de notre Meeting Aérien de Chartres un événement exceptionnel. Si vous avez des questions ou des préoccupations supplémentaires, n'hésitez pas à nous contacter à <a href='mailto:contact.meetingchartres@gmail.com'>contact.meetingchartres@gmail.com</a>.
    <br/><br/>
    Merci encore pour votre dévouement et votre engagement. Ensemble, nous allons créer des souvenirs inoubliables.
    <br/><br/>
    <font color=red>[TODO]Joindre en PJ: le plan, le badge d’accès parking, votre poste / horaire [TODO]</font>
    <br/><br/>
    Cordialement,<br/><b>Aéroclub Chartres Métropole</b><br/>
    `;
    
    msg += `<img style="max-width:500px" src="cid:acelsignature" />`;
    msg +=`</body></html>` ;
    return {
        msg, plain: striptags(msg), email: v.email, subject, obj
    }

}




const sendMail = (t) => {
    const options = {
        from: process.env.FROM_EMAIL, // sender address
        to: process.env.TO_EMAIL,
        cc: process.env.CC_EMAIL, // receiver email
        subject: t.subject, // Subject line
        text: t.plain,
        html: t.msg,
        attachments: [{
            filename: 'signature.jpg',
            path: __dirname +'/signature.jpg',
            cid: 'acelsignature' //same cid value as in the html img src
        }]
    }
    SENDMAIL(options, (info) => {
        console.log("Email sent successfully");
        console.log("MESSAGE ID: ", info.messageId);
    });
    
}






const initAcelMailer = async () => {
    const v = await initAndProcessVolunteerList();
//    console.dir(v.volunteers[0], {depth:null});
    for(let i=0; i < v.volunteers.length ; i++){
        let t = processVolunteerMailTemplate(v.volunteers[i]);
        //sendMail(t);
        console.log(t.obj.name+','+t.obj.email+ ', '+ t.obj.roles.map(x => JSON.stringify(x).replaceAll(',',' ')).join(','));
   
    }
    



}
initAcelMailer();