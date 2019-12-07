const sgEmail = require('@sendgrid/mail')

const domainEmail = 'a.zhelepov@gmail.com'
sgEmail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgEmail.send({
        to: email,
        from: domainEmail,
        subject: 'Welcome',
        text: 'Thank you, ' + name + ', for joining the app!'
    })
}

const sendFinalEmail = (email, name) => {
    sgEmail.send({
        to: email,
        from: domainEmail,
        subject: 'Bye, ' + name + '!',
        text: 'Goodbye though! What can we do for you that you stay with us, ' + name + '?'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendFinalEmail
}