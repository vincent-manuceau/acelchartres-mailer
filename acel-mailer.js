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
        if (v.roles[i] === 'present'){
            msg += `<h3 style='margin-bottom:0'>${dates[i].date}</h3><ul style='margin-top:0'>
                <li>Complet : <b>Votre présence n'est pas requise ce jour en tant que bénévole, profitez du show !</b></li>
                </ul>
            `;
        }
        else if (v.roles[i] !== ''){
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
    Cordialement,
    <br/><b>Aéroclub Chartres Métropole</b><br/>
    `;
    
    msg += `<img style="max-width:500px" src="cid:acelsignature" />`;
    msg +=`</body></html>` ;
    return {
        msg, plain: striptags(msg), email: v.email, subject, obj
    }

}


const processVolunteerThankingMailTemplate = (v) => {
    const obj = {name:v.lastName+' '+v.firstName, email:v.email, roles:[]};

    const subject = "Meeting Chartres MERCI / Soirée des bénévoles le 21/10/2023" ;
    let msg = `<html><head><meta charset="utf-8"><title>${subject}</title></head><body>
    Chers amis bénévoles, cher(e) ${v.lastName},
    <br/><br/>
    Nous sommes ravis de partager avec vous d'excellentes nouvelles : le Meeting Aérien de Chartres qui s'est tenu Dimanche 24 Septembre a été un succès retentissant, attirant plus de 60 000 visiteurs enthousiastes sous une superbe météo ! Ce succès n'aurait pas été possible sans votre engagement, votre travail et votre dévouement en tant que bénévole.
    <br/><br/>    
    Votre contribution a été véritablement inestimable. Vous avez joué un rôle essentiel dans la planification et la coordination de cet événement. Votre énergie, votre enthousiasme ont contribué à créer une expérience mémorable pour les milliers de visiteurs.
    <br/><br/>    
    Que ce soit en aidant à la logistique, à l’entretien du site, en assurant la sécurité, en fournissant un soutien administratif ou en accomplissant toute autre tâche, vous avez fait preuve d'une ferveur exemplaire. Votre travail a permis de garantir la réussite de notre meeting aérien.
    <br/><br/>
    Afin de pouvoir vous témoigner notre profonde gratitude, <strong><u>nous vous invitons à une soirée de remerciement qui se déroulera le samedi 21 octobre à partir de 19h30</u></strong> à l’Aéroclub. Nous vous y attendons nombreux.
    <br/>Merci de nous confirmer votre présence en envoyant un mail à <a href="contact@acelchartres.com">contact@acelchartres.com</a>.
    <br/><br/>
    Cette soirée sera l’occasion d’avoir votre retour d’expérience sur l’organisation de ce meeting. Il est évident qu’il y a des points à améliorer car nous avons été parfois dépassés par l'ampleur de cet événement.
    <br/><br/>
    Une fois de plus, merci du fond du cœur pour votre contribution exceptionnelle.
    <br/><br/>
    A bientôt ,
    <br/><b>L'Aéroclub Chartres Métropole</b><br/>
    `;
    
    msg += `<img style="max-width:500px" src="cid:acelsignature" />`;
    msg +=`</body></html>` ;
    return {
        msg, plain: striptags(msg), email: v.email, subject, obj
    }

}

const sendMail = async (t) => {
    const options = {
        from: process.env.FROM_EMAIL, // sender address
        to: t.email,
        //cc: process.env.CC_EMAIL, // receiver email
        subject: t.subject, // Subject line
        text: t.plain,
        html: t.msg,
        attachments: [{
            filename: 'signature.jpg',
            path: __dirname +'/signature.jpg',
            cid: 'acelsignature' //same cid value as in the html img src
        }/*,        
        {
            filename: 'plan-access-parking.png',
            path: __dirname +'/plan-access-parking.png',
            cid: 'planaccessparking' //same cid value as in the html img src
        },
        
        {
            filename: 'plan-du-site.png',
            path: __dirname +'/plan-du-site.png',
            cid: 'plandusite' //same cid value as in the html img src
        },
        {
            filename: 'plan-detaille-electrique.pdf',
            path: __dirname +'/plan-detaille-electrique.pdf',
            cid: 'plandetaille' //same cid value as in the html img src
        },
        {
            filename: 'badge-benevole.png',
            path: __dirname +'/badge-benevole.png',
            cid: 'badgebenevole' //same cid value as in the html img src
        },     */  
    ]
    }


   /* 
   SENDMAIL :
   */
   await SENDMAIL(options, (info) => {
        console.log('\t\t'+t.obj.name+' '+t.obj.email+' => OK (id:'+info.messageId+')\n');
       // console.log("Email sent successfully");
       // console.log("MESSAGE ID: ", info.messageId);
    }); 
    
}





function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const initAcelMailer = async () => {
    const v = await initAndProcessVolunteerList();
//    console.dir(v.volunteers[0], {depth:null});
    console.dir(v.errors);
    for(let i=0; i < v.volunteers.length ; i++){
        
        let t = processVolunteerThankingMailTemplate(v.volunteers[i]);
        
      //  console.dir(t,{depth:null});

        console.log((new Date().toISOString())+' Processing : '+t.obj.name+' '+t.obj.email);
       await sendMail(t);
       await sleep(3000);
      // break;
    }
    



}
initAcelMailer();